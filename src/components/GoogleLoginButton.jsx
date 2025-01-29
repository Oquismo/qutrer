// src/components/GoogleLoginButton.jsx
import React, { useState } from "react";
import { auth, googleProvider, registerWithEmailAndPassword, loginWithEmailAndPassword } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import '../styles/auth.css';  // Añadir esta línea

const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Resultado de autenticación:", result.user); // Para debug
      console.log("Foto de perfil:", result.user.photoURL); // Para debug
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmailAndPassword(email, password);
      } else {
        await loginWithEmailAndPassword(email, password);
      }
    } catch (error) {
      console.error(`Error al ${isRegistering ? 'registrar' : 'iniciar sesión'}:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="welcome-header flex justify-center w-full">
        <h1 className="welcome-title text-center text-2xl font-bold my-6">Bienvenido</h1>
        {/* <p className="welcome-subtitle">Lo que está pasando ahora</p> */}
      </div>

      <h2 className="auth-header">
        {isRegistering ? "Crear una cuenta" : "Iniciar sesión"}
      </h2>

      <form onSubmit={handleEmailAuth} className="auth-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          className="auth-input"
          autoComplete="email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="auth-input"
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={loading}
          className="auth-submit-btn"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Procesando...
            </span>
          ) : (
            isRegistering ? "Crear cuenta" : "Iniciar sesión"
          )}
        </button>
      </form>

      <button
        onClick={() => setIsRegistering(!isRegistering)}
        className="auth-toggle-btn"
      >
        {isRegistering 
          ? "← ¿Ya tienes cuenta? Inicia sesión" 
          : "✨ ¿No tienes cuenta? Regístrate"}
      </button>

      <div className="relative flex items-center justify-center my-4">
        <hr className="w-full border-gray-600" />
        <span className="absolute bg-[#1e2732] px-4 text-gray-500"></span>
      </div>

      <button 
        onClick={handleGoogleLogin}
        disabled={loading}
        className="google-auth-btn"
      >
        <img 
          src="https://www.google.com/favicon.ico" 
          alt="Google" 
          className="w-5 h-5"
        />
        {loading ? "Conectando..." : "Continuar con Google"}
      </button>
    </div>
  );
};

export default GoogleLoginButton;