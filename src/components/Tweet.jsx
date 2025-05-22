import React, { useState, useEffect, Suspense } from "react"; // Added useEffect
import { formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate, Link } from "react-router-dom";
// Asegurarse que getDoc, collection, query, where, getDocs, orderBy estén importados
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'; 
import { db } from '../firebase';
import TweetActions from "./TweetActions";
import FollowButton from './FollowButton';
import { deleteTweet } from "../firebase";
import { useAuth } from '../context/AuthContext';

// Declarar AdminIcon junto a los demás imports
const AdminIcon = React.lazy(() => import('./AdminIcon'));

const DEFAULT_PROFILE_IMAGE = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

// Función para parsear texto y convertir #hashtags y @menciones en enlaces
const parseTweetText = (text) => text.split(/(#[\w]+|@[\w]+)/g).map((part, i) => {
  if (part.startsWith('#')) {
    return <Link key={i} to={`/search?q=${encodeURIComponent(part)}`} className="text-blue-400 hover:underline">{part}</Link>;
  } else if (part.startsWith('@')) {
    return <Link key={i} to={`/search?q=${encodeURIComponent(part)}`} className="text-blue-400 hover:underline">{part}</Link>;
  }
  return part;
});

export default React.memo(function Tweet({ 
  tweet: initialTweet, 
  currentUser, 
  isDetail = false, 
  isReplyInThread = false,
  showThread = true // Nueva prop para controlar la visualización del hilo
}) {
  // Declarar todos los Hooks aquí, antes de cualquier return condicional.
  const [tweet, setTweet] = useState(initialTweet);
  const [replies, setReplies] = useState([]); // Estado para las respuestas
  const navigate = useNavigate();
  const { user: authUser, isAdmin } = useAuth();
  
  React.useEffect(() => {
    // Solo actualizar si initialTweet realmente existe y es diferente
    if (initialTweet && initialTweet.id !== tweet?.id) {
      setTweet(initialTweet);
    } else if (!initialTweet && tweet) {
      // Si initialTweet es nulo pero tenemos un tweet en el estado, podríamos querer limpiarlo
      // o manejarlo según la lógica de la aplicación. Por ahora, lo dejamos como está
      // o podríamos setearlo a null o a un estado inicial vacío si es apropiado.
    }
  }, [initialTweet, tweet]);

  React.useEffect(() => {
    if (authUser?.uid === tweet?.userId && authUser?.photoURL && authUser.photoURL !== tweet?.userImage) {
      setTweet((prevTweet) => ({
        ...prevTweet,
        userImage: authUser.photoURL,
      }));
    }
  }, [authUser, tweet?.userId, tweet?.userImage]);

  React.useEffect(() => {
    const fetchUserData = async () => {
      if (!tweet?.userId) { 
        console.warn(`Tweet.jsx: tweet.userId está ausente para el tweet ID: ${tweet?.id}. No se pueden cargar los datos del usuario.`);
        setTweet(prev => ({
            ...(prev || {}), // Asegurarse que prev no sea null
            displayName: prev?.displayName || "Usuario Desconocido", 
            username: prev?.username || "unknown", 
            userImage: prev?.userImage || DEFAULT_PROFILE_IMAGE 
        }));
        return; 
      }
      const userRef = doc(db, "users", tweet.userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setTweet((prevTweet) => {
          if (!prevTweet) return null; // Si prevTweet es null, no hacer nada o manejarlo
          // Solo actualizar si los datos son realmente diferentes para evitar bucles innecesarios
          if (prevTweet.userImage === (userData.photoURL || DEFAULT_PROFILE_IMAGE) &&
              prevTweet.displayName === (userData.displayName || prevTweet.displayName) &&
              prevTweet.username === (userData.username || prevTweet.username)) {
            return prevTweet;
          }
          return {
            ...prevTweet,
            userImage: userData.photoURL || prevTweet.userImage || DEFAULT_PROFILE_IMAGE,
            displayName: userData.displayName || prevTweet.displayName,
            username: userData.username || prevTweet.username
          };
        });
      } else {
        console.warn(`Tweet.jsx: Documento de usuario no encontrado para userId: ${tweet.userId} en tweet: ${tweet.id}`);
         setTweet(prev => ({ 
            ...(prev || {}), 
            displayName: prev?.displayName || "Usuario Desconocido", 
            username: prev?.username || "unknown", 
            userImage: prev?.userImage || DEFAULT_PROFILE_IMAGE 
        }));
      }
    };

    if (tweet?.id && tweet?.userId) { 
        fetchUserData();
    } else if (tweet && !tweet.userId) { // Si tenemos un tweet pero no userId, intentamos cargar datos por defecto
        fetchUserData(); 
    }
  }, [tweet?.id, tweet?.userId]); 

  // Efecto para cargar las respuestas del tweet
  useEffect(() => {
    if (!tweet?.id || !showThread) { // Solo cargar respuestas si showThread es true
      setReplies([]); // Limpiar respuestas si no se debe mostrar el hilo
      return;
    }

    const fetchReplies = async () => {
      try {
        const repliesQuery = query(
          collection(db, "tweets"), 
          where("replyToId", "==", tweet.id), // Corregido de "replyTo" a "replyToId"
          orderBy("timestamp", "asc") // O 'desc' según preferencia
        );
        const querySnapshot = await getDocs(repliesQuery);
        const fetchedReplies = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReplies(fetchedReplies);
      } catch (error) {
        console.error("Error fetching replies:", error);
      }
    };

    fetchReplies();
  }, [tweet?.id, showThread]); // Depender de tweet.id y showThread

  const handleDelete = React.useCallback(async () => {
    if (!tweet?.id) return; // Asegurarse que tweet.id exista
    console.log('handleDelete triggered for tweet:', tweet.id, 'currentUser:', currentUser?.uid);
    if (!window.confirm('¿Estás seguro de que quieres eliminar este tweet?')) return;
    try {
      await deleteTweet(tweet.id, currentUser); 
      alert('Tweet eliminado correctamente');
      if (isDetail) {
        navigate(-1);
      }
    } catch (error) {
      console.error("Error al eliminar tweet:", error);
      alert(`Error al eliminar tweet: ${error.message}`);
    }
  }, [tweet?.id, currentUser, isDetail, navigate]); 

  const handleClick = React.useCallback((e) => {
    if (isDetail || !tweet?.id) return; 
    if (e.target.closest('button') || e.target.closest('a')) return; 
    navigate(`/tweet/${tweet.id}`); 
  }, [isDetail, tweet?.id, navigate]); 

  const handleTweetClick = (e) => {
    e.stopPropagation();
  };
  
  // Ahora, la condición de retorno temprano.
  if (!initialTweet || !initialTweet.id) {
    console.error("Tweet.jsx: initialTweet o initialTweet.id es nulo o indefinido. Props recibidas:", { initialTweet, currentUser, isDetail, isReplyInThread });
    if (isReplyInThread) return null; 
    return <div className="text-red-500 p-4 border border-red-500">Error: No se pudieron cargar los datos de este tweet.</div>;
  }
  
  // Si initialTweet es válido, pero el estado 'tweet' se volvió nulo por alguna razón (poco probable con la lógica actual, pero por seguridad)
  if (!tweet) {
      // Esto podría pasar si initialTweet es válido, pero luego algo en los useEffects setea tweet a null.
      // Considerar si esto es un estado válido o si se debe mostrar un error/loader.
      // Por ahora, si initialTweet era válido, intentamos renderizar con eso o un loader.
      // Esto es una salvaguarda, la lógica de useEffect debería prevenir que tweet sea null si initialTweet es válido.
      console.warn("Tweet.jsx: El estado 'tweet' es nulo a pesar de que initialTweet era válido. Esto es inesperado.");
      if (isReplyInThread) return null; // No renderizar nada si es una respuesta y el tweet principal es nulo
      return <div className="text-yellow-500 p-4 border border-yellow-500">Cargando tweet o estado inesperado...</div>;
  }

  const timestamp = tweet.timestamp?.toDate(); 
  
  return (
    <>
      <div 
        onClick={handleClick}
        className={`group transition-all duration-200 
          ${isReplyInThread 
            ? 'ml-5 sm:ml-10 pl-3 sm:pl-4 border-l-2 border-gray-700 dark:border-gray-600 pt-3 pb-2' 
            : 'px-4 pt-4 pb-3'}
          ${!isDetail && !isReplyInThread ? 'hover:bg-gray-900/30 cursor-pointer' : ''}
          ${isDetail && !isReplyInThread ? 'pb-3' : ''} 
        `}
        role="article"
        aria-labelledby={`tweet-author-${tweet.id}`} 
      >
        <div className="flex space-x-3">
          <Link 
            to={`/profile/${tweet.userId}`}
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Ver perfil de ${tweet.displayName || tweet.username || 'usuario'}`}
          >
            <img 
              src={tweet.userImage || DEFAULT_PROFILE_IMAGE} 
              alt={`Foto de perfil de ${tweet.displayName || tweet.username || 'usuario'}`}
              className={`rounded-full ring-2 ring-gray-800 group-hover:ring-gray-700 transition-all cursor-pointer hover:ring-blue-500 
                ${isReplyInThread ? 'w-10 h-10' : 'w-12 h-12'}`}
              onError={(e) => {
                e.target.src = DEFAULT_PROFILE_IMAGE;
              }}
            />
          </Link>
          <div className="flex-1 min-w-0" onClick={handleTweetClick}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link 
                  to={`/profile/${tweet.userId}`} 
                  className="hover:underline"
                  onClick={(e) => e.stopPropagation()}
                  id={`tweet-author-${tweet.id}`}
                >
                  <span className="font-bold text-white text-sm sm:text-base">
                    {tweet.displayName ? tweet.displayName : (tweet.username || "Usuario")}
                  </span>
                </Link>
                {/* No mostrar icono de admin en respuestas de hilo para no sobrecargar */}
                {/* {tweet.userId === authUser?.uid && isAdmin && !isReplyInThread && ( ... ) } */}
                {/* Mostrar @username si está disponible y es diferente del displayName */}
                {tweet.username && tweet.username !== tweet.displayName && (
                  <span className="text-gray-500 text-xs sm:text-sm">
                    @{tweet.username}
                  </span>
                )}
                <span className="text-gray-500 text-xs sm:text-sm">·</span>
                {timestamp && (
                  <span className="text-gray-500 text-xs sm:text-sm">
                    {formatDistance(timestamp, new Date(), { locale: es })}
                  </span>
                )}
              </div>
              {/* Botones de eliminar (solo si no es una respuesta en hilo para no sobrecargar la UI) */}
              {!isReplyInThread && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {currentUser && tweet.userId === currentUser.uid && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                        className="p-1 sm:p-2 rounded-full hover:bg-red-500/10 transition-colors"
                        title="Eliminar mi tweet"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-hover:text-red-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.032 3.22.094M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {isAdmin && tweet.userId !== currentUser?.uid && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                      className="p-1 sm:p-2 rounded-full hover:bg-yellow-500/10 transition-colors"
                      title="Eliminar como administrador"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className={`mt-1 sm:mt-2 text-white break-words ${isReplyInThread ? 'text-sm' : 'text-base'}`}>
              {typeof tweet.text === 'string' ? parseTweetText(tweet.text) : (isDetail ? "Este tweet no tiene contenido o está cargando." : "")}
            </p>
            
            <TweetActions tweet={tweet} currentUser={currentUser} isReplyInThread={isReplyInThread} />
          </div>
        </div>
      </div>
      {/* Sección para mostrar respuestas */}
      {showThread && replies.length > 0 && (
        <div className="mt-0 pt-0"> {/* Ajustar márgenes y paddings si es necesario */}
          {replies.map(reply => (
            <Tweet 
              key={reply.id} 
              tweet={reply} 
              currentUser={currentUser} 
              isDetail={isDetail} // Mantener el contexto de si estamos en la vista de detalle
              isReplyInThread={true} 
              showThread={true} // Las respuestas también pueden tener sus propios hilos
            />
          ))}
        </div>
      )}
    </>
  );
})
