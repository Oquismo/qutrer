import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import ShareIcon from './icons/ShareIcon';

export default function TweetActions({ tweet, currentUser, isReplyInThread = false }) {
  const navigate = useNavigate(); // Inicializar useNavigate
  const [hasLiked, setHasLiked] = useState(false);
  const [hasRetweeted, setHasRetweeted] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (tweet?.likedBy?.includes(currentUser?.uid)) {
      setHasLiked(true);
    }
    if (tweet?.retweetedBy?.includes(currentUser?.uid)) {
      setHasRetweeted(true);
    }
  }, [tweet?.likedBy, tweet?.retweetedBy, currentUser?.uid]);

  const handleLike = async () => {
    if (!currentUser || updating || !tweet.id) return;
    
    setUpdating(true);
    const tweetRef = doc(db, "tweets", tweet.id);
    
    try {
      if (hasLiked) {
        await updateDoc(tweetRef, {
          likes: (tweet.likes || 0) - 1,
          likedBy: arrayRemove(currentUser.uid)
        });
        setHasLiked(false);
      } else {
        await updateDoc(tweetRef, {
          likes: (tweet.likes || 0) + 1,
          likedBy: arrayUnion(currentUser.uid)
        });
        setHasLiked(true);
      }
    } catch (error) {
      console.error("Error al actualizar like:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleRetweet = async () => {
    if (!currentUser || updating || !tweet.id || tweet.userId === currentUser.uid) return;
    
    setUpdating(true);
    const tweetRef = doc(db, "tweets", tweet.id);
    
    try {
      if (hasRetweeted) {
        await updateDoc(tweetRef, {
          retweets: (tweet.retweets || 0) - 1,
          retweetedBy: arrayRemove(currentUser.uid)
        });
        setHasRetweeted(false);
      } else {
        await updateDoc(tweetRef, {
          retweets: (tweet.retweets || 0) + 1,
          retweetedBy: arrayUnion(currentUser.uid)
        });
        setHasRetweeted(true);
      }
    } catch (error) {
      console.error("Error al actualizar retweet:", error);
    } finally {
      setUpdating(false);
    }
  };

  // Nueva función para compartir tweet
  const handleShare = async () => {
    try {
      const tweetUrl = `${window.location.origin}/tweet/${tweet.id}`;
      await navigator.clipboard.writeText(tweetUrl);
      alert("Enlace copiado al portapapeles");
    } catch (error) {
      console.error("Error al copiar enlace:", error);
    }
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  // Asegurarse de que los contadores tengan un valor por defecto si el tweet no los tiene
  const likeCount = tweet?.likes || 0;
  const retweetCount = tweet?.retweets || 0;
  const replyCount = tweet?.replies || 0; // Asumiendo que tienes un campo 'replies' o lo calcularás

  return (
    <div className={`flex justify-around mt-2 sm:mt-3 text-gray-500 ${isReplyInThread ? 'py-1' : 'py-2'}`} onClick={stopPropagation}>
      {/* Botón de Comentario/Respuesta */}
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          if (tweet.id) navigate(`/tweet/${tweet.id}`);
        }}
        className="flex items-center space-x-1 sm:space-x-2 hover:text-blue-400 group"
      >
        <svg className={`w-4 h-4 sm:w-5 sm:h-5 group-hover:bg-blue-500/10 rounded-full p-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className={`text-xs sm:text-sm ${isReplyInThread ? 'group-hover:hidden sm:group-hover:inline' : ''}`}>{replyCount}</span>
      </button>

      {/* Botón de Retweet */}
      <button 
        onClick={handleRetweet}
        className="flex items-center space-x-1 sm:space-x-2 hover:text-green-400 group"
      >
        <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${hasRetweeted ? 'text-green-500' : ''} group-hover:bg-green-500/10 rounded-full p-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span className={`text-xs sm:text-sm ${hasRetweeted ? 'text-green-500' : ''} ${isReplyInThread ? 'group-hover:hidden sm:group-hover:inline' : ''}`}>{retweetCount}</span>
      </button>

      {/* Botón de Like */}
      <button 
        onClick={handleLike}
        className="flex items-center space-x-1 sm:space-x-2 hover:text-red-400 group"
      >
        <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${hasLiked ? 'text-red-500 fill-current' : ''} group-hover:bg-red-500/10 rounded-full p-0.5`} stroke="currentColor" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className={`text-xs sm:text-sm ${hasLiked ? 'text-red-500' : ''} ${isReplyInThread ? 'group-hover:hidden sm:group-hover:inline' : ''}`}>{likeCount}</span>
      </button>
      
      {/* Botón de Compartir (si se implementa) */}
      <button
        type="button"
        aria-label="Compartir tweet"
        className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          handleShare();
        }}
      >
        <ShareIcon />
        <span className="hidden sm:inline">Compartir</span>
      </button>
    </div>
  );
}
