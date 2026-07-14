import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999';
const BASE_URL = `${API_BASE_URL}/api`;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
});

apiClient.interceptors.request.use(
  (config) => {
    const creds = sessionStorage.getItem('authCredentials');
    if (creds) {
      try {
        const { email, password } = JSON.parse(creds);
        const encoded = btoa(`${email}:${password}`);
        config.headers['Authorization'] = `Basic ${encoded}`;
      } catch (e) {
        console.error('Failed to parse auth credentials', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const apiCall = async (url, options = {}) => {
  const method = options.method || 'GET';
  const data = options.data || options.body || null;
  const headers = options.headers || {};
  const params = options.params || null;

  try {
    const response = await apiClient({
      url,
      method,
      data,
      params,
      headers,
    });
    return response.data;
  } catch (error) {
    console.error(`API Call failed on ${url}:`, error);
    throw error.response?.data || error;
  }
};

export const setAuthCredentials = (email, password) => {
  sessionStorage.setItem('authCredentials', JSON.stringify({ email, password }));
};
export const clearAuthCredentials = () => {
  sessionStorage.removeItem('authCredentials');
};
