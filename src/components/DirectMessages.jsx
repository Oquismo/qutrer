import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Added Link
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc, increment, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const DEFAULT_AVATAR = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

export default function DirectMessages() {
  const { targetUserId } = useParams();
  const { authUser: currentUser } = useAuth(); // Updated useAuth
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [targetUserProfile, setTargetUserProfile] = useState(null); // State for target user's profile
  
  // Ensure currentUser is available before proceeding
  const convId = currentUser ? [currentUser.uid, targetUserId].sort().join("_") : null;

  // Fetch target user's profile
  useEffect(() => {
    if (targetUserId) {
      const userDocRef = doc(db, "users", targetUserId);
      const fetchUserProfile = async () => {
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setTargetUserProfile({
            uid: targetUserId,
            displayName: userData.displayName || userData.username || `User ${targetUserId.substring(0,6)}`,
            photoURL: userData.photoURL || DEFAULT_AVATAR,
          });
        } else {
          setTargetUserProfile({
            uid: targetUserId,
            displayName: `User ${targetUserId.substring(0,6)}`,
            photoURL: DEFAULT_AVATAR,
          });
        }
      };
      fetchUserProfile();
    }
  }, [targetUserId]);

  // Ensure conversation document exists
  useEffect(() => {
    if (!convId || !currentUser?.uid) return; // Guard against null convId or currentUser

    const convDocRef = doc(db, "conversations", convId);
    const initConversation = async () => {
      const convSnap = await getDoc(convDocRef);
      if (!convSnap.exists()) {
        try {
          await setDoc(convDocRef, {
            participants: [currentUser.uid, targetUserId],
            lastMessage: "",
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            unread: { [targetUserId]: 0, [currentUser.uid]: 0 }
          });
        } catch (error) {
          console.error("Error initializing conversation:", error);
        }
      }
    };
    initConversation();
  }, [convId, currentUser?.uid, targetUserId]);


  useEffect(() => {
    if (!convId) return; // Guard against null convId
    const messagesRef = collection(db, "conversations", convId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      // Mark messages as read by current user
      if (currentUser?.uid && convId) {
        const convDocRef = doc(db, "conversations", convId);
        setDoc(convDocRef, { unread: { [currentUser.uid]: 0 } }, { merge: true })
          .catch(error => console.error("Error marking messages as read:", error));
      }
    }, (error) => {
      console.error("Error fetching messages:", error);
    });
    return () => unsubscribe();
  }, [convId, currentUser?.uid]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !currentUser?.uid || !convId) return;
    const messagesRef = collection(db, "conversations", convId, "messages");
    try {
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        createdAt: serverTimestamp()
      });
      const convDocRef = doc(db, "conversations", convId);
      await setDoc(
        convDocRef,
        {
          participants: [currentUser.uid, targetUserId], // Ensure participants are correctly ordered or handled
          lastMessage: newMessage.trim(),
          lastUpdated: serverTimestamp(),
          unread: { [targetUserId]: increment(1), [currentUser.uid]: 0 } // Increment for target, reset for sender
        },
        { merge: true }
      );
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  if (!currentUser) {
    return <div className="text-white text-center p-8">Cargando sesión...</div>;
  }
  if (!targetUserProfile) {
    return <div className="text-white text-center p-8">Cargando perfil del usuario...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.14))] max-w-2xl mx-auto bg-[#15202B] text-white">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-700">
        <Link to={`/profile/${targetUserProfile.uid}`} className="flex items-center hover:opacity-80 transition-opacity">
          <img 
            src={targetUserProfile.photoURL} 
            alt={targetUserProfile.displayName} 
            className="w-10 h-10 rounded-full mr-3 object-cover"
            onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
          />
          <h2 className="text-xl font-semibold">{targetUserProfile.displayName}</h2>
        </Link>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`p-3 rounded-lg max-w-[70%] break-words ${
                msg.senderId === currentUser.uid 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              <p>{msg.text}</p>
              {msg.createdAt?.toDate && (
                <small className={`text-xs mt-1 block ${msg.senderId === currentUser.uid ? 'text-blue-200 text-right' : 'text-gray-400 text-left'}`}>
                  {new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-gray-700 bg-[#15202B]">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 p-3 rounded bg-gray-700 text-white outline-none"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
