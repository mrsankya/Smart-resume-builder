// ============================================
// google.config.js - Google OAuth Configuration
// ============================================

import { OAuth2Client } from 'google-auth-library';

const getGoogleClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  return new OAuth2Client(clientId);
};

const verifyGoogleToken = async (credential) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const error = new Error('GOOGLE_CLIENT_ID is not configured in server environment variables.');
    error.statusCode = 500;
    throw error;
  }

  try {
    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      const error = new Error('Invalid Google token: Missing email or user profile.');
      error.statusCode = 401;
      throw error;
    }

    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || '',
    };
  } catch (error) {
    console.error('Google token verification failed:', error.message);
    if (!error.statusCode) {
      error.statusCode = 401;
    }
    throw error;
  }
};

export { verifyGoogleToken };
