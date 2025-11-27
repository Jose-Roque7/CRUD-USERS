import axios from 'axios';
import { useAuthStore } from './authStore'; // importa el store

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;


    if (typeof window !== 'undefined') {
      // Solo si estaba logueado
      if (status === 401 || status === 403) {
        // Cambiar estado a deslogueado
        useAuthStore.setState({ isLoggedIn: false });

        // Redirigir a login
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
