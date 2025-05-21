import React, { useState, useEffect, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore"; // Added onSnapshot
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import ColorSlider from "./ColorSlider"; // Asegúrate de que esta importación esté al inicio

const AdminIcon = React.lazy(() => import('./AdminIcon'));

const DEFAULT_PROFILE_IMAGE = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
const PrevLogo = require('../components/img/prevlogo3.png')
export default function Navbar() {
  const { authUser: user, isAdmin, profile } = useAuth(); // Updated to use authUser and get profile
  const [userImage, setUserImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [searchQuery, setSearchQuery] = useState("");
  const [brightness, setBrightness] = useState(100);
  const [showMenu, setShowMenu] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0); // State for unread messages
  const navigate = useNavigate();

  useEffect(() => {
    // Prefer photoURL from profile if available, fallback to existing logic or default
    if (profile?.photoURL) {
      setUserImage(profile.photoURL);
    } else if (user?.uid) { // user here is authUser
      const fetchUserImage = async () => {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserImage(userData.photoURL || DEFAULT_PROFILE_IMAGE);
        } else {
          setUserImage(DEFAULT_PROFILE_IMAGE); // Fallback if no doc
        }
      };
      fetchUserImage();
    } else {
      setUserImage(DEFAULT_PROFILE_IMAGE); // Fallback if no user
    }
  }, [user, profile]); // Depend on user (authUser) and profile

  useEffect(() => {
    document.body.style.filter = `brightness(${brightness}%)`;
  }, [brightness]);

  // Effect to listen for unread messages
  useEffect(() => {
    if (!user?.uid) {
      setTotalUnreadCount(0);
      return;
    }

    const conversationsRef = collection(db, "conversations");
    const q = query(conversationsRef, where("participants", "array-contains", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let unreadSum = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        unreadSum += data.unread?.[user.uid] || 0;
      });
      setTotalUnreadCount(unreadSum);
    }, (error) => {
      console.error("Error fetching unread messages count:", error);
      setTotalUnreadCount(0); // Reset on error
    });

    return () => unsubscribe(); // Cleanup listener on component unmount or user change
  }, [user?.uid]);


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
              className="relative text-gray-200 hover:text-white px-4 py-2 text-base font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Mensajes
              {totalUnreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-5 w-5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                </span>
              )}
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