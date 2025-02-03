import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';

export default function FollowButton({ targetUserId, currentUser, size = 'normal' }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser?.uid || !targetUserId) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setIsFollowing(userDoc.data()?.following?.includes(targetUserId));
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [currentUser?.uid, targetUserId]);

  const ensureUserDoc = async (userId) => {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: userId,
        followers: [],
        following: []
      }, { merge: true });
    }
  };

  const handleFollow = async () => {
    if (!currentUser || loading || !targetUserId || currentUser.uid === targetUserId) return;
    
    setLoading(true);
    try {
      // Asegurar que ambos documentos de usuario existan
      await ensureUserDoc(currentUser.uid);
      await ensureUserDoc(targetUserId);

      const currentUserRef = doc(db, "users", currentUser.uid);
      const targetUserRef = doc(db, "users", targetUserId);

      if (isFollowing) {
        await updateDoc(currentUserRef, {
          following: arrayRemove(targetUserId)
        });
        await updateDoc(targetUserRef, {
          followers: arrayRemove(currentUser.uid)
        });
        setIsFollowing(false);
      } else {
        await updateDoc(currentUserRef, {
          following: arrayUnion(targetUserId)
        });
        await updateDoc(targetUserRef, {
          followers: arrayUnion(currentUser.uid)
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (currentUser?.uid === targetUserId) return null;

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      aria-pressed={isFollowing}
      className={`
        ${size === 'small' 
          ? 'px-3 py-1 text-xs' 
          : 'px-4 py-2 text-sm'
        } rounded-full font-medium transition-colors
        ${isFollowing 
          ? 'bg-white text-black hover:bg-red-100 hover:text-red-600 hover:border-red-600' 
          : 'bg-white text-black hover:bg-gray-100'
        } disabled:opacity-50
      `}
    >
      {loading ? (
        <span className="flex items-center">
          <svg className={`animate-spin ${size === 'small' ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </span>
      ) : isFollowing ? (
        "Siguiendo"
      ) : (
        "Seguir"
      )}
    </button>
  );
}
