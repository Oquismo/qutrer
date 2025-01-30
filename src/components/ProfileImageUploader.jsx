import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ProfileImageUploader({ currentUser }) {
  const [uploading, setUploading] = useState(false);
  const { updateProfileImage } = useAuth();
  const storage = getStorage();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const storageRef = ref(storage, `profileImages/${currentUser.uid}`);
    await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(storageRef);
    await updateProfileImage(photoURL);
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, { photoURL });
    setUploading(false);
  };

  return (
    <div className="profile-image-uploader">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload} 
        disabled={uploading}
      />
      {uploading && <p>Subiendo imagen...</p>}
    </div>
  );
}
