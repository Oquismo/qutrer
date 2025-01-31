import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULT_PROFILE_IMAGE = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

export const getUserProfile = async (userId) => {
  if (!userId) return null;
  
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const getProfileImage = (user, defaultImage = DEFAULT_PROFILE_IMAGE) => {
  return user?.photoURL || defaultImage;
};
