// src/components/TweetForm.jsx
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button, TextField } from "@mui/material";

export default function TweetForm({ user }) {
  const [tweet, setTweet] = useState("");

  const handleSubmit = async () => {
    if (tweet.trim() === "") return;

    await addDoc(collection(db, "tweets"), {
      text: tweet,
      userId: user.uid,
      username: user.email,
      timestamp: serverTimestamp(),
    });

    setTweet("");
  };

  return (
    <div>
      <TextField
        label="¿Qué está pasando?"
        value={tweet}
        onChange={(e) => setTweet(e.target.value)}
        multiline
        rows={4}
      />
      <Button onClick={handleSubmit}>Publicar</Button>
    </div>
  );
}