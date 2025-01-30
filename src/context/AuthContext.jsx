import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          // Verificar si el usuario existe en Firestore
          const userRef = doc(db, 'users', authUser.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            // Crear documento de usuario si no existe
            await setDoc(userRef, {
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName || authUser.email?.split('@')[0],
              photoURL: authUser.photoURL,
              followers: [],
              following: [],
              createdAt: serverTimestamp()
            });
            
            // Obtener el documento actualizado
            const updatedDoc = await getDoc(userRef);
            setUser({ ...authUser, ...updatedDoc.data() });
          } else {
            // Combinar datos de Auth y Firestore
            setUser({ ...authUser, ...userDoc.data() });
          }
        } catch (error) {
          console.error("Error setting up user:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
