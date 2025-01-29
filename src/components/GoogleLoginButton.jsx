// src/components/GoogleLoginButton.jsx
import React, { useState } from "react";
import { auth, googleProvider, registerWithEmailAndPassword, loginWithEmailAndPassword } from "../firebase";
import { signInWithPopup } from "firebase/auth";

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
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-8 text-white">
        {isRegistering ? "Crear una cuenta" : "Iniciar sesión"}
      </h2>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="auth-input"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="auth-input"
          />
        </div>
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
        className="w-full text-center py-3 text-blue-400 hover:text-blue-500 mt-4 transition-all duration-200 font-medium border border-transparent hover:border-blue-500/20 rounded-full"
      >
        {isRegistering 
          ? "¿Ya tienes cuenta? Inicia sesión" 
          : "¿No tienes cuenta? Regístrate"}
      </button>

      <div className="relative flex items-center justify-center my-6">
        <hr className="w-full border-gray-600" />
        <span className="absolute bg-[#15202b] px-4 text-gray-500">o</span>
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