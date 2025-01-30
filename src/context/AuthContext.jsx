import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
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
          // Referencia al documento del usuario
          const userRef = doc(db, "users", authUser.uid);
          
          // Intentar obtener el documento existente
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            // Si no existe, crear documento con datos iniciales
            const userData = {
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName || authUser.email?.split('@')[0],
              photoURL: authUser.photoURL,
              username: authUser.email?.split('@')[0],
              followers: [],
              following: [],
              createdAt: serverTimestamp()
            };
            
            await setDoc(userRef, userData);
            setUser({ ...authUser, ...userData });
          } else {
            // Si existe, asegurarse de que tenga todos los campos necesarios
            const existingData = userDoc.data();
            const updates = {};
            
            if (!existingData.uid) updates.uid = authUser.uid;
            if (!existingData.displayName) updates.displayName = authUser.displayName || authUser.email?.split('@')[0];
            if (!existingData.username) updates.username = authUser.email?.split('@')[0];
            if (!existingData.followers) updates.followers = [];
            if (!existingData.following) updates.following = [];
            
            if (Object.keys(updates).length > 0) {
              await setDoc(userRef, updates, { merge: true });
              setUser({ ...authUser, ...existingData, ...updates });
            } else {
              setUser({ ...authUser, ...existingData });
            }
          }
        } catch (error) {
          console.error("Error initializing user:", error);
          setUser(authUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
