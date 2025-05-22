import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import NewMessagesBadge from "../components/NewMessagesBadge";

export default function Inbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [userProfiles, setUserProfiles] = useState({});

  useEffect(() => {
    if (!user?.uid) {
      setIsLoadingConversations(true);
      setConversations([]);
      return;
    }
    setIsLoadingConversations(true);
    const convRef = collection(db, "conversations");
    const q = query(
      convRef,
      where("participants", "array-contains", user.uid),
      orderBy("lastUpdated", "desc")
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const convs = snapshot.docs.map(docData => ({ id: docData.id, ...docData.data() }));
      
      const profilesToFetch = new Set();
      convs.forEach(conv => {
        conv.participants.forEach(participantId => {
          if (participantId !== user.uid && !userProfiles[participantId]) {
            profilesToFetch.add(participantId);
          }
        });
      });

      const fetchedProfiles = {};
      for (const userId of Array.from(profilesToFetch)) {
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          fetchedProfiles[userId] = userDocSnap.data();
        }
      }
      setUserProfiles(prevProfiles => ({ ...prevProfiles, ...fetchedProfiles }));
      setConversations(convs);
      setIsLoadingConversations(false);
    }, (error) => {
      console.error("Error al cargar conversaciones:", error);
      setIsLoadingConversations(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const getOtherParticipantInfo = (participants) => {
    const otherUid = participants.find(uid => uid !== user?.uid);
    return userProfiles[otherUid] || { uid: otherUid, displayName: "Usuario Desconocido", photoURL: null };
  };

  const clearUnread = async (convId) => {
    if (!user?.uid) return;
    const convDocRef = doc(db, "conversations", convId);
    try {
      await updateDoc(convDocRef, {
        [`unread.${user.uid}`]: 0
      });
    } catch (error) {
      console.error("Error al limpiar no leídos:", error);
    }
  };

  if (isLoadingConversations) {
    return <div className="text-center p-10 text-light-text dark:text-dark-text">Cargando conversaciones...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 bg-light-background dark:bg-dark-background min-h-screen">
      <h1 className="text-light-text dark:text-dark-text text-2xl font-bold mb-6">Bandeja de Entrada</h1>
      {conversations.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No tienes mensajes.</p>
      ) : (
        <ul className="divide-y divide-light-border dark:divide-dark-border">
          {conversations.map(conv => {
            const otherParticipant = getOtherParticipantInfo(conv.participants);
            const unreadCount = conv.unread && user?.uid && conv.unread[user.uid] ? conv.unread[user.uid] : 0;
            return (
              <li key={conv.id} className="py-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-150 rounded-md">
                <Link
                  to={`/messages/${otherParticipant.uid}`}
                  onClick={() => clearUnread(conv.id)}
                  className="block px-2 sm:px-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={otherParticipant.photoURL || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'} 
                        alt={otherParticipant.displayName} 
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-semibold text-light-text dark:text-dark-text text-sm sm:text-base">
                          {otherParticipant.displayName || otherParticipant.uid}
                        </span>
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-xs">
                          {conv.lastMessage || "Sin mensajes"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {unreadCount > 0 && <NewMessagesBadge count={unreadCount} />}
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {conv.lastUpdated?.toDate ? new Date(conv.lastUpdated.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
