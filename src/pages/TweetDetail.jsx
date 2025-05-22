import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, orderBy, onSnapshot as onSnapshotCollection } from 'firebase/firestore';
import { db } from '../firebase';
import Tweet from '../components/Tweet';
import ProfileImageUploader from '../components/ProfileImageUploader';
import TweetBox from '../components/TweetBox';

const AdminIcon = React.lazy(() => import('../components/AdminIcon'));

export default function TweetDetail({ currentUser }) {
  const { tweetId } = useParams();
  const [tweet, setTweet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!tweetId) {
      setError("ID de Tweet no proporcionado.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const unsubscribeTweet = onSnapshot(
      doc(db, 'tweets', tweetId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setTweet({
            id: docSnapshot.id,
            ...docSnapshot.data()
          });
        } else {
          setError("El tweet no existe o fue eliminado.");
          setTweet(null);
        }
        setLoading(false);
      },
      (err) => { 
        console.error('Error cargando tweet:', err);
        setError("Error al cargar el tweet.");
        setLoading(false);
      }
    );

    setLoadingReplies(true);
    const repliesQuery = query(
      collection(db, 'tweets'), 
      where("replyToId", "==", tweetId),
      orderBy("timestamp", "asc")
    );

    const unsubscribeReplies = onSnapshotCollection(repliesQuery, (snapshot) => {
      const fetchedReplies = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }));
      setReplies(fetchedReplies);
      setLoadingReplies(false);
    }, (err) => {
      console.error('Error cargando respuestas:', err);
      setLoadingReplies(false);
    });

    return () => {
      unsubscribeTweet();
      unsubscribeReplies();
    };
  }, [tweetId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-light-text dark:border-dark-text"></div>
      </div>
    );
  }

  if (error) { 
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background flex flex-col items-center justify-center text-light-text dark:text-dark-text">
        <p className="mb-4 text-red-500">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="text-twitter-blue hover:underline"
        >
          ← Volver
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="max-w-2xl mx-auto">
        {tweet && (
          <>
            <Tweet tweet={tweet} currentUser={currentUser} isDetail={true} />
            {/* Formulario para responder directamente en la vista de detalle */}
            <div className="p-4 border-t border-light-border dark:border-dark-border">
              <TweetBox currentUser={currentUser} replyTo={tweet} placeholder="Publica tu respuesta" />
            </div>
            {/* Sección de respuestas */}
            <div className="mt-4">
              <h2 className="text-xl font-bold px-4 mb-2 text-light-text dark:text-dark-text">Respuestas</h2>
              {loadingReplies ? (
                <div className="flex justify-center items-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-light-text dark:border-dark-text"></div>
                </div>
              ) : replies.length > 0 ? (
                replies.map(reply => (
                  <Tweet 
                    key={reply.id} 
                    tweet={reply} 
                    currentUser={currentUser} 
                    isDetail={false} // Una respuesta no es el tweet principal de esta vista
                    isReplyInThread={true} // Indica que es parte de un hilo
                    showThread={true} // Permite que esta respuesta muestre sus propias respuestas
                  />
                ))
              ) : (
                <p className="px-4 text-light-text dark:text-dark-text">No hay respuestas aún.</p>
              )}
            </div>
          </>
        )}
        {!tweet && !loading && !error && (
          <div className="p-4 text-center text-light-text dark:text-dark-text">
            <p>El tweet no se pudo cargar o no existe.</p>
          </div>
        )}
        {currentUser?.isAdmin && (
          <Suspense fallback={<div>Cargando...</div>}>
            <AdminIcon />
          </Suspense>
        )}
        {/* {currentUser && <ProfileImageUploader currentUser={currentUser} />} */}
      </div>
    </div>
  );
}
