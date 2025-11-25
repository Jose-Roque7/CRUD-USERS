import { create } from 'zustand';
import api from '../lib/axios';

// Definimos los tipos del estado
interface AuthState {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  fetchPerfil: () => Promise<void>;  // Acción asíncrona para obtener el perfil
}

// Creamos el store con Zustand
export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null, // Cargar el token desde localStorage

  // Acción para iniciar sesión y guardar el token
  login: (token: string) => {
    localStorage.setItem('token', token);  // Guardamos el token en localStorage
    set({ token });  // Actualizamos el estado global con el token
  },

  // Acción para cerrar sesión y eliminar el token
  logout: () => {
    localStorage.removeItem('token');  // Eliminamos el token de localStorage
  },

  // Acción asíncrona para intentar obtener el perfil y verificar el token
  fetchPerfil: async () => {
    try {
      const response = await api.get('/perfil'); // Verificamos si el token es válido haciendo una llamada a la API
      const token = localStorage.getItem('token');
      
      if (response.status === 200 && token) {
        set({ token });  // Si la respuesta es válida, actualizamos el token en el estado
      } else {
        throw new Error('Token inválido o expirado');
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      localStorage.removeItem('token');  // Si hay un error (como token expirado), eliminamos el token
      set({ token: null });  // Restablecemos el estado global
    }
  },
}));
