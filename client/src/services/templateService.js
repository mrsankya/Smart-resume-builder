// ============================================
// templateService.js - Dynamic Template API Service
// ============================================

import API from './api.js';

export const getLiveTemplates = async (params = {}) => {
  const response = await API.get('/templates', { params });
  return response.data.data;
};

export const getTemplateById = async (id) => {
  const response = await API.get(`/templates/${id}`);
  return response.data.data;
};

export const submitCustomTemplate = async (formData) => {
  const response = await API.post('/templates/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAdminAllTemplates = async () => {
  const response = await API.get('/templates/admin/all');
  return response.data.data;
};

export const approveTemplate = async (id) => {
  const response = await API.put(`/templates/admin/${id}/approve`);
  return response.data;
};

export const rejectTemplate = async (id) => {
  const response = await API.put(`/templates/admin/${id}/reject`);
  return response.data;
};

export const createOfficialTemplate = async (formData) => {
  const response = await API.post('/templates/admin/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteTemplate = async (id) => {
  const response = await API.delete(`/templates/admin/${id}`);
  return response.data;
};
