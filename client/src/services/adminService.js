// ============================================
// adminService.js - Admin API Client
// ============================================

import API from './api.js';

export const getAdminStats = async () => {
  const response = await API.get('/admin/stats');
  return response.data.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await API.get('/admin/users', { params });
  return response.data;
};

export const getUserResumes = async (userId) => {
  const response = await API.get(`/admin/users/${userId}/resumes`);
  return response.data.data;
};

export const getAdminResumes = async (params = {}) => {
  const response = await API.get('/admin/resumes', { params });
  return response.data;
};

export const getAdminResumeById = async (resumeId) => {
  const response = await API.get(`/admin/resumes/${resumeId}`);
  return response.data.data;
};

export const deleteAdminResume = async (resumeId) => {
  const response = await API.delete(`/admin/resumes/${resumeId}`);
  return response.data;
};

export const deleteAdminUser = async (userId) => {
  const response = await API.delete(`/admin/users/${userId}`);
  return response.data;
};
