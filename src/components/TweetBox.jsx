import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { addDoc, collection, serverTimestamp, doc, runTransaction, increment } from 'firebase/firestore';
import { db } from '../firebase';

export default function TweetBox({ currentUser, replyTo, placeholder = "¿Qué está pasando?" }) {
  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      let finalText = text;
      const tweetData = {
        userId: currentUser.uid,
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: [],
        retweets: 0,
        retweetedBy: [],
        replies: 0, // Las respuestas nuevas comienzan con 0 respuestas propias
        text: "", // Se asignará después de procesar la mención
      };

      if (replyTo && replyTo.id && replyTo.userId) {
        tweetData.isReply = true;
        tweetData.replyToId = replyTo.id;
        tweetData.replyToUserId = replyTo.userId;
        // Añadir @mención al principio del texto si es una respuesta y el usuario tiene username
        if (replyTo.username) {
          finalText = `@${replyTo.username} ${text}`;
        } else if (replyTo.displayName) { // Fallback a displayName si no hay username
          finalText = `@${replyTo.displayName.replace(/\\s+/g, '')} ${text}`; // Quitar espacios del displayName para la mención
        }
      }
      tweetData.text = finalText; // Asignar el texto final (con o sin @mención)

      // Referencia para el nuevo tweet (respuesta)
      const newTweetRef = doc(collection(db, "tweets")); 
      
      // Referencia al tweet padre (al que se está respondiendo), si existe
      const parentTweetRef = (replyTo && replyTo.id) ? doc(db, "tweets", replyTo.id) : null;

      await runTransaction(db, async (transaction) => {
        // 1. Guardar el nuevo tweet (la respuesta)
        transaction.set(newTweetRef, tweetData);

        // 2. Si es una respuesta, actualizar el contador de respuestas del tweet padre
        if (parentTweetRef) {
          transaction.update(parentTweetRef, {
            replies: increment(1)
          });
        }
      });

      setText('');
    } catch (error) {
      console.error("Error al publicar tweet/respuesta:", error);
      // Considerar mostrar un mensaje de error al usuario aquí
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {replyTo && (
          <div className="text-gray-500 text-sm">
            Respondiendo a @{replyTo.username || replyTo.displayName || replyTo.email?.split('@')[0]}
          </div>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-white resize-none focus:outline-none"
          rows="3"
          maxLength="280"
        />
        <div className="text-right text-gray-500 text-sm">
          {text.length} / 280
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!text.trim() || !currentUser?.uid}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full disabled:opacity-50"
          >
            {replyTo ? 'Responder' : 'Twittear'}
          </button>
        </div>
      </form>
    </div>
  );
}

TweetBox.propTypes = {
  currentUser: PropTypes.object.isRequired,
  replyTo: PropTypes.object,
  placeholder: PropTypes.string
};
