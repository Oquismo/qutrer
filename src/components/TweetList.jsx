// src/components/TweetList.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import Tweet from "./Tweet";
import { isUserAdmin, deleteTweet } from '../firebase';

export default function TweetList({ currentUser }) {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    const tweetsQuery = query(
      collection(db, "tweets"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(tweetsQuery, (snapshot) => {
      setTweets(
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (tweetId) => {
    if (!currentUser) return;
    
    try {
      await deleteTweet(tweetId, currentUser);
      // Actualizar la lista de tweets después de borrar
    } catch (error) {
      console.error("Error al borrar tweet:", error);
      // Mostrar mensaje de error al usuario
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {tweets.map((tweet) => (
        <div key={tweet.id} className="tweet">
          <Tweet key={tweet.id} tweet={tweet} currentUser={currentUser} />
          {(tweet.userId === currentUser?.uid || isUserAdmin(currentUser?.uid)) && (
            <button
              onClick={() => handleDelete(tweet.id)}
              className="delete-tweet-btn"
            >
              Eliminar
            </button>
          )}
        </div>
      ))}
    </div>
  );
}