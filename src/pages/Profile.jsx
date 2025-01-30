// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, getDoc, doc } from "firebase/firestore";
import Tweet from "../components/Tweet";

const DEFAULT_PROFILE_IMAGE = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

export default function Profile({ currentUser }) {
  const { userId } = useParams();
  const [userTweets, setUserTweets] = useState([]);
  const [likedTweets, setLikedTweets] = useState([]);
  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState('tweets'); // Nueva variable para controlar las pestañas

  useEffect(() => {
    const targetUserId = userId || currentUser?.uid;
    if (!targetUserId) return;

    const fetchProfileUser = async () => {
      if (targetUserId === currentUser?.uid) {
        setProfileUser(currentUser);
      } else {
        const userDoc = await getDoc(doc(db, "users", targetUserId));
        if (userDoc.exists()) {
          setProfileUser(userDoc.data());
        }
      }
    };

    fetchProfileUser();
    
    // Obtener tweets del usuario
    const tweetsQuery = query(
      collection(db, "tweets"),
      where("userId", "==", targetUserId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(tweetsQuery, (snapshot) => {
      setUserTweets(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    // Añadir consulta para tweets likeados
    const fetchLikedTweets = async () => {
      const likedTweetsQuery = query(
        collection(db, "tweets"),
        where("likedBy", "array-contains", targetUserId)
      );

      const unsubscribeLikes = onSnapshot(likedTweetsQuery, (snapshot) => {
        setLikedTweets(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      });

      return () => unsubscribeLikes();
    };

    fetchLikedTweets();

    return () => unsubscribe();
  }, [userId, currentUser]);

  if (!profileUser) return null;

  return (
    <div className="min-h-screen bg-[#15202B]">
      <div className="max-w-2xl mx-auto">
        {/* Cabecera del perfil */}
        <div className="relative">
          {/* Banner */}
          <div className="h-48 bg-gray-800"></div>
          
          {/* Información del perfil */}
          <div className="p-4">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <img
                src={profileUser.photoURL || DEFAULT_PROFILE_IMAGE}
                alt={profileUser.displayName || "Usuario"}
                className="w-32 h-32 rounded-full border-4 border-[#15202B] bg-[#15202B]"
              />
            </div>

            {/* Nombre y username */}
            <div className="mb-4">
              <h1 className="text-xl font-bold text-white">
                {profileUser.displayName || profileUser.username || profileUser.email?.split('@')[0]}
              </h1>
              <p className="text-gray-500">@{profileUser.username || profileUser.email?.split('@')[0]}</p>
            </div>

            {/* Estadísticas */}
            <div className="flex space-x-6 text-gray-500 mb-4">
              <span><b className="text-white">{userTweets.length}</b> Tweets</span>
              <span><b className="text-white">0</b> Siguiendo</span>
              <span><b className="text-white">0</b> Seguidores</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            className={`flex-1 py-4 text-center ${
              activeTab === 'tweets' 
                ? 'text-blue-500 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('tweets')}
          >
            Tweets
          </button>
          <button
            className={`flex-1 py-4 text-center ${
              activeTab === 'likes' 
                ? 'text-blue-500 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('likes')}
          >
            Me gusta
          </button>
        </div>

        {/* Tweet lists */}
        <div className="border-t border-gray-800">
          {activeTab === 'tweets' ? (
            userTweets.length > 0 ? (
              userTweets.map(tweet => (
                <Tweet key={tweet.id} tweet={tweet} currentUser={currentUser} />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No hay tweets para mostrar
              </div>
            )
          ) : (
            likedTweets.length > 0 ? (
              likedTweets.map(tweet => (
                <Tweet key={tweet.id} tweet={tweet} currentUser={currentUser} />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No hay tweets que te gusten aún
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}