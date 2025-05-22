// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext"; // Importar NotificationProvider
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import GoogleLoginButton from "./components/GoogleLoginButton";
import './styles/index.css';
import TweetDetail from "./pages/TweetDetail";
import DirectMessages from "./components/DirectMessages"; // Importación para mensajes privados
import Inbox from "./pages/Inbox"; // <-- Agregar esta línea


export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-white">
            {user && <Navbar user={user} />}
            <Routes>
              {!user ? (
                <Route path="/login" element={
                  <div className="flex flex-col items-center justify-center min-h-screen">
                    <GoogleLoginButton />
                  </div>
                } />
              ) : (
                <>
                  <Route path="/" element={<Home user={user} />} />
                  <Route path="/profile" element={<Profile currentUser={user} />} />
                  <Route path="/profile/:userId" element={<Profile currentUser={user} />} />
                  <Route path="/tweet/:tweetId" element={<TweetDetail currentUser={user} />} />
                  <Route path="/messages/:targetUserId" element={<DirectMessages />} />
                  <Route path="/inbox" element={<Inbox />} />
                </>
              )}
              <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}