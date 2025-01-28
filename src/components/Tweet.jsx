import React from "react";
import { formatDistance } from "date-fns";
import { es } from "date-fns/locale";

export default function Tweet({ tweet }) {
  const timestamp = tweet.timestamp?.toDate();
  
  return (
    <div className="card hover:bg-gray-900 transition-colors cursor-pointer">
      <div className="flex gap-3">
        <img src={tweet.userImage} alt={tweet.username} className="profile-image" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold">{tweet.username}</span>
            <span className="text-gray-500">·</span>
            {timestamp && (
              <span className="text-gray-500">
                {formatDistance(timestamp, new Date(), { locale: es })}
              </span>
            )}
          </div>
          <p className="mt-2">{tweet.text}</p>
          <div className="flex gap-4 mt-3 text-gray-500">
            <button className="hover:text-blue-500">
              <span>💬 {tweet.comments || 0}</span>
            </button>
            <button className="hover:text-green-500">
              <span>🔄 {tweet.retweets || 0}</span>
            </button>
            <button className="hover:text-pink-500">
              <span>❤️ {tweet.likes || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
