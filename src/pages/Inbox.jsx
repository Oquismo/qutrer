import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import NewMessagesBadge from "../components/NewMessagesBadge"; // Importación por defecto

export default function Inbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);

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
    });
    return () => unsubscribe();
  }, [user]);

  const getOtherParticipant = (participants) =>
    participants.find(uid => uid !== user.uid);

  // Función para borrar el contador de mensajes no leídos al abrir la conversación
  const clearUnread = async (convId) => {
    const convDocRef = doc(db, "conversations", convId);
    await updateDoc(convDocRef, {
      [`unread.${user.uid}`]: 0
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 bg-[#15202B] min-h-screen">
      <h1 className="text-white text-2xl font-bold mb-6">Bandeja de Entrada</h1>
      {conversations.length === 0 ? (
        <p className="text-gray-400">No tienes mensajes.</p>
      ) : (
        <ul>
          {conversations.map(conv => {
            const otherUid = getOtherParticipant(conv.participants);
            const unreadCount = conv.unread && conv.unread[user.uid] ? conv.unread[user.uid] : 0;
            return (
              <li key={conv.id} className="border-b border-gray-700 py-4">
                <Link
                  to={`/messages/${otherUid}`}
                  onClick={() => clearUnread(conv.id)}
                  className="block text-white hover:text-blue-400"
                >
                  <div className="flex justify-between items-center">
                    <span>{otherUid}</span>
                    {unreadCount > 0 && <NewMessagesBadge count={unreadCount} onClick={() => {}} />}
                    <span className="text-sm text-gray-400">
                      {conv.lastUpdated ? new Date(conv.lastUpdated.seconds * 1000).toLocaleString() : ""}
                    </span>
                  </div>
                  <p className="text-gray-300 mt-1">{conv.lastMessage || "Sin mensajes"}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
