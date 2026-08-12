// ============================================
// canva.service.js - Canva Connect API Service
// ============================================

import crypto from 'crypto';
import Template from '../models/Template.model.js';

const CANVA_API_BASE = 'https://api.canva.com/rest/v1';
const CANVA_AUTH_BASE = 'https://www.canva.com/api/oauth/authorize';

// In-memory PKCE state storage (maps state -> { codeVerifier, userId })
const pkceSessions = new Map();

/**
 * Generate PKCE code_verifier and code_challenge (S256)
 */
export const generatePKCE = () => {
  const codeVerifier = crypto
    .randomBytes(32)
    .toString('base64url');

  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  const state = crypto.randomBytes(16).toString('hex');

  return { codeVerifier, codeChallenge, state };
};

/**
 * Build the Canva OAuth Authorization URL
 */
export const getCanvaAuthorizationUrl = (userId, customRedirectUri) => {
  const clientId = process.env.CANVA_CLIENT_ID;
  const redirectUri = customRedirectUri || process.env.CANVA_REDIRECT_URI || 'http://localhost:5000/api/canva/callback';

  const { codeVerifier, codeChallenge, state } = generatePKCE();

  pkceSessions.set(state, {
    codeVerifier,
    userId: userId?.toString(),
    redirectUri,
    createdAt: Date.now(),
  });

  // Clean old sessions (> 15 mins)
  for (const [key, val] of pkceSessions.entries()) {
    if (Date.now() - val.createdAt > 15 * 60 * 1000) {
      pkceSessions.delete(key);
    }
  }

  const scopes = [
    'design:content:read',
    'design:meta:read',
    'asset:read',
    'profile:read',
  ].join(' ');

  const params = new URLSearchParams({
    code_challenge: codeChallenge,
    code_challenge_method: 's256',
    scope: scopes,
    response_type: 'code',
    client_id: clientId,
    state,
    redirect_uri: redirectUri,
  });

  return {
    url: `${CANVA_AUTH_BASE}?${params.toString()}`,
    state,
  };
};

/**
 * Exchange Authorization Code for Access Token
 */
export const exchangeCodeForToken = async (code, state) => {
  const session = pkceSessions.get(state);
  if (!session) {
    throw new Error('Invalid or expired Canva OAuth session state.');
  }

  const clientId = process.env.CANVA_CLIENT_ID;
  const clientSecret = process.env.CANVA_CLIENT_SECRET;
  const redirectUri = session.redirectUri;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code_verifier: session.codeVerifier,
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(`${CANVA_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || data.message || 'Failed to exchange Canva token');
  }

  pkceSessions.delete(state);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    userId: session.userId,
  };
};

/**
 * List Resume Designs from User's Canva Account
 */
export const getCanvaUserDesigns = async (accessToken, query = 'resume') => {
  const url = new URL(`${CANVA_API_BASE}/designs`);
  if (query) url.searchParams.append('query', query);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch designs from Canva');
  }

  return data.items || [];
};

/**
 * Export a Canva Design and get download URLs
 */
export const exportCanvaDesign = async (accessToken, designId, format = 'pdf') => {
  // Step 1: Create Export Job
  const createJobRes = await fetch(`${CANVA_API_BASE}/exports`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      design_id: designId,
      format: {
        type: format === 'png' ? 'png' : 'pdf',
      },
    }),
  });

  const jobData = await createJobRes.json();

  if (!createJobRes.ok) {
    throw new Error(jobData.message || 'Failed to trigger Canva export');
  }

  const exportId = jobData.job?.id || jobData.id;

  // Step 2: Poll Export Job until ready
  let attempts = 0;
  const maxAttempts = 15;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const pollRes = await fetch(`${CANVA_API_BASE}/exports/${exportId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const statusData = await pollRes.json();
    const job = statusData.job || statusData;

    if (job.status === 'success') {
      return {
        exportId,
        urls: job.urls || [],
      };
    } else if (job.status === 'failed') {
      throw new Error(job.error?.message || 'Canva export job failed');
    }

    attempts++;
  }

  throw new Error('Canva export timed out. Please try again.');
};

/**
 * Download Canva Asset Buffer and Create Template Record in DB
 */
export const importCanvaDesignToPlatform = async (userId, designInfo, accessToken, isAdmin = false) => {
  const { designId, title, category = 'Creative', description = '' } = designInfo;

  // Export from Canva
  const exportResult = await exportCanvaDesign(accessToken, designId, 'pdf');
  const downloadUrl = exportResult.urls[0];

  let fileUrl = downloadUrl;

  // Download buffer to encode or store
  try {
    const fileRes = await fetch(downloadUrl);
    if (fileRes.ok) {
      const buffer = await fileRes.arrayBuffer();
      const b64 = Buffer.from(buffer).toString('base64');
      fileUrl = `data:application/pdf;base64,${b64}`;
    }
  } catch (err) {
    console.warn('Could not cache Canva PDF buffer, using live URL:', err.message);
  }

  const slug = `canva-${(title || 'resume').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

  const template = await Template.create({
    name: title || 'Canva Custom Resume',
    slug,
    category,
    description: description || 'Imported directly from Canva design library.',
    fileUrl,
    fileType: 'pdf',
    layout: 'two-column',
    colors: {
      primary: '#7c3aed',
      secondary: '#0f172a',
      accent: '#06b6d4',
      bg: '#ffffff',
      headerBg: '#f8fafc',
    },
    status: isAdmin ? 'approved' : 'pending',
    isLive: isAdmin ? true : false,
    isOfficial: isAdmin ? true : false,
    submittedBy: userId,
    tags: ['canva', 'imported', category.toLowerCase()],
  });

  return template;
};
