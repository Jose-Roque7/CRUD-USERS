"use client";

import { useEffect, useState } from "react";
import { loginUser } from "../lib/auth";
import {toast} from 'react-hot-toast';
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaLock } from "react-icons/fa"; // Usamos React Icons para los íconos
import { motion } from "framer-motion"; // Para animaciones


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingS, setLoadingS] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();  // Asumiendo que el token está en el store

  useEffect(() => {
    // Evitar redirección si el token es null en el primer render
    if (token !== null) {
      router.push('/dashboard');  // Redirigir a la página de inicio
    }
  }, [token, router]);  // Dependencias para que la redirección ocurra cuando cambie el token

    useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // 1500 ms = 1.5 segundos

    return () => clearTimeout(timer);
  }, []);

  // --- LOADING ---
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita la recarga de la página
    try {
      const res = await loginUser(email, password); // Llamada a la API para autenticar al usuario

      // Verificamos si la respuesta tiene el access_token
      if (res && res.access_token) {
        const { access_token } = res;

        // Guardamos el token en localStorage (si es necesario)
        localStorage.setItem('token', access_token);

        // Establecemos el estado de autenticación en zustand
        login(access_token); // Aquí asumimos que `login` es una función en tu store zustand

        toast.success("Inicio de sesión exitoso");
        
        // Redirigimos al dashboard
        router.push("/dashboard");
      } else {
        toast.error("Error: No se pudo autenticar correctamente. Intenta nuevamente.");
      }
    } catch (err) {
      toast.error("Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  return   (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#1a1a1a", // Fondo oscuro para el diseño premium
      }}
    >
      <motion.form
        onSubmit={handleSubmit}
        style={{
          padding: "40px 30px",
          background: "#121212", // Fondo oscuro para el formulario
          borderRadius: "12px",
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          border: "none",
          boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.3)", // Sombra premium
        }}
        initial={{ opacity: 0, y: 20 }} // Animación de entrada
        animate={{ opacity: 1, y: 0 }} // Animación de entrada
        transition={{ duration: 0.6 }}
      >
        <h2 style={{ textAlign: "center", color: "#fff", marginBottom: "20px" }}>
          Iniciar Sesión
        </h2>

        {/* Correo electrónico */}
        <div style={{ position: "relative" }}>
          <FaEnvelope
            style={{
              position: "absolute",
              top: "50%",
              left: "12px",
              transform: "translateY(-50%)",
              color: "#888",
              fontSize: "18px",
            }}
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "14px 40px", // Espacio para el ícono
              borderRadius: "10px",
              background: "#2a2a2a",
              border: "1px solid #444",
              color: "#fff",
              width: "100%",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.3s",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0070f3")}
            onBlur={(e) => (e.target.style.borderColor = "#444")}
          />
        </div>

        {/* Contraseña */}
        <div style={{ position: "relative" }}>
          <FaLock
            style={{
              position: "absolute",
              top: "50%",
              left: "12px",
              transform: "translateY(-50%)",
              color: "#888",
              fontSize: "18px",
            }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "14px 40px", // Espacio para el ícono
              borderRadius: "10px",
              background: "#2a2a2a",
              border: "1px solid #444",
              color: "#fff",
              width: "100%",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.3s",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0070f3")}
            onBlur={(e) => (e.target.style.borderColor = "#444")}
          />
        </div>

        {/* Botón de submit */}
        <motion.button
          type="submit"
          disabled={loading}
          style={{
            padding: "14px",
            borderRadius: "10px",
            background: loading ? "#555" : "#0070f3",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
            transition: "background-color 0.3s ease",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
            marginTop: "10px",
          }}
          whileHover={{ scale: 1.05 }} // Efecto hover de Framer Motion
          whileTap={{ scale: 0.98 }} // Efecto de pulsación al hacer clic
        >
          {loading ? "Ingresando..." : "Entrar"}
        </motion.button>
      </motion.form>
    </div>
  );
}
