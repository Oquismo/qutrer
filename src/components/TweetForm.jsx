// src/components/TweetForm.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getProfileImage } from '../utils/userUtils';

const MAX_TWEET_LENGTH = 280;
const DEFAULT_PROFILE_IMAGE = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

export default React.memo(function TweetForm() {
  const [tweetText, setTweetText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [userImage, setUserImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [image, setImage] = useState(null);
  const { user } = useAuth();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null); // Nueva referencia

  useEffect(() => {
    if (user?.uid) {
      getUserProfile(user.uid).then(profile => {
        setUserImage(profile?.photoURL || DEFAULT_PROFILE_IMAGE);
      });
    }
  }, [user]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!tweetText.trim() && !image || isPosting || tweetText.length > MAX_TWEET_LENGTH) return;

    setIsPosting(true);
    try {
      const tweetData = {
        text: tweetText.trim(),
        userId: user.uid,
        username: user.displayName || user.email?.split('@')[0],
        userImage: getProfileImage(user),
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: [],
        retweets: 0,
        retweetedBy: [],
        image: image,
      };

      await addDoc(collection(db, "tweets"), tweetData);
      setTweetText("");
      setImage(null);
    } catch (error) {
      console.error("Error al publicar tweet:", error);
    } finally {
      setIsPosting(false);
    }
  }, [tweetText, user, isPosting, image]);

  const handleClear = () => {
    setTweetText('');
    setImage(null);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(URL.createObjectURL(file));
    }
  };

  const charRemaining = MAX_TWEET_LENGTH - tweetText.length;
  const isOverLimit = charRemaining < 0;

  return (
    <form onSubmit={handleSubmit} className="px-4 py-4 border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
      <div className="flex gap-3">
        <div className="relative shrink-0">
          <img 
            src={userImage}
            alt={user?.displayName || "Usuario"}
            className="w-12 h-12 rounded-full ring-2 ring-gray-800 hover:ring-blue-500 transition-all"
            onError={(e) => {
              e.target.src = DEFAULT_PROFILE_IMAGE;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent border-none text-white text-xl resize-none focus:outline-none min-h-[50px] placeholder-gray-600 mb-2"
            placeholder="¿Qué está pasando?"
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            rows={1}
            maxLength={280}
          />
          <div>
            {/* Input oculto */}
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*" 
              onChange={handleImageSelect} 
              className="hidden"
            />
            {/* Botón personalizado */}
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-colors"
            >
              Subir Imagen
            </button>
            {image && <img src={image} alt="Previsualización" className="mt-2 w-24 rounded" />}
          </div>
          <div className="flex items-center justify-end gap-4 pt-3 border-t border-gray-800">
            <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-500'} transition-colors`}>
              {charRemaining} caracteres restantes
            </span>
            <button 
              type="submit" 
              disabled={isPosting || !tweetText.trim() || isOverLimit}
              className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-full transition-all duration-200 
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 
                transform hover:-translate-y-0.5 active:translate-y-0 
                shadow-lg hover:shadow-blue-500/30"
            >
              {isPosting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Posteando...
                </span>
              ) : (
                "Enviar"
              )}
            </button>
            <button 
              type="button" 
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold px-6 py-2.5 rounded-full transition-all duration-200 
                transform hover:-translate-y-0.5 active:translate-y-0 
                shadow-lg hover:shadow-red-500/30"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
    </form>
  );
});