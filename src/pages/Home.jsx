// src/pages/Home.jsx
import React from "react";
import TweetForm from "../components/TweetForm";
import TweetList from "../components/TweetList";

export default function Home({ user }) {
  if (!user) {
    return null;
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Inicio</h1>
      </div>

      <div className="card">
        <TweetForm user={user} />
        <div className="divider">
          <TweetList />
        </div>
      </div>
    </div>
  );
}