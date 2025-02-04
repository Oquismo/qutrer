import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 bg-[#15202B] min-h-screen">
      <h1 className="text-white text-2xl font-bold mb-6">Bandeja de Entrada</h1>
      {conversations.length === 0 ? (
        <p className="text-gray-400">No tienes mensajes.</p>
      ) : (
        <ul>
          {conversations.map(conv => {
            const otherUid = getOtherParticipant(conv.participants);
            return (
              <li key={conv.id} className="border-b border-gray-700 py-4">
                <Link to={`/messages/${otherUid}`} className="block text-white hover:text-blue-400">
                  <div className="flex justify-between">
                    <span>{otherUid}</span>
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
