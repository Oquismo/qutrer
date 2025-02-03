import React, { useState, useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
const AdminIcon = React.lazy(() => import('./AdminIcon'));

const DEFAULT_PROFILE_IMAGE = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const [userImage, setUserImage] = useState(DEFAULT_PROFILE_IMAGE);

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

  return (
    <nav className="sticky top-0 z-50 bg-[#15202B] border-b border-gray-800">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center h-14 px-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-gray-200 hover:text-white px-4 py-2 text-base font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Inicio
            </Link>
            {user && (
              <Link 
                to={`/profile/${user.uid}`}
                className="flex items-center text-gray-200 hover:text-white px-4 py-2 text-base font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                  <img 
                    src={userImage}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = DEFAULT_PROFILE_IMAGE;
                    }}
                  />
                </div>
                <span>Mi Perfil</span>
                {isAdmin && (
                  <Suspense fallback={<span>Cargando...</span>}>
                    <AdminIcon className="ml-2" />
                  </Suspense>
                )}
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