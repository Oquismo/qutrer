// src/components/TweetList.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import Tweet from "./Tweet";

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

  return (
    <div className="flex flex-col gap-4">
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} tweet={tweet} currentUser={currentUser} />
      ))}
    </div>
  );
}