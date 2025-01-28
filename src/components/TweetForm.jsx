// src/components/TweetForm.jsx
import React, { useState, useRef, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// import { IoImageOutline, IoBarChartOutline, IoHappyOutline, IoCalendarOutline } from "react-icons/io5";

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
    <form onSubmit={handleSubmit} className="tweet-form">
      <div className="tweet-form-container">
        {user && (
          <div className="profile-container">
            <img 
              src={profileImg}
              alt={user.displayName || "Usuario"}
              className="profile-image"
              onError={(e) => {
                console.log("Error al cargar la imagen, usando imagen por defecto");
                e.target.src = DEFAULT_PROFILE_IMAGE;
              }}
            />
          </div>
        )}
        <div className="tweet-content">
          <textarea
            ref={textareaRef}
            className="tweet-input"
            placeholder="¿Qué está pasando?"
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            rows={1}
            style={{ minHeight: '50px' }}
            maxLength={280}
          />
          
          <div className="tweet-actions-bar">
            <div className="tweet-actions-buttons">
              <button className="action-button">
                
              </button>
              <button className="action-button">
                
              </button>
              <button className="action-button">
                
              </button>
              <button className="action-button">
               
              </button>
            </div>
            
            <div className="tweet-submit-section">
              <span className={`char-counter ${isOverLimit ? 'counter-limit' : ''}`}>
                {charRemaining} caracteres restantes--
              </span>
              <button
                type="submit"
                disabled={isPosting || !tweetText.trim() || isOverLimit}
                className={`tweet-submit-button ${(isPosting || !tweetText.trim() || isOverLimit) ? 'button-disabled' : ''}`}
              >
                {isPosting ? 'Publicando...' : 'Postear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}