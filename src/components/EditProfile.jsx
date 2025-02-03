import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [newPhotoURL, setNewPhotoURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username || "");
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user || !user.uid) return setMessage("Usuario no identificado");
    if (!username.trim()) {
      setMessage("El nombre de usuario es obligatorio");
      return;
    }
    setMessage("");
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const updates = { username: username.trim() };
      if (newPhotoURL.trim()) {
        updates.photoURL = newPhotoURL.trim();
      }
      await updateDoc(userRef, updates);
      setUser({ ...user, ...updates });
      setMessage("Perfil actualizado correctamente");
      // Borra el mensaje después de 3 segundos para no mostrar nada cuando no hay error
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      // Registra el error solo en desarrollo
      if (process.env.NODE_ENV === "development") {
        console.error("Error actualizando perfil:", error);
      }
      setMessage("Error actualizando el perfil. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-[#15202B] rounded-lg">
      <h2 className="text-white text-2xl mb-4">Editar Perfil</h2>
      {message && <p className="mb-2 text-white">{message}</p>}
      <form onSubmit={handleUpdate}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-1" htmlFor="username">
            Nombre de usuario (@)
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingrese su nombre de usuario"
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-1" htmlFor="newPhotoURL">
            Nueva URL de imagen de perfil
          </label>
          <input
            id="newPhotoURL"
            type="text"
            value={newPhotoURL}
            onChange={(e) => setNewPhotoURL(e.target.value)}
            placeholder="Ingrese nueva URL de imagen"
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded transition-colors"
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </form>
    </div>
  );
}
