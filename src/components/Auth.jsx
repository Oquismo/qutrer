// src/components/Auth.jsx
import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error al registrarse:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#15202B]">
      <div className="bg-[#192734] p-8 rounded-lg w-full max-w-md mx-auto">
        <h1 className="text-white text-2xl font-bold mb-6">Iniciar sesión / Registrarse</h1>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-[#15202B] text-white border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-3 rounded-lg bg-[#15202B] text-white border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-4">
            <button 
              onClick={handleLogin}
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              Iniciar sesión
            </button>
            <button 
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-[#22303C] hover:bg-[#2C3C4C] text-white font-bold py-2 px-4 rounded-lg border border-gray-800 transition-colors disabled:opacity-50"
            >
              Registrarse
            </button>
          </div>
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#22303C] hover:bg-[#2C3C4C] text-white font-bold py-2 px-4 rounded-lg border border-gray-800 transition-colors disabled:opacity-50"
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google"
              className="w-5 h-5"
            />
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    </div>
  );
}