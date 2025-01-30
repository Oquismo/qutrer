// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, getDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import Tweet from "../components/Tweet";
import FollowButton from '../components/FollowButton';

const DEFAULT_PROFILE_IMAGE = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

export default function Profile({ currentUser }) {
  const { userId } = useParams();
  const [userTweets, setUserTweets] = useState([]);
  const [likedTweets, setLikedTweets] = useState([]);
  const [retweetedTweets, setRetweetedTweets] = useState([]);
  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState('tweets'); // Nueva variable para controlar las pestañas

  useEffect(() => {
    let unsubscribeAll = [];
    
    const loadProfile = async () => {
      const targetUserId = userId || currentUser?.uid;
      if (!targetUserId) return;

      try {
        // Obtener o crear documento de usuario
        const userRef = doc(db, "users", targetUserId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // Si el usuario no existe, crear documento básico
          const basicUserData = {
            uid: targetUserId,
            displayName: "Usuario",
            followers: [],
            following: [],
            createdAt: serverTimestamp()
          };
          await setDoc(userRef, basicUserData);
          setProfileUser({ ...basicUserData, uid: targetUserId });
        } else {
          setProfileUser({ ...userDoc.data(), uid: targetUserId });
        }

        // Tweets propios
        const tweetsQuery = query(
          collection(db, "tweets"),
          where("userId", "==", targetUserId),
          orderBy("timestamp", "desc")
        );

        const unsubscribeUserTweets = onSnapshot(tweetsQuery, (snapshot) => {
          const tweets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log("Tweets cargados:", tweets.length);
          setUserTweets(tweets);
        }, (error) => {
          console.error("Error cargando tweets:", error);
        });

        unsubscribeAll.push(unsubscribeUserTweets);

        // Tweets con like
        const likedTweetsQuery = query(
          collection(db, "tweets"),
          where("likedBy", "array-contains", targetUserId),
          orderBy("timestamp", "desc")
        );

        const unsubscribeLikes = onSnapshot(likedTweetsQuery, (snapshot) => {
          const tweets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log("Likes cargados:", tweets.length);
          setLikedTweets(tweets);
        }, (error) => {
          console.error("Error cargando likes:", error);
        });

        unsubscribeAll.push(unsubscribeLikes);

        // Tweets retweeteados
        const retweetedQuery = query(
          collection(db, "tweets"),
          where("retweetedBy", "array-contains", targetUserId),
          orderBy("timestamp", "desc")
        );

        const unsubscribeRetweets = onSnapshot(retweetedQuery, (snapshot) => {
          const tweets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log("Retweets cargados:", tweets.length);
          setRetweetedTweets(tweets);
        }, (error) => {
          console.error("Error cargando retweets:", error);
        });

        unsubscribeAll.push(unsubscribeRetweets);

      } catch (error) {
        console.error("Error cargando perfil:", error);
      }
    };

    loadProfile();

    return () => {
      unsubscribeAll.forEach(unsubscribe => unsubscribe());
    };
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

            {/* Nombre y username con botón de seguir */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-xl font-bold text-white">
                  {profileUser?.displayName || profileUser?.username || profileUser?.email?.split('@')[0]}
                </h1>
                <p className="text-gray-500">
                  @{profileUser?.username || profileUser?.email?.split('@')[0]}
                </p>
              </div>
              {profileUser?.uid !== currentUser?.uid && (
                <FollowButton
                  targetUserId={profileUser?.uid}
                  currentUser={currentUser}
                />
              )}
            </div>

            {/* Estadísticas actualizadas */}
            <div className="flex space-x-6 text-gray-500 mb-4">
              <span>
                <b className="text-white">{userTweets.length}</b> Tweets
              </span>
              <span>
                <b className="text-white">{profileUser?.following?.length || 0}</b> Siguiendo
              </span>
              <span>
                <b className="text-white">{profileUser?.followers?.length || 0}</b> Seguidores
              </span>
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
              activeTab === 'retweets' 
                ? 'text-blue-500 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('retweets')}
          >
            Retweets
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
          ) : activeTab === 'retweets' ? (
            retweetedTweets.length > 0 ? (
              retweetedTweets.map(tweet => (
                <Tweet key={tweet.id} tweet={tweet} currentUser={currentUser} />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No has retweeteado ningún tweet aún
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