import api from "./axios"; // tu axios ya configurado
import { useAuthStore } from "./authStore";

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post('/login/auth', { email, password });

    if (response.data.success && response.data.data?.access_token) {
      // Login exitoso
      useAuthStore.setState({ isLoggedIn: true });
      return { data: response.data.data };
    }

    // Login fallido, retorna mensaje
    return { error: response.data.message };
  } catch (err) {
    // Cualquier error inesperado
    return { error: 'Ocurrió un error al iniciar sesión' };
  }
};

import { useEffect } from "react";
import { useRouter } from "next/navigation";


export function useLoginTrue() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      const isLoggedIn = useAuthStore.getState().isLoggedIn;
      if (isLoggedIn) {
        router.push("/dashboard"); // redirige una sola vez
        clearInterval(interval);   // detiene el intervalo    
      }
    }, 1000); // cada 1 segundo

    return () => clearInterval(interval);
  }, [router]);
}
