import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc, increment, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function DirectMessages() {
  const { targetUserId } = useParams();
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const conversationIdRef = useRef(null);
  const messagesEndRef = useRef(null); // Para auto-scroll

  useEffect(() => {
    if (currentUser?.uid && targetUserId) {
      conversationIdRef.current = [currentUser.uid, targetUserId].sort().join("_");
      setIsLoading(false);
    } else {
      setIsLoading(true);
      setMessages([]);
    }
  }, [currentUser?.uid, targetUserId]);

  // Asegurar que exista el documento de conversación y marcar como leído
  useEffect(() => {
    if (isLoading || !conversationIdRef.current || !currentUser?.uid) return;

    const convId = conversationIdRef.current;
    const convDocRef = doc(db, "conversations", convId);

    const setupConversation = async () => {
      const convSnap = await getDoc(convDocRef);
      if (!convSnap.exists()) {
        await setDoc(convDocRef, {
          participants: [currentUser.uid, targetUserId].sort(),
          lastMessage: "",
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          unread: { [targetUserId]: 0, [currentUser.uid]: 0 } 
        });
      } else {
        if (convSnap.data().unread && convSnap.data().unread[currentUser.uid] > 0) {
          await setDoc(convDocRef, {
            unread: { [currentUser.uid]: 0 }
          }, { merge: true });
        }
      }
    };

    setupConversation();
  }, [isLoading, currentUser?.uid, targetUserId]);

  // Cargar mensajes
  useEffect(() => {
    if (isLoading || !conversationIdRef.current) {
      setMessages([]);
      return () => {}; 
    }

    const convId = conversationIdRef.current;
    const messagesRef = collection(db, "conversations", convId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(docData => ({ id: docData.id, ...docData.data() }));
      setMessages(msgs);
    }, (error) => {
      console.error("Error al obtener mensajes:", error);
      setMessages([]);
    });

    return () => unsubscribe();
  }, [isLoading]);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !currentUser?.uid || !targetUserId || !conversationIdRef.current) return;

    const convId = conversationIdRef.current;
    const messagesRef = collection(db, "conversations", convId, "messages");
    await addDoc(messagesRef, {
      text: newMessage.trim(),
      senderId: currentUser.uid,
      createdAt: serverTimestamp()
    });

    const convDocRef = doc(db, "conversations", convId);
    await setDoc(convDocRef, {
      lastMessage: newMessage.trim(),
      lastUpdated: serverTimestamp(),
      unread: { [targetUserId]: increment(1), [currentUser.uid]: 0 }
    }, { merge: true });

    setNewMessage("");
  };

  if (isLoading && messages.length === 0) { 
    return <div className="text-center p-10 text-light-text dark:text-dark-text">Cargando mensajes...</div>;
  }

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6 bg-light-card dark:bg-dark-card rounded-lg shadow-xl my-4 border border-light-border dark:border-dark-border">
      {/* Aquí podrías obtener y mostrar el nombre/avatar del targetUserId si lo tienes */}
      {/* <h2 className="text-light-text dark:text-dark-text text-xl sm:text-2xl mb-4 text-center font-semibold">Chat con ...</h2> */}
      
      <div className="h-80 overflow-y-auto bg-gray-100 dark:bg-slate-800 p-3 rounded-md mb-4 border border-light-border dark:border-dark-border">
        {messages.length === 0 && !isLoading && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">No hay mensajes aún. ¡Envía el primero!</p>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`mb-2 flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
            <div className={`py-2 px-3 rounded-lg max-w-[75%] shadow ${msg.senderId === currentUser.uid ? 'bg-twitter-blue text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-light-text dark:text-dark-text rounded-bl-none'}`}>
              <p className="text-sm sm:text-base break-words">{msg.text}</p>
              <small className={`text-xs ${msg.senderId === currentUser.uid ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'} block text-right mt-1`}>
                {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
              </small>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 items-center">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-twitter-blue border border-gray-300 dark:border-gray-600 transition-shadow focus:shadow-md"
        />
        <button
          type="submit"
          className="bg-twitter-blue hover:bg-blue-600 text-white font-bold py-2 px-3 sm:py-3 sm:px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow hover:shadow-lg"
          disabled={!newMessage.trim() || isLoading}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
