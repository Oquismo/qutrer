import React from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import AdminIcon from "./AdminIcon";

const DEFAULT_PROFILE_IMAGE = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

export default function Navbar() {
  const { user, isAdmin } = useAuth();

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
            {user && (
              <Link 
                to={`/profile/${user.uid}`}
                className="text-gray-200 hover:text-white px-4 py-2 text-base font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                <img 
                  src={user.photoURL || DEFAULT_PROFILE_IMAGE} 
                  alt="Perfil" 
                  className="w-8 h-8 rounded-full inline-block mr-2"
                />
                Mi Perfil {isAdmin && <AdminIcon />}
              </Link>
            )}
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