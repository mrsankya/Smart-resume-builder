// ============================================
// canva.controller.js - Canva Integration Controller
// ============================================

import {
  getCanvaAuthorizationUrl,
  exchangeCodeForToken,
  getCanvaUserDesigns,
  importCanvaDesignToPlatform,
} from '../services/canva.service.js';

// Simple in-memory user token map for active sessions
const userCanvaTokens = new Map();

/**
 * GET /api/canva/auth-url
 * Returns authorization URL for Canva Connect OAuth
 */
export const getCanvaAuthUrl = async (req, res) => {
  try {
    const { redirectUri } = req.query;
    const authData = getCanvaAuthorizationUrl(req.user._id, redirectUri);

    return res.status(200).json({
      success: true,
      url: authData.url,
      state: authData.state,
    });
  } catch (error) {
    console.error('Error generating Canva auth URL:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate Canva authorization URL',
      error: error.message,
    });
  }
};

/**
 * GET /api/canva/callback
 * Handles OAuth 2.0 callback from Canva
 */
export const handleCanvaCallback = async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (error) {
      return res.redirect(`${clientUrl}/templates?canva_error=${encodeURIComponent(error_description || error)}`);
    }

    if (!code || !state) {
      return res.redirect(`${clientUrl}/templates?canva_error=Missing+code+or+state`);
    }

    const tokenData = await exchangeCodeForToken(code, state);

    if (tokenData.userId) {
      userCanvaTokens.set(tokenData.userId, tokenData.accessToken);
    }

    // Redirect to frontend with success indicator and temporary token
    return res.redirect(
      `${clientUrl}/templates?canva_connected=true&canva_token=${encodeURIComponent(tokenData.accessToken)}`
    );
  } catch (error) {
    console.error('Canva callback error:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/templates?canva_error=${encodeURIComponent(error.message)}`);
  }
};

/**
 * GET /api/canva/designs
 * Fetches user's Canva resume designs
 */
export const getCanvaDesigns = async (req, res) => {
  try {
    let accessToken = req.headers['x-canva-token'] || userCanvaTokens.get(req.user._id.toString());

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'No Canva account connected. Please connect your Canva account first.',
        needsAuth: true,
      });
    }

    const query = req.query.query || 'resume';
    const designs = await getCanvaUserDesigns(accessToken, query);

    return res.status(200).json({
      success: true,
      data: designs,
    });
  } catch (error) {
    console.error('Error fetching Canva designs:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch Canva designs',
      error: error.message,
    });
  }
};

/**
 * POST /api/canva/import
 * Imports a selected Canva design into the Smart Resume Builder platform
 */
export const importCanvaDesign = async (req, res) => {
  try {
    const { designId, title, category, description, canvaToken } = req.body;

    let accessToken = canvaToken || userCanvaTokens.get(req.user._id.toString());

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Canva token missing. Please reconnect Canva.',
      });
    }

    if (!designId) {
      return res.status(400).json({
        success: false,
        message: 'Canva design ID is required.',
      });
    }

    const isAdmin =
      req.user.email?.toLowerCase() === 'sanketbhende0@gmail.com' ||
      req.user.role === 'admin';

    const template = await importCanvaDesignToPlatform(
      req.user._id,
      { designId, title, category, description },
      accessToken,
      isAdmin
    );

    return res.status(201).json({
      success: true,
      message: isAdmin
        ? '🎉 Canva template imported and published live on the platform!'
        : '🎉 Canva template imported! It is submitted for admin review before going live.',
      data: template,
    });
  } catch (error) {
    console.error('Error importing Canva design:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to import Canva design',
      error: error.message,
    });
  }
};
