import React, { useState, Suspense } from "react";
import { formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate, Link } from "react-router-dom";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import TweetActions from "./TweetActions";
import FollowButton from './FollowButton';
import { deleteTweet, isUserAdmin } from "../firebase";
import { useAuth } from '../context/AuthContext';

// Declarar AdminIcon junto a los demás imports
const AdminIcon = React.lazy(() => import('./AdminIcon'));

const DEFAULT_PROFILE_IMAGE = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

export default React.memo(function Tweet({ tweet: initialTweet, currentUser, isDetail = false }) {
  const [tweet, setTweet] = useState(initialTweet);
  const timestamp = tweet.timestamp?.toDate();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  React.useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await isUserAdmin(tweet.userId);
      setIsAdmin(adminStatus);
    };
    checkAdmin();
  }, [tweet.userId]);

  React.useEffect(() => {
    if (authUser?.uid === tweet.userId && authUser?.photoURL) {
      setTweet((prevTweet) => ({
        ...prevTweet,
        userImage: authUser.photoURL,
      }));
    }
  }, [authUser, tweet.userId]);

  React.useEffect(() => {
    const fetchUserImage = async () => {
      const userRef = doc(db, "users", tweet.userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setTweet((prevTweet) => ({
          ...prevTweet,
          userImage: userData.photoURL || DEFAULT_PROFILE_IMAGE,
        }));
      }
    };

    fetchUserImage();
  }, [tweet.userId]);

  const handleDelete = React.useCallback(async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tweet?')) {
      try {
        await deleteTweet(tweet.id, currentUser);
      } catch (error) {
        console.error("Error al eliminar tweet:", error);
      }
    }
  }, [tweet.id, currentUser]);

  const handleClick = React.useCallback((e) => {
    if (isDetail) return; // No navegar si ya estamos en la vista detalle
    if (e.target.closest('button') || e.target.closest('a')) return; // No navegar si se clickea en botones o links
    navigate(`/tweet/${tweet.id}`);
  }, [isDetail, tweet.id, navigate]);

  const preventPropagation = (e) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      onClick={handleClick}
      className={`p-4 border-b border-gray-800 relative ${
        !isDetail ? 'hover:bg-gray-900/30 cursor-pointer group' : ''
      } transition-all duration-200`}
      role="article"
    >
      {!isDetail && (
        <div className="absolute right-4 bottom-4 text-gray-500 text-sm px-2 py-1 rounded-full border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
            Ver detalles
          </span>
        </div>
      )}
      <div className="flex space-x-3">
        <Link 
          to={`/profile/${tweet.userId}`}
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <img 
            src={tweet.userImage || DEFAULT_PROFILE_IMAGE} 
            alt={tweet.username} 
            className="w-12 h-12 rounded-full ring-2 ring-gray-800 group-hover:ring-gray-700 transition-all cursor-pointer hover:ring-blue-500"
            onError={(e) => {
              e.target.src = DEFAULT_PROFILE_IMAGE;
            }}
          />
        </Link>
        <div className="flex-1 min-w-0" onClick={preventPropagation}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link 
                to={`/profile/${tweet.userId}`} 
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="font-bold text-white">
                  {tweet.displayName || tweet.username?.split('@')[0] || 'Usuario'}
                </span>
              </Link>
              {isAdmin && (
                <Suspense fallback={<span>Cargando...</span>}>
                  <AdminIcon className="w-4 h-4 text-blue-500" />
                </Suspense>
              )}
              <span className="text-gray-500">·</span>
              {timestamp && (
                <span className="text-gray-500 text-sm">
                  {formatDistance(timestamp, new Date(), { locale: es })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Botones de eliminar */}
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                {currentUser && tweet.userId === currentUser.uid && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="p-2 rounded-full hover:bg-red-500/10 group transition-colors"
                    title="Eliminar mi tweet"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-500 group-hover:text-red-500"
                    >
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}

                {isAdmin && tweet.userId !== currentUser?.uid && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="p-2 rounded-full hover:bg-yellow-500/10 group transition-colors"
                    title="Eliminar como administrador"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-yellow-500"
                    >
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.5 1.1 2.5 2.5S13.4 12 12 12s-2.5-1.1 2.5-2.5S10.6 7 12 7zm0 6.5c2.33 0 4.3 1.46 5.11 3.5H6.89c.8-2.04 2.78-3.5 5.11-3.5z"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Botón de seguir */}
              {currentUser && tweet.userId !== currentUser.uid && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <FollowButton
                    targetUserId={tweet.userId}
                    currentUser={currentUser}
                    size="small"
                  />
                </div>
              )}
            </div>
          </div>
          <p className="mt-2 text-white text-base break-words">{tweet.text}</p>
          
          <TweetActions tweet={tweet} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
});
