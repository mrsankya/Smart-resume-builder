// ============================================
// api.js - Fetch Wrapper with Auth Token
// ============================================
// Reference: fetch(), async/await - reference-javascript.md

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return 'https://campbell-markets-mil-one.trycloudflare.com/api';
    }
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let finalUrl = `${getBaseUrl()}${endpoint}`;
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) searchParams.append(k, v);
    });
    const qs = searchParams.toString();
    if (qs) finalUrl += `?${qs}`;
  }

  const response = await fetch(finalUrl, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.response = { data, status: response.status };
    throw error;
  }

  return data;
};

const API = {
  get: (endpoint, options = {}) => fetchApi(endpoint, { method: 'GET', ...options }),

  post: (endpoint, body, options = {}) => fetchApi(endpoint, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...options,
  }),

  put: (endpoint, body, options = {}) => fetchApi(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options,
  }),

  delete: (endpoint, options = {}) => fetchApi(endpoint, {
    method: 'DELETE',
    ...options,
  }),
};

export default API;
