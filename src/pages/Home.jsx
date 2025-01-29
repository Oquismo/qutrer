// src/pages/Home.jsx
import React from "react";
import TweetForm from "../components/TweetForm";
import TweetList from "../components/TweetList";

export default function Home({ user }) {
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#15202B]">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-10 bg-[#15202B]/80 backdrop-blur-md border-b border-gray-800 px-4 py-3">
          <h1 className="text-xl font-bold text-white">Inicio</h1>
        </div>

        <div>
          <TweetForm user={user} />
          <div className="divide-y divide-gray-800">
            <TweetList currentUser={user} />
          </div>
        </div>
      </div>
    </div>
  );
}