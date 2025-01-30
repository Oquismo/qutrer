import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
            if (!existingData.photoURL) updates.photoURL = authUser.photoURL;
            
            if (Object.keys(updates).length > 0) {
              await setDoc(userRef, updates, { merge: true });
              setUser({ ...authUser, ...existingData, ...updates });
            } else {
              setUser({ ...authUser, ...existingData });
            }
          }

          // Verificar si el usuario es administrador
          const adminDoc = await getDoc(doc(db, "admins", authUser.uid));
          setIsAdmin(adminDoc.exists());
        } catch (error) {
          console.error("Error initializing user:", error);
          setUser(authUser);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateProfileImage = async (newPhotoURL) => {
    if (user) {
      await updateProfile(auth.currentUser, { photoURL: newPhotoURL });
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { photoURL: newPhotoURL });
      setUser({ ...user, photoURL: newPhotoURL });
    }
  };

  const value = useMemo(() => ({ user, loading, isAdmin, updateProfileImage }), [user, loading, isAdmin]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
