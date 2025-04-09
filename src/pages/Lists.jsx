import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MzRkNDdmMDhlYmY4ZjA5OGZiNTk4Y2ViMTA1NGMzZSIsIm5iZiI6MTc0MDA2NDM5Mi42NzkwMDAxLCJzdWIiOiI2N2I3NDY4OGU0ODRmYzIxNTQxYTIzNTEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.eiEa5fYu8UkMxztHU4IgNpCjkxnbmOZVde2p8Zsm2a4';

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

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

const ListCard = ({ list, username, onNavigate }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="bg-[#14181C] rounded-lg p-4 mb-4 hover:bg-[#1a2026] transition-colors">
      <div className="flex justify-between items-center cursor-pointer" onClick={toggleExpand}>
        <div>
          <h3 className="font-medium text-white text-lg">{list.name}</h3>
          <p className="text-gray-400 text-sm">
            Por <span className="text-blue-400">{username}</span> • 
            {list.movie_ids ? ` ${list.movie_ids.length} filmes` : ' 0 filmes'}
          </p>
        </div>
        <span className="text-blue-400">{expanded ? "▲" : "▼"}</span>
      </div>
      
      {/* Mostrar filmes apenas quando expandido */}
      {expanded && list.movie_ids && list.movie_ids.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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

export default function Lists() {
  const [allLists, setAllLists] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "popular", "recent"
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllListsAndUsers = async () => {
      try {
        setLoading(true);
        
        // Buscar todas as listas de todos os usuários
        const { data: listsData, error: listsError } = await supabase
          .from("user_lists")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (listsError) {
          throw new Error("Erro ao buscar listas: " + listsError.message);
        }
        
        // Buscar informações de todos os usuários para associar às listas
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("uid, username");
        
        if (usersError) {
          throw new Error("Erro ao buscar usuários: " + usersError.message);
        }
        
        // Criar um mapa de ID de usuário para username
        const userMap = {};
        usersData.forEach(user => {
          userMap[user.uid] = user.username;
        });
        
        setUsers(userMap);
        setAllLists(listsData || []);
        
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllListsAndUsers();
  }, []);

  // Filtrar e classificar listas
  const getFilteredLists = () => {
    let filteredLists = [...allLists];
    
    // Aplicar pesquisa por nome
    if (searchTerm) {
      filteredLists = filteredLists.filter(list => 
        list.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtros
    switch (filter) {
      case "popular":
        // Ordenar por número de filmes (mais filmes = mais popular)
        filteredLists.sort((a, b) => 
          (b.movie_ids?.length || 0) - (a.movie_ids?.length || 0)
        );
        break;
      case "recent":
        // Já está ordenado por created_at na consulta
        break;
      default:
        // Não fazer nada para "all"
        break;
    }
    
    return filteredLists;
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
              onClick={() => navigate("/")} 
              className="bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredLists = getFilteredLists();

  return (
    <div className="bg-[#14181C] text-white min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg p-8 mb-8 shadow-lg">
          <h1 className="text-3xl font-bold">Listas de Filmes</h1>
          <p className="text-blue-300 mt-2">Descubra coleções de filmes criadas pela comunidade</p>
        </div>
        
        {/* Barra de pesquisa e filtros */}
        <div className="bg-[#1C2228] p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Pesquisar listas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#14181C] text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-md ${filter === "all" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                Todas
              </button>
              <button 
                onClick={() => setFilter("popular")}
                className={`px-4 py-2 rounded-md ${filter === "popular" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                Populares
              </button>
              <button 
                onClick={() => setFilter("recent")}
                className={`px-4 py-2 rounded-md ${filter === "recent" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                Recentes
              </button>
            </div>
          </div>
        </div>
        
        {/* Contagem de resultados */}
        <div className="mb-4 text-gray-400">
          {filteredLists.length} {filteredLists.length === 1 ? 'lista encontrada' : 'listas encontradas'}
        </div>
        
        {/* Lista de listas */}
        <div className="bg-[#1C2228] p-6 rounded-lg shadow-md">
          {filteredLists.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-gray-400">Nenhuma lista encontrada</p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="mt-4 bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Limpar pesquisa
                </button>
              )}
            </div>
          ) : (
            filteredLists.map(list => (
              <ListCard 
                key={list.id} 
                list={list} 
                username={users[list.user_id] || "Usuário desconhecido"} 
                onNavigate={navigate} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}