import React, { useState, useEffect, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import ColorSlider from "./ColorSlider"; // Asegúrate de que esta importación esté al inicio

const AdminIcon = React.lazy(() => import('./AdminIcon'));

const DEFAULT_PROFILE_IMAGE = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
const PrevLogo = require('../components/img/prevlogo3.png')
export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const [userImage, setUserImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [searchQuery, setSearchQuery] = useState("");
  const [brightness, setBrightness] = useState(100);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserImage = async () => {
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserImage(userData.photoURL || DEFAULT_PROFILE_IMAGE);
        }
      }
    };

    fetchUserImage();
  }, [user]);

  useEffect(() => {
    document.body.style.filter = `brightness(${brightness}%)`;
  }, [brightness]);

  const findUserByUsername = async (key) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("usernameLower", "==", key.trim().toLowerCase()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    return null;
  };

  const handleSearch = async (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const queryText = searchQuery.trim();
      if (queryText.startsWith("@")) {
        const username = queryText.slice(1);
        const uid = await findUserByUsername(username);
        if (uid) {
          navigate(`/profile/${uid}`);
        } else {
          // Handle user not found error
        }
      } else {
        navigate(`/search?q=${encodeURIComponent(queryText)}`);
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#15202B] sm:border-b sm:border-gray-800">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-gray-200 hover:text-white px-4 py-2 text-base font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Inicio
            </Link>
            <button
              onClick={() => navigate("/inbox")}
              className="text-gray-200 hover:text-white px-4 py-2 text-base font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Mensajes
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Buscar..."
              className="px-3 py-1 rounded-full bg-gray-700 text-white outline-none sm:w-auto w-24"
            />
            <img src={PrevLogo} alt="Logo" className="h-10" /> {/* Ajustar tamaño con Tailwind */}
          </div>

          {user && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center space-x-2 text-gray-200 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                <img 
                  src={userImage}
                  alt="Perfil"
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    e.target.src = DEFAULT_PROFILE_IMAGE;
                  }}
                />
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#192734] ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <Link
                      to={`/profile/${user.uid}`}
                      className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
                      onClick={() => setShowMenu(false)}
                    >
                      Mi Perfil
                      {isAdmin && (
                        <Suspense fallback={<span>Cargando...</span>}>
                          <AdminIcon className="ml-2" />
                        </Suspense>
                      )}
                    </Link>
                    <div className="px-4 py-2">
                      <ColorSlider width={150} />
                    </div>
                    <button
                      onClick={() => {
                        auth.signOut();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-800"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}