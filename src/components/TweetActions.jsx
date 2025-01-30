import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export default function TweetActions({ tweet, currentUser }) {
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

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="flex justify-start space-x-8 mt-3" onClick={stopPropagation}>
      {/* Comentarios button */}
      <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
        <svg className="w-5 h-5" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z"/>
        </svg>
        <span>0</span>
      </button>

      {/* Retweet button */}
      <button 
        className={`flex items-center space-x-2 transition-colors ${
          hasRetweeted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
        }`}
        onClick={handleRetweet}
        disabled={updating || !currentUser || tweet.userId === currentUser?.uid}
        title={tweet.userId === currentUser?.uid ? "No puedes retweetear tu propio tweet" : ""}
      >
        <svg 
          className={`w-5 h-5 ${updating ? 'animate-spin' : ''}`} 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z"/>
        </svg>
        <span>{tweet.retweets || 0}</span>
      </button>

      {/* Like button */}
      <button 
        className={`flex items-center space-x-2 transition-colors ${
          hasLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
        }`}
        onClick={handleLike}
        disabled={updating || !currentUser}
      >
        <svg 
          className={`w-5 h-5 ${updating ? 'animate-pulse' : ''}`} 
          viewBox="0 0 24 24" 
          fill={hasLiked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={hasLiked ? "0" : "2"}
        >
          <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"/>
        </svg>
        <span>{tweet.likes || 0}</span>
      </button>
    </div>
  );
}
