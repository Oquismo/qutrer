import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ProfileImageUploader({ currentUser }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { updateProfileImage } = useAuth();
  const storage = getStorage();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validar tipo y tamaño (por ejemplo, menor a 5MB)
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      alert("El archivo debe ser una imagen y menor a 5MB.");
      return;
    }

    setUploading(true);
    const storageRef = ref(storage, `profileImages/${currentUser.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', snapshot => {
      const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      setUploadProgress(progress);
    }, error => {
      console.error("Error en la carga:", error);
      setUploading(false);
    }, async () => {
      const photoURL = await getDownloadURL(uploadTask.snapshot.ref);
      await updateProfileImage(photoURL);
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { photoURL });
      setUploading(false);
      setUploadProgress(0);
    });
  };

  return (
    <div className="profile-image-uploader">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload} 
        disabled={uploading}
      />
      {uploading && (
        <div>
          <p>Subiendo imagen... {uploadProgress}%</p>
          {/* Puedes añadir una barra de progreso aquí */}
        </div>
      )}
    </div>
  );
}
