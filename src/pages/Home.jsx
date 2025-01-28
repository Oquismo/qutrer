// src/pages/Home.jsx
import React from "react";
import TweetForm from "../components/TweetForm";
import TweetList from "../components/TweetList";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function Home({ user }) {
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Inicio</h1>
        <div className="flex items-center gap-3 mb-4">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-10 h-10 rounded-full"
            />
          )}
          <p className="text-gray-600">
            Bienvenido, {user.displayName || user.email}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TweetForm user={user} />
        <TweetList />
      </div>
    </div>
  );
}