// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, deleteDoc, doc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: "AIzaSyB5CV_ZNWmyDWMbWOBNQjx67AZtO0mvstI",
//   authDomain: "twitter-clone-edfdb.firebaseapp.com",
//   projectId: "twitter-clone-edfdb",
//   storageBucket: "twitter-clone-edfdb.firebasestorage.app",
//   messagingSenderId: "654030345618",
//   appId: "1:654030345618:web:8159c5844278b5fad4dd4b",
//   measurementId: "G-3PSGHERSHP"
// };



const firebaseConfig = {
  apiKey: "EACT_APP_FIREBASE_API_KEY",
  authDomain: "REACT_APP_FIREBASE_AUTH_DOMAIN",
  projectId: "REACT_APP_FIREBASE_PROJECT_ID",
  storageBucket: "REACT_APP_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
  appId: "EACT_APP_FIREBASE_APP_ID",
  measurementId: "REACT_APP_FIREBASE_MEASUREMENT_ID"
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

// Añadir estas nuevas funciones de autenticación
export const registerWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error al registrar:", error);
    throw error;
  }
};

export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }};