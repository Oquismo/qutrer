import React from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";

export default function Navbar({ user }) {
  return (
    <nav className="sticky top-0 z-50 bg-[#15202B] border-b border-gray-800">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center h-14 px-4">
          <div className="flex space-x-4">
            <Link 
              to="/" 
              className="text-gray-200 hover:text-white px-4 py-2 text-base font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Inicio
            </Link>
            <Link 
              to="/profile" 
              className="text-gray-200 hover:text-white px-4 py-2 text-base font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Perfil
            </Link>
          </div>

          {user && (
            <button 
              onClick={() => auth.signOut()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-medium rounded-full transition-colors"
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}