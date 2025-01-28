// src/components/TweetForm.jsx
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button, TextField } from "@mui/material";

export default function TweetForm({ user }) {
  const [tweet, setTweet] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (tweet.trim() === "") return;
    setIsLoading(true);
    try {
      console.log("Intentando guardar tweet...");
      console.log("Usuario:", user);
      
      const docRef = await addDoc(collection(db, "tweets"), {
        text: tweet,
        userId: user.uid,
        username: user.displayName || user.email,
        userImage: user.photoURL,
        timestamp: serverTimestamp(),
      });
      
      console.log("Tweet guardado con ID:", docRef.id);
      setTweet("");
    } catch (error) {
      console.error("Error detallado:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-b border-gray-200 p-4">
      <TextField
        fullWidth
        label="¿Qué está pasando?"
        value={tweet}
        onChange={(e) => setTweet(e.target.value)}
        multiline
        rows={4}
        variant="outlined"
        className="mb-4"
      />
      <Button 
        variant="contained" 
        onClick={handleSubmit}
        disabled={tweet.trim() === "" || isLoading}
        className="float-right"
      >
        {isLoading ? "Publicando..." : "Publicar"}
      </Button>
    </div>
  );
}