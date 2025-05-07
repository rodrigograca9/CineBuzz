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

// Movie card component
const MovieCard = ({ movieId, onNavigate }) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/movie/${movieId}`, API_OPTIONS);
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  if (loading) {
    return (
      <div className="w-40 h-60 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie || !movie.poster_path) {
    return (
      <div className="w-40 h-60 bg-gray-800 rounded-lg flex items-center justify-center text-center p-2">
        <span className="text-gray-400 text-xs">{movie?.title || "Filme não encontrado"}</span>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div 
        className="w-40 cursor-pointer hover:opacity-80 transition"
        onClick={() => onNavigate(`/movie/${movieId}`)}
      >
        <img
          src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
          alt={movie.title}
          className="rounded-lg shadow-md hover:scale-105 transform transition duration-300"
        />
        <p className="text-sm mt-2 text-center text-gray-300 line-clamp-2">{movie.title}</p>
      </div>
    </div>
  );
};

// List Card component
const ListCard = ({ list, onNavigate, onRemove, isOwner }) => {
  const [coverMovie, setCoverMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movieCount, setMovieCount] = useState(0);

  useEffect(() => {
    const fetchCoverImage = async () => {
      // Make sure movies is an array and not null
      const moviesList = list.movies || [];
      
      // Update movie count
      setMovieCount(moviesList.length);
      
      // If the list has movies, fetch the first one for the cover
      if (moviesList.length > 0) {
        try {
          const response = await fetch(`${API_BASE_URL}/movie/${moviesList[0]}`, API_OPTIONS);
          const data = await response.json();
          setCoverMovie(data);
        } catch (error) {
          console.error("Error fetching cover movie:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchCoverImage();
  }, [list]);

  const handleClick = () => {
    onNavigate(`/list/${list.id}`);
  };

  return (
    <div className="bg-[#1C2228] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
      <div className="relative h-40 overflow-hidden cursor-pointer" onClick={handleClick}>
        {loading ? (
          <div className="w-full h-full bg-gray-800 animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : coverMovie && coverMovie.backdrop_path ? (
          <img 
            src={`https://image.tmdb.org/t/p/w500${coverMovie.backdrop_path}`} 
            alt={list.name}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
          />
        ) : coverMovie && coverMovie.poster_path ? (
          <img 
            src={`https://image.tmdb.org/t/p/w500${coverMovie.poster_path}`} 
            alt={list.name}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-full h-full bg-blue-900 flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h18M3 16h18"/>
            </svg>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
        
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h3 className="text-white font-bold text-lg truncate">{list.name}</h3>
          <p className="text-gray-300 text-sm">{movieCount} {movieCount === 1 ? 'filme' : 'filmes'}</p>
        </div>
      </div>
      
      <div className="p-4 flex justify-between items-center">
        <p className="text-gray-400 text-sm truncate max-w-[70%]">{list.description || "Sem descrição"}</p>
        
        {isOwner && (
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemove(list.id);
              }}
              className="text-red-400 hover:text-red-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

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
        
        // Fetch user data for the profile we're viewing
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
        
        // Process lists to ensure movies is always an array
        const processedLists = (listsData || []).map(list => ({
          ...list,
          movies: Array.isArray(list.movies) ? list.movies : []
        }));
        
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
    if (!window.confirm("Tem certeza que deseja eliminar esta lista?")) {
      return;
    }
    
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from("user_lists")
        .delete()
        .eq("id", listId)
        .eq("user_id", userId); // Extra safety check
      
      if (error) throw new Error("Erro ao eliminar lista: " + error.message);
      
      // Update local state
      setUserLists(userLists.filter(list => list.id !== listId));
      
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir lista: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#14181C] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando listas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#14181C] text-white min-h-screen p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-[#1C2228] p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-red-400 mb-6 text-lg">{error}</p>
            <button 
              onClick={() => navigate(-1)} 
              className="bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-[#14181C] text-white min-h-screen p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-[#1C2228] p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <p className="text-white mb-6 text-lg">Usuário não encontrado.</p>
            <button 
              onClick={() => navigate(-1)} 
              className="bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0c] text-white min-h-screen">
      {/* Header */}
      <div className="bg-[#1a237e] p-6 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="bg-blue-900 hover:bg-blue-800 p-2 rounded-full"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-white">
                {userData.username ? `Listas de ${userData.username}` : 'Listas de filmes'}
              </h1>
            </div>
            <div className="bg-blue-800 px-4 py-2 rounded-full">
              <span className="font-medium">{userLists.length} {userLists.length === 1 ? 'lista' : 'listas'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {isOwner && (
          <div className="mb-8 text-center">
            <button 
              onClick={() => navigate('/create-list')}
              className="bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-3 rounded-md flex items-center justify-center mx-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Criar nova lista
            </button>
          </div>
        )}
        
        {userLists.length === 0 ? (
          <div className="bg-[#1C2228] rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-gray-400 text-lg">Nenhuma lista criada ainda.</p>
            {isOwner && (
              <p className="text-gray-500 mt-2 mb-4">
                Crie uma lista de filmes para organizar seus títulos favoritos por tema, gênero ou qualquer critério que desejar.
              </p>
            )}
            <button 
              onClick={() => navigate('/')} 
              className="mt-4 bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Explorar filmes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        )}
      </div>
    </div>
  );
}