import api from "./axios"; // tu axios ya configurado
export async function loginUser(email: string, password: string) {
  try {
    const response = await api.post("/login/auth", {
      email,
      password,
    });
    return response.data; // devuelve datos al componente
  } catch (error: any) {
    // Manejo de errores limpio
    throw error.response?.data?.message || "Error al iniciar sesión";
  }
}