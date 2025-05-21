import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore"; // Added getDoc
import { Link } from "react-router-dom";
import NewMessagesBadge from "../components/NewMessagesBadge";

const DEFAULT_AVATAR = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

export default function Inbox() {
  const { authUser: user } = useAuth(); // Updated useAuth
  const [conversations, setConversations] = useState([]);
  const [otherUserProfiles, setOtherUserProfiles] = useState({}); // State for user profiles

  const fetchUserProfile = useCallback(async (uid) => {
    if (!uid || otherUserProfiles[uid]) { // Avoid refetching if already loaded
      return;
    }
    try {
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setOtherUserProfiles(prevProfiles => ({
          ...prevProfiles,
          [uid]: {
            displayName: userData.displayName || userData.username || "Usuario Desconocido",
            photoURL: userData.photoURL || DEFAULT_AVATAR,
          }
        }));
      } else {
        setOtherUserProfiles(prevProfiles => ({
          ...prevProfiles,
          [uid]: {
            displayName: "Usuario Desconocido",
            photoURL: DEFAULT_AVATAR,
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setOtherUserProfiles(prevProfiles => ({ // Fallback on error
        ...prevProfiles,
        [uid]: {
          displayName: "Usuario Desconocido",
          photoURL: DEFAULT_AVATAR,
        }
      }));
    }
  }, [otherUserProfiles]); // Dependency on otherUserProfiles to avoid race conditions/refetching

  useEffect(() => {
    if (!user) return;
    const convRef = collection(db, "conversations");
    const q = query(
      convRef,
      where("participants", "array-contains", user.uid),
      orderBy("lastUpdated", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(convs);
      // Fetch profiles for new otherUids
      convs.forEach(conv => {
        const otherUid = conv.participants.find(pUid => pUid !== user.uid);
        if (otherUid) {
          fetchUserProfile(otherUid);
        }
      });
    });
    return () => unsubscribe();
  }, [user, fetchUserProfile]); // Added fetchUserProfile to dependencies

  const getOtherParticipant = (participants) => {
    if (!user) return null;
    return participants.find(uid => uid !== user.uid);
  }

  // Función para borrar el contador de mensajes no leídos al abrir la conversación
  const clearUnread = async (convId) => {
    if (!user) return;
    const convDocRef = doc(db, "conversations", convId);
    await updateDoc(convDocRef, {
      [`unread.${user.uid}`]: 0
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 bg-[#15202B] min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Bandeja de Entrada</h1>
      {conversations.length === 0 ? (
        <p className="text-gray-400">No tienes mensajes.</p>
      ) : (
        <ul className="space-y-2">
          {conversations.map(conv => {
            const otherUid = getOtherParticipant(conv.participants);
            if (!otherUid) return null; // Should not happen if user is defined and part of participants
            
            const profile = otherUserProfiles[otherUid] || { displayName: "Cargando...", photoURL: DEFAULT_AVATAR };
            const unreadCount = conv.unread && conv.unread[user?.uid] ? conv.unread[user.uid] : 0;

            return (
              <li key={conv.id} className="border-b border-gray-700 last:border-b-0">
                <Link
                  to={`/messages/${otherUid}`}
                  onClick={() => clearUnread(conv.id)}
                  className="flex items-center p-3 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <img 
                    src={profile.photoURL} 
                    alt={profile.displayName} 
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                    onError={(e) => { e.target.src = DEFAULT_AVATAR; }} // Fallback for broken images
                  />
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">{profile.displayName}</span>
                      {conv.lastUpdated && (
                        <span className="text-xs text-gray-400">
                          {new Date(conv.lastUpdated.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 truncate">{conv.lastMessage || "Haz clic para enviar un mensaje"}</p>
                  </div>
                  {unreadCount > 0 && (
                    <div className="ml-3">
                       <NewMessagesBadge count={unreadCount} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} />
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
