// src/components/GoogleLoginButton.jsx
import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { Button } from "@mui/material"; // O cualquier otro componente de botón que uses

const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);

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

  return (
    <Button 
      variant="contained" 
      onClick={handleGoogleLogin}
      disabled={loading}
      className="bg-blue-500 hover:bg-blue-600"
    >
      {loading ? "Iniciando sesión..." : "Iniciar sesión con Google"}
    </Button>
  );
};

export default GoogleLoginButton;