import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { auth, isUserAdmin, db } from '../firebase';
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
          const userRef = doc(db, "users", authUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            // Si no existe, crear documento con datos iniciales
            const userData = {
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName || authUser.email?.split('@')[0],
              username: authUser.displayName || authUser.email?.split('@')[0],
              photoURL: authUser.photoURL,
              followers: [],
              following: [],
              createdAt: serverTimestamp()
            };
            
            await setDoc(userRef, userData);
            setUser({ ...authUser, ...userData });
          } else {
            // Asegurarse de que el documento tiene todos los campos necesarios
            const existingData = userDoc.data();
            const updates = {};
            
            if (!existingData.email) updates.email = authUser.email;
            if (!existingData.username) updates.username = authUser.email?.split('@')[0];
            if (!existingData.displayName) updates.displayName = authUser.email?.split('@')[0];
            
            if (Object.keys(updates).length > 0) {
              await updateDoc(userRef, updates);
              setUser({ ...authUser, ...existingData, ...updates });
            } else {
              setUser({ ...authUser, ...existingData });
            }
          }

          // Verificar si el usuario es administrador
          const admin = await isUserAdmin(authUser.uid);
          setIsAdmin(admin);
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
