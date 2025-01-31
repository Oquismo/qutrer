// src/components/TweetList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import Tweet from "./Tweet";

const TWEETS_PER_PAGE = 20;

export default React.memo(function TweetList({ currentUser }) {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "tweets"), 
      orderBy("timestamp", "desc"),
      limit(TWEETS_PER_PAGE)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTweets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tweets:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Cargando tweets...</div>;
  }

  return (
    <div className="flex flex-col divide-y divide-gray-800">
      {tweets.map((tweet) => (
        <Tweet 
          key={tweet.id} 
          tweet={tweet} 
          currentUser={currentUser}
        />
      ))}
    </div>
  );
});