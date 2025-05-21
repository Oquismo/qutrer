import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth, storage } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc } from 'firebase/firestore';
import { useAuth } from "../context/AuthContext";
import { ReactComponent as AdminIcon } from '../icons/progress-check.svg';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [userTweets, setUserTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authUser: user, isAdmin: currentIsAdmin, profile: currentUserProfile } = useAuth(); // Updated useAuth
  const [isProfileAdmin, setIsProfileAdmin] = useState(false); // Renamed to avoid confusion with logged-in user's admin status

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      setUserProfile(null); // Reset profile state on new userId
      setUserTweets([]);    // Reset tweets state on new userId

      try {
        console.log('Fetching profile for userId:', userId);

        // 1. Fetch user data from 'users' collection
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        let profileData = null;

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          profileData = {
            displayName: userData.displayName || userData.username,
            photoURL: userData.photoURL,
            userId: userId, // Use userId from params
            username: userData.username || (userData.email ? userData.email.split('@')[0] : userId) // Ensure username is populated for display
          };
          console.log('Profile data from users collection:', profileData);
        } else {
          console.warn(`User document not found in 'users' collection for uid: ${userId}.`);
        }

        // 2. Fetch user's tweets
        const tweetsQuery = query(
          collection(db, 'tweets'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc')
        );
        const tweetsSnapshot = await getDocs(tweetsQuery);
        const tweets = tweetsSnapshot.docs.map(tweetDoc => ({
          id: tweetDoc.id,
          ...tweetDoc.data()
        }));
        setUserTweets(tweets);
        console.log('Tweets found:', tweets.length);

        // 3. Consolidate profile data
        // If profileData came from 'users', it's preferred.
        // If not, and tweets exist, use info from the first tweet as a fallback.
        if (profileData) {
          setUserProfile(profileData);
        } else if (tweets.length > 0) {
          const tweetUserInfo = tweets[0]; // Assuming first tweet has representative user info
          const fallbackProfileData = {
            displayName: tweetUserInfo.username,
            photoURL: tweetUserInfo.userImage,
            userId: tweetUserInfo.userId, // This should match userId from params
            username: tweetUserInfo.username // Use username from tweet
          };
          setUserProfile(fallbackProfileData);
          console.warn('Used fallback profile data from tweets:', fallbackProfileData);
        } else {
          console.log('No profile data found for user in users collection or tweets:', userId);
          // setError("Usuario no encontrado o sin datos de perfil."); // Handled by !userProfile check later
        }

        // 4. Check if the profile being viewed is an admin
        const profileAdminDoc = await getDoc(doc(db, 'admins', userId));
        setIsProfileAdmin(profileAdminDoc.exists());

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError("Error al cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `profileImages/${user.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        // Puedes manejar el progreso de la subida aquí si lo deseas
      }, 
      (error) => {
        console.error('Error al subir la imagen:', error);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await updateDoc(doc(db, 'users', user.uid), {
          photoURL: downloadURL
        });
        setUserProfile((prev) => ({ ...prev, photoURL: downloadURL }));
      }
    );
  };

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
          {user?.uid === userId && (
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="text-white"
            />
          )}
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">
                {userProfile.displayName || userProfile.email?.split('@')[0]} {isProfileAdmin && <AdminIcon className="w-4 h-4 text-blue-500 ml-1 inline-block" />}
              </h2>
            </div>
            <p className="text-gray-400">@{userProfile.username?.split('@')[0] || userProfile.displayName?.split('@')[0]}</p>
            {user && user.uid !== userId && (
              <button
                onClick={() => navigate(`/messages/${userId}`)}
                className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm transition-colors"
              >
                Enviar Mensaje
              </button>
            )}
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
