import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function TweetBox({ currentUser, replyTo, placeholder = "¿Qué está pasando?" }) {
  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const tweetData = {
        text: text,
        userId: currentUser.uid,
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: [],
        retweets: 0,
        retweetedBy: []
      };

      // Si es una respuesta, añadir referencias
      if (replyTo) {
        tweetData.isReply = true;
        tweetData.replyToId = replyTo.id;
        tweetData.replyToUserId = replyTo.userId;
      }

      await addDoc(collection(db, "tweets"), tweetData);
      setText('');
    } catch (error) {
      console.error("Error al publicar tweet:", error);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {replyTo && (
          <div className="text-gray-500 text-sm">
            Respondiendo a @{replyTo.username || replyTo.email?.split('@')[0]}
          </div>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-white resize-none focus:outline-none"
          rows="3"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!text.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full disabled:opacity-50"
          >
            {replyTo ? 'Responder' : 'Twittear'}
          </button>
        </div>
      </form>
    </div>
  );
}
