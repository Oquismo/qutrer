// src/components/TweetList.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { Typography, Card, CardContent } from "@mui/material";

export default function TweetList() {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "tweets"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTweets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {tweets.map((tweet) => (
        <Card key={tweet.id}>
          <CardContent>
            <Typography variant="h6">{tweet.username}</Typography>
            <Typography>{tweet.text}</Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}