// src/components/TweetForm.jsx
import React, { useState, useRef, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const MAX_TWEET_LENGTH = 280;
const DEFAULT_PROFILE_IMAGE = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

export default function TweetForm({ user }) {
  const [tweetText, setTweetText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [profileImg, setProfileImg] = useState(DEFAULT_PROFILE_IMAGE);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Verifica y actualiza la imagen de perfil cuando el usuario cambia
    if (user?.photoURL) {
      console.log("URL de foto de perfil:", user.photoURL); // Para debug
      setProfileImg(user.photoURL);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tweetText.trim()) return;

    setIsPosting(true);
    try {
      console.log("Usuario actual:", user); // Para debug

      await addDoc(collection(db, "tweets"), {
        text: tweetText,
        userId: user.uid,
        username: user.displayName || user.email,
        userImage: user.photoURL,
        timestamp: serverTimestamp(),
        likes: 0,
        retweets: 0,
      });

      setTweetText("");
    } catch (error) {
      console.error("Error al publicar tweet:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const charLimit = 280;
  const charCount = tweetText.length;
  const charRemaining = charLimit - charCount;
  const isOverLimit = charCount > charLimit;

  return (
    <form onSubmit={handleSubmit} className="px-4 py-4 border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
      <div className="flex gap-3">
        {user && (
          <div className="relative shrink-0">
            <img 
              src={profileImg}
              alt={user.displayName || "Usuario"}
              className="w-12 h-12 rounded-full ring-2 ring-gray-800 hover:ring-blue-500 transition-all"
              onError={(e) => {
                console.log("Error al cargar la imagen, usando imagen por defecto");
                e.target.src = DEFAULT_PROFILE_IMAGE;
              }}
            />
          </div>
        )}
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
                "Postear"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}