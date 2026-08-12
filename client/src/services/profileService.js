// ============================================
// profileService.js - User Master Profile API
// ============================================

import API from './api.js';

export const getMasterProfile = async () => {
  const response = await API.get('/auth/profile');
  return response.data.data;
};

export const updateMasterProfile = async (profileData) => {
  const response = await API.put('/auth/profile', profileData);
  return response.data.data;
};
