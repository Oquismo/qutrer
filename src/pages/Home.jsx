// src/pages/Home.jsx
import React from "react";
import TweetForm from "../components/TweetForm";
import TweetList from "../components/TweetList";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function Home() {
  return (
    <div>
    <div>
      <h1>Bienvenido a Twitter Clone</h1>
      <GoogleLoginButton />
    </div>
      <h1>Inicio</h1>
      <TweetForm />
      <TweetList />
    </div>
  );
}