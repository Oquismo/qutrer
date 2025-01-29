import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import GoogleLoginButton from "./components/GoogleLoginButton";
import UserProfile from "./components/UserProfile";
import "./styles/App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("Usuario autenticado:", currentUser); // Para debug
        console.log("Foto de perfil:", currentUser.photoURL); // Para debug
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="loading-screen">Cargando...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-[#15202B]">
        <Navbar user={user} />
        {!user ? (
          <div className="container">
            <GoogleLoginButton />
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
