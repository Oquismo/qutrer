// src/components/GoogleLoginButton.jsx
import React from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { Button } from "@mui/material"; // O cualquier otro componente de botón que uses

const GoogleLoginButton = () => {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      console.log("Usuario autenticado con Google");
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error.message);
    }
  };

  return (
    <Button variant="contained" onClick={handleGoogleLogin}>
      Iniciar sesión con Google
    </Button>
  );
};

export default GoogleLoginButton;