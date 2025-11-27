import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api from '../lib/axios';

interface AuthState {
  isLoggedIn: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      checkAuth: async () => {
        try {
          const res = await api.get('/perfil');
          set({ isLoggedIn: res.status === 200 });
        } catch (error) {
          set({ isLoggedIn: false });
        }
      },
      logout: async () => {
        try {
          await api.post('/login/logout');
        } catch (error) {
          console.error('Error during logout:', error);
        } finally {
          set({ isLoggedIn: false });
        }
      },
    }),
    { 
      name: 'auth-storage',
      storage: {
        getItem: (name) => {
          const value = Cookies.get(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          Cookies.set(name, JSON.stringify(value), { 
            expires: 7,
            path: '/',
            sameSite: 'strict'
          });
        },
        removeItem: (name) => {
          Cookies.remove(name, { path: '/' });
        }
      }
    }
  )
);