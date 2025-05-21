import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase'; // Import db
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null); // Firebase auth user
  const [profile, setProfile] = useState(null); // Firestore user profile data
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        setAuthUser(user);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const firestoreUserData = userDocSnap.data();
            setProfile(firestoreUserData);
            setIsAdmin(firestoreUserData.isAdmin || false); // Set isAdmin from Firestore
          } else {
            console.log("No such user document in Firestore!");
            setProfile(null); // Or set some default profile
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          setProfile(null); // Or set some default profile
          setIsAdmin(false);
        }
        setLoading(false);
      } else {
        setAuthUser(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const value = {
    authUser, // The Firebase auth user object
    profile,    // The Firestore user profile data
    isAdmin,    // isAdmin flag from Firestore
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);