// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, deleteDoc, doc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB5CV_ZNWmyDWMbWOBNQjx67AZtO0mvstI",
  authDomain: "twitter-clone-edfdb.firebaseapp.com",
  projectId: "twitter-clone-edfdb",
  storageBucket: "twitter-clone-edfdb.firebasestorage.app",
  messagingSenderId: "654030345618",
  appId: "1:654030345618:web:8159c5844278b5fad4dd4b",
  measurementId: "G-3PSGHERSHP",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que necesitas
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export const deleteTweet = async (tweetId) => {
  try {
    const tweetRef = doc(db, "tweets", tweetId);
    await deleteDoc(tweetRef);
  } catch (error) {
    console.error("Error al eliminar el tweet:", error);
    throw error;
  }
};