import React from "react";
import { formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import TweetActions from "./TweetActions";

const DEFAULT_PROFILE_IMAGE = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

export default function Tweet({ tweet }) {
  const timestamp = tweet.timestamp?.toDate();
  
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
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{tweet.username}</span>
            <span className="text-gray-500">·</span>
            {timestamp && (
              <span className="text-gray-500">
                {formatDistance(timestamp, new Date(), { locale: es })}
              </span>
            )}
          </div>
          <p className="mt-2">{tweet.text}</p>
          
          <TweetActions tweet={tweet} />
        </div>
      </div>
    </div>
  );
}
