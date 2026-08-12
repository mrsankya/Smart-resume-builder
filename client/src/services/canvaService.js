// ============================================
// canvaService.js - Frontend Canva Integration Service
// ============================================

import API from './api.js';

export const getCanvaAuthUrl = async (redirectUri) => {
  const response = await API.get('/canva/auth-url', {
    params: { redirectUri },
  });
  return response.data;
};

export const getCanvaDesigns = async (token) => {
  const headers = token ? { 'x-canva-token': token } : {};
  const response = await API.get('/canva/designs', { headers });
  return response.data.data;
};

export const importCanvaDesign = async ({ designId, title, category, description, canvaToken }) => {
  const response = await API.post('/canva/import', {
    designId,
    title,
    category,
    description,
    canvaToken,
  });
  return response.data;
};
