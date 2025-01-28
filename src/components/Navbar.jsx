// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";

export default function Navbar({ user }) {
  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-2xl mx-auto flex justify-between items-center">
        <div className="flex gap-4">
          <Link to="/" className="font-medium hover:text-blue-500">Inicio</Link>
          <Link to="/profile" className="font-medium hover:text-blue-500">Perfil</Link>
        </div>
        {user && (
          <button 
            onClick={() => auth.signOut()}
            className="text-red-500 hover:text-red-700"
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
}