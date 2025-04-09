import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient"; // Importando supabase para gerenciar listas/likes

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MzRkNDdmMDhlYmY4ZjA5OGZiNTk4Y2ViMTA1NGMzZSIsIm5iZiI6MTc0MDA2NDM5Mi42NzkwMDAxLCJzdWIiOiI2N2I3NDY4OGU0ODRmYzIxNTQxYTIzNTEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.eiEa5fYu8UkMxztHU4IgNpCjkxnbmOZVde2p8Zsm2a4';

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [cast, setCast] = useState([]);
  const [director, setDirector] = useState("");
  
  // Estados para interações do usuário
  const [isLiked, setIsLiked] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [userLists, setUserLists] = useState([]);
  const [showListDialog, setShowListDialog] = useState(false);
  const [selectedLists, setSelectedLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Buscar dados do filme da API TMDB
  useEffect(() => {
    // Fetch movie details
    fetch(`${API_BASE_URL}/movie/${id}`, API_OPTIONS)
      .then((res) => res.json())
      .then((data) => setMovie(data));

    // Fetch related movies
    fetch(`${API_BASE_URL}/movie/${id}/similar`, API_OPTIONS)
      .then((res) => res.json())
      .then((data) => setRelatedMovies(data.results || []));

    // Fetch movie trailer
    fetch(`${API_BASE_URL}/movie/${id}/videos`, API_OPTIONS)
      .then((res) => res.json())
      .then((data) => {
        const trailerData = data.results.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );
        setTrailer(trailerData);
      });

    // Fetch movie credits (including directors)
    fetch(`${API_BASE_URL}/movie/${id}/credits`, API_OPTIONS)
      .then((res) => res.json())
      .then((data) => {
        const directorData = data.crew.find((member) => member.job === "Director");
        setDirector(directorData ? directorData.name : "Desconhecido");
      });

    // Fetch movie cast (elenco)
    fetch(`${API_BASE_URL}/movie/${id}/credits`, API_OPTIONS)
      .then((res) => res.json())
      .then((data) => setCast(data.cast || []));
  }, [id]);

  // Buscar estado atual de likes e listas do usuário logado
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Verificar autenticação
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData?.session) {
          return; // Usuário não está logado
        }
        
        const currentUserId = sessionData.session.user.id;
        setUserId(currentUserId);
        
        // Buscar dados do usuário
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("likes, watchlist, lists")
          .eq("uid", currentUserId)
          .single();
        
        if (!userError && userData) {
          // Verificar se o filme está nos likes
          const likes = userData.likes || [];
          setIsLiked(likes.includes(id));
          
          // Verificar se o filme está na watchlist
          const watchlist = userData.watchlist || [];
          setInWatchlist(watchlist.includes(id));
          
          // Buscar listas do usuário
          const { data: listsData, error: listsError } = await supabase
            .from("user_lists")
            .select("*")
            .eq("user_id", currentUserId);
            
          if (!listsError && listsData) {
            // Determinar em quais listas o filme já está
            const userLists = listsData || [];
            setUserLists(userLists);
            
            // Verificar quais listas já contêm o filme
            const listsWithMovie = userLists
              .filter(list => (list.movie_ids || []).includes(id))
              .map(list => list.id);
              
            setSelectedLists(listsWithMovie);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };
    
    fetchUserData();
  }, [id]);

  // Manipulador para toggle de like
  const handleLike = async () => {
    if (!userId) {
      alert("Você precisa estar logado para dar like em filmes.");
      navigate("/login");
      return;
    }
    
    try {
      setLoading(true);
      
      // Buscar likes atuais
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("likes")
        .eq("uid", userId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Atualizar array de likes
      const currentLikes = userData.likes || [];
      let newLikes;
      
      if (isLiked) {
        // Remover like
        newLikes = currentLikes.filter(movieId => movieId !== id);
      } else {
        // Adicionar like
        newLikes = [...currentLikes, id];
      }
      
      // Salvar no banco de dados
      const { error: updateError } = await supabase
        .from("users")
        .update({ likes: newLikes })
        .eq("uid", userId);
        
      if (updateError) throw updateError;
      
      // Atualizar estado local
      setIsLiked(!isLiked);
      
    } catch (error) {
      console.error("Erro ao atualizar like:", error);
      alert("Erro ao atualizar like. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Manipulador para toggle de watchlist
  const handleWatchlist = async () => {
    if (!userId) {
      alert("Você precisa estar logado para adicionar filmes à sua watchlist.");
      navigate("/login");
      return;
    }
    
    try {
      setLoading(true);
      
      // Buscar watchlist atual
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("watchlist")
        .eq("uid", userId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Atualizar array de watchlist
      const currentWatchlist = userData.watchlist || [];
      let newWatchlist;
      
      if (inWatchlist) {
        // Remover da watchlist
        newWatchlist = currentWatchlist.filter(movieId => movieId !== id);
      } else {
        // Adicionar à watchlist
        newWatchlist = [...currentWatchlist, id];
      }
      
      // Salvar no banco de dados
      const { error: updateError } = await supabase
        .from("users")
        .update({ watchlist: newWatchlist })
        .eq("uid", userId);
        
      if (updateError) throw updateError;
      
      // Atualizar estado local
      setInWatchlist(!inWatchlist);
      
    } catch (error) {
      console.error("Erro ao atualizar watchlist:", error);
      alert("Erro ao atualizar watchlist. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Manipulador para abrir diálogo de listas
  const handleAddToList = () => {
    if (!userId) {
      alert("Você precisa estar logado para adicionar filmes às suas listas.");
      navigate("/login");
      return;
    }
    
    setShowListDialog(true);
  };

  // Manipulador para toggle de lista
  const toggleList = (listId) => {
    if (selectedLists.includes(listId)) {
      setSelectedLists(selectedLists.filter(id => id !== listId));
    } else {
      setSelectedLists([...selectedLists, listId]);
    }
  };

  // Manipulador para salvar alterações nas listas
  const saveListChanges = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Para cada lista selecionada, adicionar o filme
      for (const listId of userLists.map(list => list.id)) {
        // Buscar lista atual
        const { data: listData, error: fetchError } = await supabase
          .from("user_lists")
          .select("movie_ids")
          .eq("id", listId)
          .single();
          
        if (fetchError) continue;
        
        const currentMovies = listData.movie_ids || [];
        let newMovies;
        
        if (selectedLists.includes(listId)) {
          // Adicionar filme se não existir
          if (!currentMovies.includes(id)) {
            newMovies = [...currentMovies, id];
          } else {
            newMovies = currentMovies;
          }
        } else {
          // Remover filme
          newMovies = currentMovies.filter(movieId => movieId !== id);
        }
        
        // Atualizar lista
        await supabase
          .from("user_lists")
          .update({ movie_ids: newMovies })
          .eq("id", listId);
      }
      
      setShowListDialog(false);
      
    } catch (error) {
      console.error("Erro ao atualizar listas:", error);
      alert("Erro ao atualizar listas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Manipulador para criar nova lista
  const createNewList = async () => {
    if (!userId) return;
    
    const listName = prompt("Digite o nome para a nova lista:");
    if (!listName) return;
    
    try {
      setLoading(true);
      
      // Criar nova lista
      const { data: newList, error } = await supabase
        .from("user_lists")
        .insert({
          user_id: userId,
          name: listName,
          movie_ids: [id],
          created_at: new Date()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Atualizar listas locais
      setUserLists([...userLists, newList]);
      setSelectedLists([...selectedLists, newList.id]);
      
    } catch (error) {
      console.error("Erro ao criar lista:", error);
      alert("Erro ao criar lista. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!movie) return (
    <div className="flex items-center justify-center min-h-screen bg-[#14181C] text-white">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="ml-3">A carregar...</span>
    </div>
  );

  const getGenres = (genres) => genres.map((genre) => genre.name).join(", ");
  const getCast = (cast) => cast.slice(0, 5).map((actor) => actor.name).join(", ");

  return (
    <div className="max-w-4xl mx-auto p-6 text-white bg-[#14181C]">
      {/* Cabeçalho do Filme */}
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-blue-500">
        {movie.title} ({movie.release_date?.split("-")[0]})
      </h1>
      <p className="text-gray-400 mt-2">Dirigido por: {director}</p>

      {/* Área principal com poster e descrição */}
      <div className="mt-6 flex flex-col sm:flex-row gap-6">
        {/* Imagem do filme */}
        <div className="relative w-full sm:w-1/4">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full rounded-lg shadow-xl transform transition duration-300 hover:scale-105"
          />
        </div>

        {/* Detalhes do filme */}
        <div className="sm:w-3/4 mt-4 sm:mt-0">
          <p className="text-gray-300">{movie.overview}</p>

          {/* Duração, Gênero, Elenco e Data */}
          <div className="mt-6 flex flex-wrap gap-4">
            <p className="text-gray-400">🕒 Duração: {movie.runtime} minutos</p>
            <p className="text-gray-400">🎬 Género: {getGenres(movie.genres)}</p>
            <p className="text-gray-400">👨‍👩‍👧‍👦 Elenco: {getCast(cast)}</p>
            <p className="text-gray-400">📅 Lançamento: {movie.release_date}</p>
          </div>

          {/* Avaliação e Interações */}
          <div className="mt-6 flex items-center flex-wrap gap-4">
            <p className="text-yellow-400 text-3xl font-semibold">⭐ {movie.vote_average.toFixed(1)}/10</p>
            <p className="text-gray-400">📊 {movie.vote_count} avaliações</p>
          </div>
          
          {/* Botões de interação do usuário */}
          <div className="mt-6 flex flex-wrap gap-4">
            <button 
              onClick={handleLike}
              disabled={loading}
              className={`px-6 py-3 rounded-md transition-all duration-300 flex items-center gap-2 ${
                isLiked 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              <span className="text-xl">{isLiked ? "❤️" : "🤍"}</span>
              <span>{isLiked ? "Curtido" : "Curtir"}</span>
            </button>
            
            <button 
              onClick={handleWatchlist}
              disabled={loading}
              className={`px-6 py-3 rounded-md transition-all duration-300 flex items-center gap-2 ${
                inWatchlist 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              <span className="text-xl">{inWatchlist ? "✓" : "+"}</span>
              <span>{inWatchlist ? "Na Watchlist" : "Adicionar à Watchlist"}</span>
            </button>
            
            <button 
              onClick={handleAddToList}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md transition-all duration-300 flex items-center gap-2"
            >
              <span className="text-xl">📋</span>
              <span>Adicionar a uma lista</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trailer do Filme */}
      {trailer && (
        <div className="mt-8">
          <h2 className="text-xl font-bold">Assista ao Trailer</h2>
          <iframe
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${trailer.key}`}
            title="Trailer"
            className="rounded-lg shadow-lg mt-4"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* Elenco do Filme */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Elenco</h2>
        <div className="mt-4 flex gap-6 overflow-x-auto py-4">
          {cast.slice(0, 6).map((actor) => (
            <div
              key={actor.id}
              className="w-32 flex flex-col items-center cursor-pointer hover:opacity-80 transition"
            >
              {actor.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                  alt={actor.name}
                  className="rounded-lg shadow-md"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Sem Foto</span>
                </div>
              )}
              <p className="text-sm mt-2 text-center text-gray-300">{actor.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filmes Relacionados */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-white">Filmes relacionados</h2>
        <div className="mt-6 flex gap-6 overflow-x-auto py-4">
          {relatedMovies.slice(0, 6).map((related) => (
            <div
              key={related.id}
              className="w-32 cursor-pointer hover:opacity-80 transition"
              onClick={() => navigate(`/movie/${related.id}`)}
            >
              <img
                src={`https://image.tmdb.org/t/p/w200${related.poster_path}`}
                alt={related.title}
                className="rounded-lg shadow-md hover:scale-105 transform transition duration-300"
              />
              <p className="text-sm mt-2 text-center text-gray-300">{related.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Diálogo para adicionar a listas */}
      {showListDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1C2228] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Adicionar a listas</h3>
            
            {userLists.length === 0 ? (
              <p className="text-gray-400 mb-4">Você ainda não criou nenhuma lista.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto mb-4">
                {userLists.map(list => (
                  <div key={list.id} className="mb-2 flex items-center">
                    <input
                      type="checkbox"
                      id={`list-${list.id}`}
                      checked={selectedLists.includes(list.id)}
                      onChange={() => toggleList(list.id)}
                      className="mr-2 h-5 w-5"
                    />
                    <label htmlFor={`list-${list.id}`} className="text-white">{list.name}</label>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-between">
              <button 
                onClick={createNewList}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition-colors"
              >
                Criar nova lista
              </button>
              
              <div>
                <button 
                  onClick={() => setShowListDialog(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md transition-colors mr-2"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveListChanges}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}