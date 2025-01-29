import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [userTweets, setUserTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        console.log('Buscando perfil para userId:', userId);

        // Primero, buscar en la colección de tweets para obtener la información del usuario
        const tweetsQuery = query(
          collection(db, 'tweets'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc')
        );
        
        const tweetsSnapshot = await getDocs(tweetsQuery);
        const tweets = tweetsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Tweets encontrados:', tweets.length);

        if (tweets.length > 0) {
          const userInfo = tweets[0];
          setUserProfile({
            displayName: userInfo.username,
            photoURL: userInfo.userImage,
            userId: userInfo.userId
          });
          setUserTweets(tweets);
        }

      } catch (error) {
        console.error('Error al obtener el perfil:', error);
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white text-center mt-4 p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-white text-center mt-4 p-4">
        <p>Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <div className="text-white p-4 max-w-2xl mx-auto">
      <div className="bg-[#192734] rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <img 
            src={userProfile.photoURL || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'} 
            alt="Profile" 
            className="w-20 h-20 rounded-full"
            onError={(e) => {
              e.target.src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png';
            }}
          />
          <div>
            <h2 className="text-xl font-bold">
              {userProfile.displayName || userProfile.email?.split('@')[0]}
            </h2>
            <p className="text-gray-400">@{userProfile.username?.split('@')[0] || userProfile.displayName?.split('@')[0]}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Tweets</h3>
        {userTweets.length > 0 ? (
          userTweets.map(tweet => (
            <div key={tweet.id} className="bg-[#192734] p-4 rounded-lg mb-2">
              <p className="text-white">{tweet.text}</p>
              {tweet.timestamp && (
                <span className="text-gray-400 text-sm">
                  {tweet.timestamp.toDate().toLocaleDateString()}
                </span>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No hay tweets para mostrar</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
