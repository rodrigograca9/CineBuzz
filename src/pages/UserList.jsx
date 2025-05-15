import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";

// API constants
const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MzRkNDdmMDhlYmY4ZjA5OGZiNTk4Y2ViMTA1NGMzZSIsIm5iZiI6MTc0MDA2NDM5Mi42NzkwMDAxLCJzdWIiOiI2N2I3NDY4OGU0ODRmYzIxNTQxYTIzNTEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.eiEa5fYu8UkMxztHU4IgNpCjkxnbmOZVde2p8Zsm2a4';

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

// MoviePoster component
const MoviePoster = ({ movieId }) => {
  const [posterUrl, setPosterUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoviePoster = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/movie/${movieId}`, API_OPTIONS);
        const data = await response.json();
        if (data.poster_path) {
          setPosterUrl(`https://image.tmdb.org/t/p/w200${data.poster_path}`);
        }
      } catch (error) {
        console.error("Erro ao buscar poster:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMoviePoster();
  }, [movieId]);

  if (loading) {
    return <div className="w-16 h-24 bg-gray-800 rounded animate-pulse"></div>;
  }

  if (!posterUrl) {
    return <div className="w-16 h-24 bg-gray-800 rounded flex items-center justify-center">
      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h18M3 16h18"/>
      </svg>
    </div>;
  }

  return (
    <img 
      src={posterUrl} 
      alt="Poster" 
      className="w-16 h-24 object-cover rounded shadow-lg"
    />
  );
};

