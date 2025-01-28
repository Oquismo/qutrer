import React from "react";
import { formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import TweetActions from "./TweetActions";
import { deleteTweet } from "../firebase"; // Importamos la nueva función

const DEFAULT_PROFILE_IMAGE = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

export default function Tweet({ tweet, currentUser }) {
  const timestamp = tweet.timestamp?.toDate();
  
  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tweet?')) {
      try {
        await deleteTweet(tweet.id);
      } catch (error) {
        console.error("Error al eliminar tweet:", error);
      }
    }
  };
  
  return (
    <div className="card hover:bg-gray-900 transition-colors cursor-pointer">
      <div className="flex gap-3">
        <img 
          src={tweet.userImage || DEFAULT_PROFILE_IMAGE} 
          alt={tweet.username} 
          className="profile-image"
          onError={(e) => {
            e.target.src = DEFAULT_PROFILE_IMAGE;
          }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{tweet.username}</span>
              <span className="text-gray-500">·</span>
              {timestamp && (
                <span className="text-gray-500">
                  {formatDistance(timestamp, new Date(), { locale: es })}
                </span>
              )}
            </div>
            {currentUser && tweet.userId === currentUser.uid && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="delete-tweet-btn hover:bg-red-500/10 group p-2 rounded-full transition-all duration-200"
                title="Eliminar tweet"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500 group-hover:text-red-500 transition-colors duration-200"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M3 8v8h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2z" />
                  <path d="M14 8h-4v8h4" />
                  <path d="M10 12h2.5" />
                  <path d="M17 8v8h4" />
                </svg>
              </button>
            )}
          </div>
          <p className="mt-2">{tweet.text}</p>
          
          <TweetActions tweet={tweet} />
        </div>
      </div>
    </div>
  );
}
