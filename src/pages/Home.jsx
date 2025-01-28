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
        <div className="profile-header">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="profile-image"
            />
          )}
          <div className="profile-info">
            <span className="profile-name">{user.displayName}</span>
            <span className="profile-email">{user.email}</span>
          </div>
        </div>
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