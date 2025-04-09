import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

// Movie card component to reuse across sections
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
      <div className="w-32 h-48 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie || !movie.poster_path) {
    return (
      <div className="w-32 h-48 bg-gray-800 rounded-lg flex items-center justify-center text-center p-2">
        <span className="text-gray-400 text-xs">{movie?.title || "Filme não encontrado"}</span>
      </div>
    );
  }

  return (
    <div 
      className="w-32 cursor-pointer hover:opacity-80 transition"
      onClick={() => onNavigate(`/movie/${movieId}`)}
    >
      <img
        src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
        alt={movie.title}
        className="rounded-lg shadow-md hover:scale-105 transform transition duration-300"
      />
      <p className="text-sm mt-2 text-center text-gray-300 line-clamp-1">{movie.title}</p>
    </div>
  );
};

// List component to display user's custom lists with movies
const UserList = ({ list, onNavigate }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#14181C] rounded-lg p-4 mb-4">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-medium text-white">{list.name}</h3>
        <span className="text-blue-400">{expanded ? "▲" : "▼"}</span>
      </div>
      
      {expanded && list.movie_ids && list.movie_ids.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {list.movie_ids.map(movieId => (
            <MovieCard key={movieId} movieId={movieId} onNavigate={onNavigate} />
          ))}
        </div>
      )}
      
      {expanded && (!list.movie_ids || list.movie_ids.length === 0) && (
        <p className="text-gray-400 mt-4 text-center">Esta lista está vazia.</p>
      )}
    </div>
  );
};

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("likes"); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
    
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
        if (sessionError) throw new Error("Erro de autenticação: " + sessionError.message);
        if (!sessionData?.session) {
          navigate("/login");
          return;
        }
    
        const userId = sessionData.session.user.id;
    
        const { data, error: userError } = await supabase
          .from("users")
          .select("username, email, likes, watchlist")
          .eq("uid", userId)
          .single();
    
        if (userError) throw new Error("Erro ao buscar dados do utilizador: " + userError.message);
    
        const processedData = {
          ...data,
          uid: userId,
          likes: data.likes || [],
          watchlist: data.watchlist || [],
        };
    
        setUserData(processedData);
        
        const { data: listsData, error: listsError } = await supabase
          .from("user_lists")
          .select("*")
          .eq("user_id", userId);
    
        if (listsError) {
          throw new Error("Erro ao buscar listas do usuário: " + listsError.message);
        }
    
        setUserLists(listsData || []);
    
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="bg-[#14181C] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando perfil...</p>
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
              onClick={() => navigate("/login")} 
              className="bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Voltar para Login
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
            <p className="text-white mb-6 text-lg">Erro ao carregar perfil. Por favor, tente novamente.</p>
            <button 
              onClick={() => navigate("/login")} 
              className="bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-700 transition-colors mr-4"
            >
              Voltar para Login
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-600 px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Function to render content based on active tab
  const renderTabContent = () => {
    switch(activeTab) {
      case 'likes':
        return (
          <>
            {userData.likes.length === 0 ? (
              <p className="text-center text-gray-400">Funcionalidade em desenvolvimento.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {userData.likes.map(movieId => (
                  <MovieCard key={movieId} movieId={movieId} onNavigate={navigate} />
                ))}
              </div>
            )}
          </>
        );
      case 'watchlist':
        return (
          <>
            {userData.watchlist.length === 0 ? (
              <p className="text-center text-gray-400">Funcionalidade em desenvolvimento.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {userData.watchlist.map(movieId => (
                  <MovieCard key={movieId} movieId={movieId} onNavigate={navigate} />
                ))}
              </div>
            )}
          </>
        );
      case 'lists':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Create New List Button */}
            <div 
              className="bg-[#1a3170] rounded-xl aspect-square flex items-center justify-center cursor-pointer hover:bg-[#2a4180] transition-colors"
              onClick={() => {
                const listName = prompt("Digite o nome para a nova lista:");
                if (!listName) return;
                
                supabase
                  .from("user_lists")
                  .insert({
                    user_id: userData.uid,
                    name: listName,
                    movie_ids: [],
                    created_at: new Date()
                  })
                  .then(({ data, error }) => {
                    if (!error && data) {
                      setUserLists([...userLists, data[0]]);
                    } else {
                      alert("Erro ao criar lista: " + (error ? error.message : "Erro desconhecido"));
                    }
                  });
              }}
            >
              <span className="text-3xl text-white">+</span>
            </div>
            
            {/* Display existing lists */}
            {userLists.length === 0 ? (
              <div className="bg-[#14181C] rounded-xl aspect-square flex items-center justify-center">
                <p className="text-gray-400 text-center text-sm p-2">Funcionalidade em desenvolvimento.</p>
              </div>
            ) : (
              userLists.map(list => (
                <div 
                  key={list.id}
                  className="bg-[#14181C] rounded-xl aspect-square flex items-center justify-center cursor-pointer hover:bg-gray-800 transition"
                  onClick={() => {
                    // Open list details in a modal or navigate to list detail page
                    if (list.movie_ids && list.movie_ids.length > 0) {
                      // Navigate to list detail or expand
                      navigate(`/list/${list.id}`);
                    } else {
                      alert(`Lista "${list.name}" está vazia.`);
                    }
                  }}
                >
                  <p className="text-white text-center font-medium p-2">{list.name}</p>
                </div>
              ))
            )}
          </div>
        );
      default:
        return <p>Selecione uma opção</p>;
    }
  };

  return (
    <div className="bg-[#14181C] text-white min-h-screen">
      {/* Profile Card */}
      <div className="bg-[#1a3170] p-6 mb-8">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          <div className="w-24 h-24 bg-[#1f2937] rounded-full flex items-center justify-center text-3xl font-bold border-2 border-gray-500">
            <span className="text-white">{userData.username?.charAt(0).toUpperCase() || "R"}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{userData.username || "rodrigo"}</h1>
            <p className="text-gray-300 text-sm mt-1">{userData.email}</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6">
        {/* Content sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Likes Section */}
          <div className="bg-[#1f2937] rounded-xl overflow-hidden">
            <div 
              className={`p-4 flex items-center gap-2 border-b border-gray-700 cursor-pointer ${activeTab === 'likes' ? 'bg-[#273548]' : ''}`}
              onClick={() => setActiveTab('likes')}
            >
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
              </svg>
              <h2 className="text-lg font-medium text-white">Likes ({userData.likes.length})</h2>
            </div>
            <div className="p-6">
              {activeTab === 'likes' && renderTabContent()}
            </div>
          </div>
          
          {/* Watchlist Section */}
          <div className="bg-[#1f2937] rounded-xl overflow-hidden">
            <div 
              className={`p-4 flex items-center gap-2 border-b border-gray-700 cursor-pointer ${activeTab === 'watchlist' ? 'bg-[#273548]' : ''}`}
              onClick={() => setActiveTab('watchlist')}
            >
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
              </svg>
              <h2 className="text-lg font-medium text-white">Watchlist ({userData.watchlist.length})</h2>
            </div>
            <div className="p-6">
              {activeTab === 'watchlist' && renderTabContent()}
            </div>
          </div>
        </div>
        
        {/* Lists Section */}
        <div className="bg-[#1f2937] rounded-xl overflow-hidden mb-8">
          <div 
            className={`p-4 flex items-center gap-2 border-b border-gray-700 cursor-pointer ${activeTab === 'lists' ? 'bg-[#273548]' : ''}`}
            onClick={() => setActiveTab('lists')}
          >
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
            </svg>
            <h2 className="text-lg font-medium text-white">Listas ({userLists.length})</h2>
          </div>
          
          <div className="p-6">
            {activeTab === 'lists' && renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}