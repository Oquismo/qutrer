import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import Tweet from '../components/Tweet';
import ProfileImageUploader from '../components/ProfileImageUploader';
import TweetBox from '../components/TweetBox';

const AdminIcon = React.lazy(() => import('../components/AdminIcon'));

export default function TweetDetail({ currentUser }) {
  const { tweetId } = useParams();
  const [tweet, setTweet] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!tweetId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'tweets', tweetId),
      (doc) => {
        if (doc.exists()) {
          setTweet({
            id: doc.id,
            ...doc.data()
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error cargando tweet:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tweetId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#15202B] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!tweet) {
    return (
      <div className="min-h-screen bg-[#15202B] flex flex-col items-center justify-center text-white">
        <p className="mb-4">Este tweet no existe o fue eliminado</p>
        <button 
          onClick={() => navigate(-1)}
          className="text-blue-400 hover:text-blue-300"
        >
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#15202B]">
      <div className="max-w-2xl mx-auto">
        <div className="border-b border-gray-800 p-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-white hover:text-blue-400 flex items-center gap-2 mb-4"
          >
            ← Volver
          </button>
        </div>
        <Tweet 
          tweet={tweet} 
          currentUser={currentUser} 
          isDetail={true}
        />
        {currentUser && (
          <div className="border-t border-gray-800 p-4">
            <TweetBox 
              currentUser={currentUser}
              replyTo={tweet}
              placeholder="Publica tu respuesta"
            />
          </div>
        )}
        {currentUser?.isAdmin && (
          <Suspense fallback={<div>Cargando...</div>}>
            <AdminIcon />
          </Suspense>
        )}
        {currentUser && <ProfileImageUploader currentUser={currentUser} />}
      </div>
    </div>
  );
}