// ListCard component - Redesigned
// Fixed ListCard component that correctly displays movies
const ListCard = ({ list, onNavigate, onRemove, isOwner }) => {
  const [previewMovies, setPreviewMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movieCount, setMovieCount] = useState(0);
  
  useEffect(() => {
    const processMovies = () => {
      try {
        setLoading(true);
        
        // Handle different possible movie data structures
        let movies = [];
        
        if (list.movies && Array.isArray(list.movies)) {
          movies = list.movies;
        } else if (list.movie_ids && Array.isArray(list.movie_ids)) {
          movies = list.movie_ids;
        } else {
          // If no movies array is found, check if it might be a string that needs parsing
          try {
            if (typeof list.movies === 'string') {
              const parsedMovies = JSON.parse(list.movies);
              if (Array.isArray(parsedMovies)) {
                movies = parsedMovies;
              }
            } else if (typeof list.movie_ids === 'string') {
              const parsedMovies = JSON.parse(list.movie_ids);
              if (Array.isArray(parsedMovies)) {
                movies = parsedMovies;
              }
            }
          } catch (parseError) {
            console.error("Error parsing movies data:", parseError);
          }
        }
        
        setMovieCount(movies.length);
        
        // Get up to 4 movies for preview
        const moviesToPreview = movies.slice(0, 4);
        setPreviewMovies(moviesToPreview);
      } finally {
        setLoading(false);
      }
    };

    processMovies();
  }, [list]);

  const handleClick = () => {
    onNavigate(`/list/${list.id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onNavigate(`/edit-list/${list.id}`);
  };
  
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onRemove(list.id);
  };

  // API constants for MoviePoster
  const API_BASE_URL = "https://api.themoviedb.org/3";
  const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MzRkNDdmMDhlYmY4ZjA5OGZiNTk4Y2ViMTA1NGMzZSIsIm5iZiI6MTc0MDA2NDM5Mi42NzkwMDAxLCJzdWIiOiI2N2I3NDY4OGU0ODRmYzIxNTQxYTIzNTEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.eiEa5fYu8UkMxztHU4IgNpCjkxnbmOZVde2p8Zsm2a4';

  const API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  // MoviePoster component
  const MoviePoster = ({ movieId }) => {
    const [posterUrl, setPosterUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchMoviePoster = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/movie/${movieId}`, API_OPTIONS);
          const data = await response.json();
          if (data.poster_path) {
            setPosterUrl(`https://image.tmdb.org/t/p/w200${data.poster_path}`);
          }
        } catch (error) {
          console.error("Erro ao buscar poster:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchMoviePoster();
    }, [movieId]);

    if (loading) {
      return <div className="w-16 h-24 bg-gray-800 rounded animate-pulse"></div>;
    }

    if (!posterUrl) {
      return <div className="w-16 h-24 bg-gray-800 rounded flex items-center justify-center">
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h18M3 16h18"/>
        </svg>
      </div>;
    }

    return (
      <img 
        src={posterUrl} 
        alt="Poster" 
        className="w-16 h-24 object-cover rounded shadow-lg"
      />
    );
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-gradient-to-br from-slate-800 to-blue-900/30 rounded-xl overflow-hidden shadow-xl hover:shadow-blue-900/20 transition-all duration-300 hover:scale-102 group cursor-pointer"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">{list.name}</h3>
          <span className="px-3 py-1 bg-blue-900/50 text-blue-200 rounded-full text-xs font-medium">
            {movieCount} {movieCount === 1 ? 'filme' : 'filmes'}
          </span>
        </div>
          
        
        <div className="relative mb-4 h-24">
          {loading ? (
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-16 h-24 bg-gray-800 rounded animate-pulse"></div>
              ))}
            </div>
          ) : previewMovies.length > 0 ? (
            <div className="flex gap-2 overflow-hidden">
              {previewMovies.map((movieId, index) => (
                <div key={`${movieId}-${index}`} className="relative" style={{ zIndex: 10 - index }}>
                  <MoviePoster movieId={movieId} />
                </div>
              ))}
              {movieCount > 4 && (
                <div className="w-16 h-24 bg-blue-900/70 rounded flex items-center justify-center text-white font-bold">
                  +{movieCount - 4}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-blue-900/30 rounded-lg">
              <span className="text-blue-200 text-sm">Lista vazia</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">
            Criada em {new Date(list.created_at).toLocaleDateString('pt-BR')}
          </span>
          
          {isOwner && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={handleEditClick}
                className="p-2 bg-blue-800/80 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button 
                onClick={handleDeleteClick}
                className="p-2 bg-red-800/70 hover:bg-red-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Demo UI to display the component
const DemoUI = () => {
  // Sample data that mimics your application's state
  const sampleList = {
    id: "1",
    name: "Filmes Favoritos",
    description: "Minha coleção de filmes favoritos",
    created_at: "2025-04-07T10:30:00",
    // Using movie_ids as in your second file
    movie_ids: [550, 76341, 335984, 299536]
  };
  
  return (
    <div className="bg-gradient-to-b from-slate-900 to-black text-white min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Exemplo de ListCard Corrigido</h2>
        
        <ListCard 
          list={sampleList}
          onNavigate={(path) => console.log("Navegando para:", path)}
          onRemove={(id) => console.log("Removendo lista:", id)}
          isOwner={true}
        />
        
        <div className="mt-8 p-4 bg-slate-800 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Instruções para Implementação</h3>
          <p className="text-gray-300">
            Este componente ListCard foi aprimorado para detectar filmes corretamente
            independentemente do formato dos dados (list.movies, list.movie_ids ou dados em formato JSON string).
          </p>
        </div>
      </div>
    </div>
  );
};

// UserInfo component
const UserInfo = ({ userData, listsCount }) => {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-6 mb-8 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="bg-blue-700 w-16 h-16 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {userData.username ? userData.username.charAt(0).toUpperCase() : '?'}
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{userData.username || 'Usuário'}</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              <span className="text-sm text-blue-200">{listsCount} {listsCount === 1 ? 'lista' : 'listas'}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              <span className="text-sm text-blue-200">Cinéfilo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading state component
const LoadingState = () => (
  <div className="bg-gradient-to-b from-slate-900 to-black text-white min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-lg text-blue-200">Carregando suas listas de filmes...</p>
    </div>
  </div>
);

// Error state component
const ErrorState = ({ message, onBack }) => (
  <div className="bg-gradient-to-b from-slate-900 to-black text-white min-h-screen p-6 flex items-center justify-center">
    <div className="max-w-md mx-auto bg-gradient-to-br from-slate-800 to-red-900/30 p-8 rounded-lg shadow-lg">
      <div className="text-center">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p className="text-red-300 mb-6 text-lg">{message}</p>
        <button 
          onClick={onBack} 
          className="bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Voltar
        </button>
      </div>
    </div>
  </div>
);

// Empty state component
const EmptyState = ({ isOwner, onExplore, onCreate }) => (
  <div className="bg-gradient-to-br from-slate-800 to-blue-900/30 rounded-xl p-8 text-center shadow-xl">
    <svg className="w-20 h-20 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
    <h3 className="text-xl font-bold text-white mb-2">Nenhuma lista encontrada</h3>
    <p className="text-gray-300 mb-6">
      {isOwner 
        ? "Crie sua primeira lista de filmes para organizar seus títulos favoritos." 
        : "Este usuário ainda não criou nenhuma lista de filmes."}
    </p>
    <div className="flex gap-4 justify-center">
      {isOwner && (
        <button 
          onClick={onCreate} 
          className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Criar nova lista
        </button>
      )}
      <button 
        onClick={onExplore} 
        className="bg-indigo-800/50 text-indigo-200 px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        Explorar filmes
      </button>
    </div>
  </div>
);

// Main UserLists component
export default function UserLists() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error("Erro de autenticação: " + sessionError.message);
        
        const currentUserId = sessionData?.session?.user?.id;
        setIsOwner(currentUserId === userId);
        
        // Fetch user data
        const { data, error: userError } = await supabase
          .from("users")
          .select("username, email")
          .eq("uid", userId)
          .single();
        
        if (userError) throw new Error("Erro ao buscar dados do utilizador: " + userError.message);
        
        setUserData({
          ...data,
          uid: userId
        });
        
        // Fetch user's lists
        const { data: listsData, error: listsError } = await supabase
          .from("user_lists")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        
        if (listsError) throw new Error("Erro ao buscar listas: " + listsError.message);
        
        // Process lists
        const processedLists = (listsData || []).map(list => {
          let movieIds = list.movie_ids;
          if (movieIds && typeof movieIds === "string") {
            try {
              movieIds = JSON.parse(movieIds);
            } catch {
              movieIds = [];
            }
          }
          return {
            ...list,
            movie_ids: Array.isArray(movieIds) ? movieIds : [],
            movies: Array.isArray(list.movies) ? list.movies : []
          };
        });
        
        setUserLists(processedLists);
        
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);

  const handleRemoveList = async (listId) => {
    if (!isOwner) return;
    
    // Confirm deletion
    if (!window.confirm("Tem certeza que deseja excluir esta lista?")) {
      return;
    }
    
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from("user_lists")
        .delete()
        .eq("id", listId)
        .eq("user_id", userId);
      
      if (error) throw new Error("Erro ao excluir lista: " + error.message);
      
      // Update local state
      setUserLists(userLists.filter(list => list.id !== listId));
      
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir lista: " + err.message);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onBack={() => navigate(-1)} />;
  }

  if (!userData) {
    return <ErrorState message="Usuário não encontrado" onBack={() => navigate(-1)} />;
  }

  return (
    <div className="bg-gradient-to-b from-slate-900 to-black text-white min-h-screen pb-16">
      {/* Header - Navbar */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 shadow-lg shadow-blue-900/30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="bg-blue-800/50 hover:bg-blue-800 p-2 rounded-full transition-colors"
                aria-label="Voltar"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div className="text-lg md:text-xl font-bold text-white truncate">
                {userData.username ? `Coleção de ${userData.username}` : 'Coleção de filmes'}
              </div>
            </div>
            <div className="hidden md:flex gap-2">
              <button 
                onClick={() => navigate('/')}
                className="bg-blue-800/50 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                <span>Home</span>
              </button>
              
              {isOwner && (
                <button 
                  onClick={() => navigate('/profile')}
                  className="bg-blue-800/50 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span>Perfil</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* User Info */}
        <UserInfo userData={userData} listsCount={userLists.length} />
        
        {/* Create List Button */}
        {isOwner && (
          <div className="mb-8 flex justify-center">
            <button 
              onClick={() => navigate('/create-list')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 rounded-lg transition-all shadow-md hover:shadow-blue-700/30 flex items-center gap-2 text-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Criar nova lista
            </button>
          </div>
        )}
        
        {/* Lists Grid */}
        {userLists.length === 0 ? (
          <EmptyState 
            isOwner={isOwner} 
            onExplore={() => navigate('/')} 
            onCreate={() => navigate('/create-list')} 
          />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {userLists.length} {userLists.length === 1 ? 'Lista' : 'Listas'} de Filmes
              </h2>
              <div className="flex gap-2">
                <button className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
                  </svg>
                  <span className="text-sm">Mais recentes</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userLists.map(list => (
                <ListCard 
                  key={list.id} 
                  list={list} 
                  onNavigate={navigate} 
                  onRemove={handleRemoveList}
                  isOwner={isOwner}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}