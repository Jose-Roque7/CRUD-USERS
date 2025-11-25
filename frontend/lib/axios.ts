import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.NEXT_PUBLIC_API_KEY, // API Key
  },
});

// Interceptor para agregar automáticamente el token JWT
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token'); // Leer token desde localStorage

      if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Añadir token a los headers
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores y redirigir si es necesario
api.interceptors.response.use(
  (response) => response, // Si la respuesta es correcta, la retornamos
  (error) => {
    // Verificamos si el error es de autorización (ejemplo: error 403)
    if (error.response) {
      console.log('Error response:', error.response); // Ver respuesta de error
      if (error.response.status === 403) {
        console.log('Error 403 detectado'); // Confirmamos que el error es 403

        // Eliminamos el token del localStorage
        localStorage.removeItem('token');
        console.log('Token eliminado del localStorage');

        // Redirigimos al usuario a la página principal
        if (typeof window !== 'undefined') {
          console.log('Redirigiendo al inicio...');
          window.location.href = '/'; // Esto redirige a la página principal
        }
      }
    }

    // Devolvemos el error para que lo maneje la llamada original
    return Promise.reject(error);
  }
);

export default api;
