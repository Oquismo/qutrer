import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function DirectMessages({ targetUserId }) {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const convId = [currentUser.uid, targetUserId].sort().join("_");

  useEffect(() => {
    const messagesRef = collection(db, "conversations", convId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [convId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    const messagesRef = collection(db, "conversations", convId, "messages");
    await addDoc(messagesRef, {
      text: newMessage.trim(),
      senderId: currentUser.uid,
      createdAt: serverTimestamp()
    });
    setNewMessage("");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-[#15202B] rounded-lg shadow-lg">
      <h2 className="text-white text-2xl mb-4 text-center">Mensajes Privados</h2>
      <div className="h-72 overflow-y-auto bg-gray-800 p-3 rounded mb-4">
        {messages.map(msg => (
          <div key={msg.id} className={`mb-2 p-2 rounded ${msg.senderId === currentUser.uid ? 'bg-blue-500 text-white self-end' : 'bg-gray-700 text-white'}`}>
            <p>{msg.text}</p>
            <small className="text-gray-200">
              {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString() : ""}
            </small>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
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
