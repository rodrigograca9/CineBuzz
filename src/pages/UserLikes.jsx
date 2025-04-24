import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";

// API constants from MovieDetails component
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
const MovieCard = ({ movieId, onNavigate, onRemove }) => {
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

      {onRemove && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove(movieId);
          }}
          className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default function UserLikes() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
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
          .select("username, email, likes")
          .eq("uid", userId)
          .single();
        
        if (userError) throw new Error("Erro ao buscar dados do utilizador: " + userError.message);
        
        setUserData({
          ...data,
          uid: userId,
          likes: data.likes || [],
        });
        
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);

  const handleRemoveLike = async (movieId) => {
    if (!isOwner || !userData) return;
    
    try {
      // Filter out the movie to remove
      const updatedLikes = userData.likes.filter(id => id !== movieId);
      
      // Update in Supabase
      const { error } = await supabase
        .from("users")
        .update({ likes: updatedLikes })
        .eq("uid", userId);
      
      if (error) throw new Error("Erro ao atualizar likes: " + error.message);
      
      // Update local state
      setUserData({
        ...userData,
        likes: updatedLikes
      });
      
    } catch (err) {
      console.error(err);
      alert("Erro ao remover filme dos likes: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#14181C] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando likes...</p>
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
                {userData.username ? `Filmes curtidos por ${userData.username}` : 'Filmes curtidos'}
              </h1>
            </div>
            <div className="bg-blue-800 px-4 py-2 rounded-full">
              <span className="font-medium">{userData.likes.length} {userData.likes.length === 1 ? 'filme' : 'filmes'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {userData.likes.length === 0 ? (
          <div className="bg-[#1C2228] rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            <p className="text-gray-400 text-lg">Nenhum filme curtido ainda.</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Explorar filmes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {userData.likes.map(movieId => (
              <MovieCard 
                key={movieId} 
                movieId={movieId} 
                onNavigate={navigate} 
                onRemove={isOwner ? handleRemoveLike : null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}