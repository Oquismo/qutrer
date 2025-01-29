import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, deleteDoc, doc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que necesitas
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Constante para el ID del administrador
export const ADMIN_UID = "ahYDXI6ylmcvRLMUxAEcZ0NvH483";

// Función para verificar si un usuario es administrador
export const isUserAdmin = (uid) => {
  return uid === ADMIN_UID;
};

// Función mejorada para borrar tweets que verifica permisos
export const deleteTweet = async (tweetId, currentUser) => {
  try {
    if (!currentUser) throw new Error("Usuario no autenticado");
    
    // Obtener el tweet
    const tweetRef = doc(db, "tweets", tweetId);
    const tweetDoc = await getDoc(tweetRef);
    
    if (!tweetDoc.exists()) throw new Error("Tweet no encontrado");
    
    // Verificar permisos
    if (tweetDoc.data().userId === currentUser.uid || isUserAdmin(currentUser.uid)) {
      await deleteDoc(tweetRef);
    } else {
      throw new Error("No tienes permiso para borrar este tweet");
    }
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
  }
};