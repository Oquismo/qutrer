import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verificar/crear documento de usuario en Firestore
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // Crear documento de usuario si no existe
          await setDoc(userRef, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            followers: [],
            following: [],
            createdAt: serverTimestamp()
          });
        }
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
