// src/components/GoogleLoginButton.jsx
import React, { useState } from "react";
import { auth, googleProvider, db, registerWithEmailAndPassword, loginWithEmailAndPassword } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/auth.css';  // Añadir esta línea

const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Nuevo estado
  const [isRegistering, setIsRegistering] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Resultado de autenticación:", result.user); // Para debug
      console.log("Foto de perfil:", result.user.photoURL); // Para debug

      // Crear o actualizar documento de usuario
      const userRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || result.user.email?.split('@')[0],
          photoURL: result.user.photoURL,
          followers: [],
          following: [],
          createdAt: serverTimestamp()
        });
      }
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
        if (!username) {
          alert("Por favor, ingresa un nombre de usuario");
          return;
        }
        // Registrar usuario con nombre de usuario personalizado
        await registerWithEmailAndPassword(email, password, username);
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
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#15202B]">
      <div className="auth-container bg-[#15202B] p-8 rounded-lg w-full max-w-md mx-auto">
        <div className="welcome-header flex justify-center w-full">
          <h1 className="text-white text-center text-2xl font-bold my-6">Bienvenido</h1>
        </div>

        <h2 className="text-white text-xl mb-4">
          {isRegistering ? "Crear una cuenta" : "Iniciar sesión"}
        </h2>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isRegistering && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
              className="w-full p-3 rounded-lg bg-[#192734] text-white border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="w-full p-3 rounded-lg bg-[#192734] text-white border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full p-3 rounded-lg bg-[#192734] text-white border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
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
          className="w-full text-gray-400 hover:text-white mt-4 text-sm transition-colors"
        >
          {isRegistering 
            ? "← ¿Ya tienes cuenta? Inicia sesión" 
            : "✨ ¿No tienes cuenta? Regístrate"}
        </button>

        <div className="relative flex items-center justify-center my-6">
          <hr className="w-full border-gray-800" />
          <span className="absolute bg-[#15202B] px-4 text-gray-500">o</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-[#192734] hover:bg-[#22303C] text-white font-semibold py-3 px-4 rounded-lg border border-gray-800 transition-colors"
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            className="w-5 h-5"
          />
          {loading ? "Conectando..." : "Continuar con Google"}
        </button>
      </div>
    </div>
  );
};

export default GoogleLoginButton;