import React, { useState, useEffect, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext"; // Importar useNotifications
import ColorSlider from "./ColorSlider";

const AdminIcon = React.lazy(() => import('./AdminIcon'));
const NotificationsIcon = React.lazy(() => import('./icons/NotificationsIcon')); // Asumiendo que tienes un icono de notificaciones

const DEFAULT_PROFILE_IMAGE = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
const PrevLogo = require('../components/img/prevlogo3.png');

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllAsRead } = useNotifications(); // Obtener datos de notificaciones
  const [userImage, setUserImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-light-card dark:bg-dark-secondary sm:border-b sm:border-light-border dark:sm:border-dark-border">
      <div className="max-w-2xl mx-auto px-2 sm:px-4 lg:px-8"> {/* Reducido padding horizontal general en móviles */}
        <div className="flex justify-between items-center h-14 gap-1 sm:gap-2 md:gap-4"> {/* Reducido gap general */}
          <div className="flex items-center space-x-1 sm:space-x-2"> {/* Reducido space-x para el grupo izquierdo */}
            <Link 
              to="/" 
              className="text-light-text dark:text-dark-text hover:text-twitter-blue dark:hover:text-twitter-blue px-2 py-1 sm:px-3 text-xs xxs:text-sm sm:text-base font-medium rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
            >
              Inicio
            </Link>
            <button
              onClick={() => navigate("/inbox")}
              className="text-light-text dark:text-dark-text hover:text-twitter-blue dark:hover:text-twitter-blue px-2 py-1 sm:px-3 text-xs xxs:text-sm sm:text-base font-medium rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
            >
              Mensajes
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Buscar..."
              className="px-2 sm:px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-light-text dark:text-dark-text outline-none w-[60px] xxs:w-[80px] xs:w-[100px] sm:w-32 md:w-40 placeholder-gray-500 dark:placeholder-gray-400 text-xs sm:text-sm"
            />
            <img src={PrevLogo} alt="Logo" className="h-7 sm:h-8 md:h-10 flex-shrink-0" /> {/* Ajustada altura y añadido flex-shrink-0 */}
          </div>

          {user && (
            <div className="flex items-center space-x-0 xxs:space-x-1 sm:space-x-2 flex-shrink-0"> {/* Reducido space-x para el grupo derecho */}
              {/* Botón de Tema */}
              <button
                onClick={toggleTheme}
                className="p-1 xxs:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-light-text dark:text-dark-text transition-colors"
              >
                {theme === 'light' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 xxs:w-5 xxs:h-5 sm:w-6 sm:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 008.998-5.998z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 xxs:w-5 xxs:h-5 sm:w-6 sm:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                )}
              </button>

              {/* Botón de Notificaciones */}
              <div className="relative">
                <button
                  onClick={handleNotificationClick}
                  className="p-1 xxs:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-light-text dark:text-dark-text transition-colors relative"
                >
                  <Suspense fallback={<span>...</span>}>
                    <NotificationsIcon className="w-4 h-4 xxs:w-5 xxs:h-5 sm:w-6 sm:h-6" />
                  </Suspense>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-1.5 w-1.5 xxs:h-2 xxs:w-2 rounded-full ring-1 xxs:ring-2 ring-white bg-red-500" />
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-96 overflow-y-auto rounded-md shadow-lg bg-light-card dark:bg-dark-card ring-1 ring-black ring-opacity-5 p-4 space-y-2">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div key={notif.id} className={`p-2 rounded ${notif.read ? 'opacity-60' : 'font-semibold'} text-sm`}>
                          {notif.message}
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(notif.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No tienes notificaciones.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Menú de Usuario */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-1 text-light-text dark:text-dark-text hover:text-twitter-blue dark:hover:text-twitter-blue p-1 xxs:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <img 
                    src={userImage}
                    alt="Perfil"
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                    onError={(e) => {
                      e.target.src = DEFAULT_PROFILE_IMAGE;
                    }}
                  />
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 hidden xxs:block" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-light-card dark:bg-dark-card ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to={`/profile/${user.uid}`}
                        className="flex items-center px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-700"
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
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}