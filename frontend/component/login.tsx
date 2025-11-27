"use client";

import { useEffect, useState } from "react";
import { loginUser } from "../lib/auth";
import { toast } from 'react-hot-toast';
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa"; // Usamos React Icons para los íconos
import { motion } from "framer-motion"; // Para animaciones
import {useLoginTrue} from '../lib/auth';


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const isLoggedIn = useAuthStore.getState().isLoggedIn;
  useLoginTrue();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoggedIn) {
      setLoading(false);
    }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  // --- LOADING ---
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-black">
  <div className="w-12 h-12 border-4 border-gray-700 border-t-white rounded-full animate-spin"></div>
</div>

    );
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); // Evita la recarga de la página

  const res = await loginUser(email, password);

  if (res?.data) {
    toast.success("Inicio de sesión exitoso");
    router.push("/dashboard");
  } else if (res?.error) {
    toast.error('Verifica tus credenciales por favor');
  }
};

  return (
  <div
  className="w-full min-h-screen flex justify-center items-center bg-black p-5"
>
  <motion.form
    onSubmit={handleSubmit}
    className="w-full max-w-md bg-black rounded-2xl p-8 flex flex-col gap-6 
               shadow-2xl border border-gray-800 relative overflow-hidden"
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
  >
    {/* Header */}
    <div className="text-center mb-2">
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
        <FaUser className="text-black text-2xl" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2">
        Iniciar Sesión
      </h2>
      
      <p className="text-gray-400 text-sm">
        Ingresa tus credenciales para continuar
      </p>
    </div>

    {/* Campo Email */}
    <div className="relative">
      <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 transition-colors duration-300 z-10" />
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full pl-12 pr-4 py-4 bg-black border border-gray-700 rounded-xl text-white 
                   placeholder-gray-500 focus:outline-none focus:border-white focus:bg-gray-900 
                   transition-all duration-300 font-medium"
      />
    </div>

    {/* Campo Contraseña */}
    <div className="relative">
      <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 transition-colors duration-300 z-10" />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full pl-12 pr-4 py-4 bg-black border border-gray-700 rounded-xl text-white 
                   placeholder-gray-500 focus:outline-none focus:border-white focus:bg-gray-900 
                   transition-all duration-300 font-medium"
      />
    </div>

    {/* Botón de Submit */}
    <motion.button
      type="submit"
      disabled={loading}
      className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 border
                 ${loading 
                   ? 'bg-gray-800 text-gray-400 border-gray-700 cursor-not-allowed' 
                   : 'bg-white text-black border-white hover:bg-gray-200 hover:scale-105'
                 }`}
      whileTap={loading ? {} : { scale: 0.98 }}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          Ingresando...
        </div>
      ) : (
        "Entrar al Sistema"
      )}
    </motion.button>

    {/* Línea decorativa */}
    <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent mt-2" />
  </motion.form>
</div>
);



}
