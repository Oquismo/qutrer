// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";

export default function Navbar({ user }) {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="nav-links">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/profile" className="nav-link">Perfil</Link>
        </div>
        {user && (
          <button 
            onClick={() => auth.signOut()}
            className="btn btn-danger"
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
}