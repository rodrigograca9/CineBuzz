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

// Movie card component with remove button
const MovieCard = ({ movieId, onNavigate, onRemove, removeEnabled }) => {
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
    <div className="relative group">
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

      {removeEnabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(movieId);
          }}
          className="absolute top-2 right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remover filme"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

// Modal de confirmação de exclusão
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal para editar o nome da lista
const EditListNameModal = ({ isOpen, onClose, onSave, currentName }) => {
  const [name, setName] = useState(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSave(name);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">Editar Nome da Lista</h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 rounded-lg border border-gray-600 p-2 mb-4 text-white"
            placeholder="Nome da lista"
            required
          />
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              )}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para adicionar filmes à lista
const AddMovieModal = ({ isOpen, onClose, onAddMovie }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/search/movie?query=${encodeURIComponent(searchTerm)}&language=pt-BR&page=1`,
        API_OPTIONS
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Error searching movies:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleAddMovie = (movie) => {
    onAddMovie(movie.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Adicionar Filme à Lista</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow bg-gray-700 rounded-lg border border-gray-600 p-2 text-white"
              placeholder="Buscar filme por título..."
            />
            <button
              type="submit"
              className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
              disabled={isSearching}
            >
              {isSearching ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              )}
            </button>
          </div>
        </form>
        
        {isSearching ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-2">Buscando filmes...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {searchResults.map((movie) => (
              <div key={movie.id} className="cursor-pointer hover:opacity-80 transition">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.title}
                    className="rounded-lg shadow-md mb-2"
                    onClick={() => handleAddMovie(movie)}
                  />
                ) : (
                  <div 
                    className="bg-gray-700 h-48 rounded-lg flex items-center justify-center p-2 mb-2"
                    onClick={() => handleAddMovie(movie)}
                  >
                    <span className="text-gray-400 text-center text-sm">{movie.title}</span>
                  </div>
                )}
                <p className="text-sm text-center text-gray-300 line-clamp-1">{movie.title}</p>
                <button
                  onClick={() => handleAddMovie(movie)}
                  className="w-full mt-2 bg-blue-600 text-white text-sm rounded-lg py-1 hover:bg-blue-700 transition"
                >
                  Adicionar
                </button>
              </div>
            ))}
          </div>
        ) : searchTerm && !isSearching ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhum resultado encontrado.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default function ListDetail() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [listData, setListData] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userOwnslist, setUserOwnsList] = useState(false);
  
  // Estados para os modais
  const [isDeleteListModalOpen, setIsDeleteListModalOpen] = useState(false);
  const [isRemoveMovieModalOpen, setIsRemoveMovieModalOpen] = useState(false);
  const [movieToRemove, setMovieToRemove] = useState(null);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);

  useEffect(() => {
    const fetchListData = async () => {
      try {
        setLoading(true);
        
        // Verificar se o utilizador está autenticado
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw new Error("Erro de autenticação: " + sessionError.message);
        
        const currentUserId = sessionData?.session?.user?.id;
        
        // Procurar dados da lista
        const { data: listData, error: listError } = await supabase
          .from("user_lists")
          .select("*")
          .eq("id", listId)
          .single();
          
        if (listError) {
          if (listError.code === "PGRST116") {
            throw new Error("Lista não encontrada");
          }
          throw new Error("Erro ao buscar detalhes da lista: " + listError.message);
        }
        
        // Verificar se o utilizador atual é o proprietário da lista
        const isOwner = currentUserId && currentUserId === listData.user_id;
        setUserOwnsList(isOwner);
        
        setListData(listData);
        setMovies(listData.movie_ids || []);
        
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListData();
  }, [listId]);

  const handleRemoveMovie = (movieId) => {
    setMovieToRemove(movieId);
    setIsRemoveMovieModalOpen(true);
  };

  const confirmRemoveMovie = async () => {
    if (!movieToRemove) return;
    
    try {
      // Filtrar o ID do filme a ser removido
      const updatedMovies = movies.filter(id => id !== movieToRemove);
      
      // Atualizar na base de dados
      const { error } = await supabase
        .from("user_lists")
        .update({ movie_ids: updatedMovies })
        .eq("id", listId);
        
      if (error) throw new Error("Erro ao remover filme: " + error.message);
      
      // Atualizar o estado
      setMovies(updatedMovies);
      setIsRemoveMovieModalOpen(false);
      setMovieToRemove(null);
      
    } catch (error) {
      console.error("Erro ao remover filme:", error);
      alert("Não foi possível remover o filme. Tente novamente.");
    }
  };

  const handleDeleteList = () => {
    setIsDeleteListModalOpen(true);
  };

  const confirmDeleteList = async () => {
    try {
      const { error } = await supabase
        .from("user_lists")
        .delete()
        .eq("id", listId);
        
      if (error) throw new Error("Erro ao eliminar lista: " + error.message);
      
      navigate("/profile");
      
    } catch (error) {
      console.error("Erro ao eliminar lista:", error);
      alert("Não foi possível excluir a lista. Tente novamente.");
    }
  };

  const handleEditName = () => {
    setIsEditNameModalOpen(true);
  };

  const saveListName = async (newName) => {
    try {
      const { error } = await supabase
        .from("user_lists")
        .update({ name: newName })
        .eq("id", listId);
        
      if (error) throw new Error("Erro ao atualizar nome da lista: " + error.message);
      
      // Atualizar o estado
      setListData({
        ...listData,
        name: newName
      });
      
      setIsEditNameModalOpen(false);
      
    } catch (error) {
      console.error("Erro ao atualizar nome da lista:", error);
      alert("Não foi possível atualizar o nome da lista. Tente novamente.");
    }
  };

  const handleAddMovie = async (movieId) => {
    try {
      // Verificar se o filme já existe na lista
      if (movies.includes(movieId)) {
        alert("Este filme já está na lista.");
        return;
      }
      
      // Adicionar o filme à lista
      const updatedMovies = [...movies, movieId];
      
      // Atualizar na base de dados
      const { error } = await supabase
        .from("user_lists")
        .update({ movie_ids: updatedMovies })
        .eq("id", listId);
        
      if (error) throw new Error("Erro ao adicionar filme: " + error.message);
      
      // Atualizar o estado
      setMovies(updatedMovies);
      
      // Fechar o modal
      setIsAddMovieModalOpen(false);
      
    } catch (error) {
      console.error("Erro ao adicionar filme:", error);
      alert("Não foi possível adicionar o filme. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#14181C] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando detalhes da lista...</p>
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
              onClick={() => navigate("/profile")} 
              className="bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Voltar para o Perfil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#14181C] text-white min-h-screen">
      {/* Header da lista */}
      <div className="bg-[#1a237e] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate("/profile")}
                  className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                </button>
                <h1 className="text-2xl font-bold">{listData?.name || "Lista"}</h1>
                {userOwnslist && (
                  <button 
                    onClick={handleEditName}
                    className="text-blue-400 hover:text-blue-300"
                    title="Editar nome"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-gray-300 text-sm mt-1">{movies.length} filme(s)</p>
            </div>
            
            {userOwnslist && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsAddMovieModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Adicionar Filme
                </button>
                
                <button 
                  onClick={handleDeleteList}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Eliminar Lista
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Conteúdo da lista */}
      <div className="max-w-4xl mx-auto p-6">
        {movies.length === 0 ? (
          <div className="bg-[#1C2228] rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path>
            </svg>
            <p className="text-gray-400 mb-4">Esta lista ainda não tem filmes.</p>
            
            {userOwnslist && (
              <button 
                onClick={() => setIsAddMovieModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg inline-flex items-center transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Adicionar Filme
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map(movieId => (
              <MovieCard 
                key={movieId} 
                movieId={movieId} 
                onNavigate={navigate}
                onRemove={handleRemoveMovie}
                removeEnabled={userOwnslist}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Modais */}
      <ConfirmModal 
        isOpen={isDeleteListModalOpen}
        onClose={() => setIsDeleteListModalOpen(false)}
        onConfirm={confirmDeleteList}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a lista "${listData?.name}"? Esta ação não pode ser desfeita.`}
      />
      
      <ConfirmModal 
        isOpen={isRemoveMovieModalOpen}
        onClose={() => {
          setIsRemoveMovieModalOpen(false);
          setMovieToRemove(null);
        }}
        onConfirm={confirmRemoveMovie}
        title="Remover Filme"
        message="Tem certeza que deseja remover este filme da lista?"
      />
      
      <EditListNameModal 
        isOpen={isEditNameModalOpen}
        onClose={() => setIsEditNameModalOpen(false)}
        onSave={saveListName}
        currentName={listData?.name || ""}
      />
      
      <AddMovieModal 
        isOpen={isAddMovieModalOpen}
        onClose={() => setIsAddMovieModalOpen(false)}
        onAddMovie={handleAddMovie}
      />
    </div>
  );
}