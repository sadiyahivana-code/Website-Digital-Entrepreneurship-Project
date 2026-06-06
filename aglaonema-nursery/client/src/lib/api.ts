import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // Token expired - handled per component
    }
    return Promise.reject(err);
  }
);

export default api;
