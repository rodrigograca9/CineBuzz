import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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

export default function PublicProfilePage() {
  const { uid } = useParams();
  const [user, setUser] = useState(null);
  const [likedMovies, setLikedMovies] = useState([]);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const fetchUser = async () => {
      const { data: userData, error } = await supabase
        .from("users")
        .select("username, profile_image_url, likes, watchlist")
        .eq("uid", uid)
        .single();

      if (error || !userData) {
        console.error("Erro ao buscar utilizador:", error);
        setLoading(false);
        return;
      }

      setUser(userData);

      const likeIds = Array.isArray(userData.likes) ? userData.likes : [];
      const watchlistIds = Array.isArray(userData.watchlist) ? userData.watchlist : [];

      await fetchMoviesFromIds(likeIds, setLikedMovies);
      await fetchMoviesFromIds(watchlistIds, setWatchlistMovies);
      setLoading(false);
    };

    fetchUser();
  }, [uid]);

  const fetchMoviesFromIds = async (ids, setState) => {
    const results = await Promise.all(
      ids.map(id =>
        fetch(`${API_BASE_URL}/movie/${id}?language=pt-PT`, API_OPTIONS)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      )
    );
    setState(results.filter(Boolean));
  };

  if (loading) return <p className="text-white p-6">A carregar perfil...</p>;
  if (!user) return <p className="text-white p-6">Utilizador não encontrado.</p>;

  return (
    <div className="max-w-6xl mx-auto text-white p-6 space-y-10">
      <div className="flex items-center gap-4">
        <img
          src={user.profile_image_url || "/default-avatar.png"}
          alt={user.username}
          className="w-24 h-24 rounded-full object-cover"
        />
        <h1 className="text-3xl font-bold">{user.username}</h1>
      </div>

      {/* Likes */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Likes</h2>
        {likedMovies.length === 0 ? (
          <p className="text-gray-400">Ainda sem likes.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {likedMovies.map(movie => (
              <div key={movie.id} className="bg-gray-800 p-2 rounded-md">
                <img
                  src={movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "https://via.placeholder.com/200x300?text=Sem+Imagem"}
                  alt={movie.title}
                  className="rounded-md w-full h-48 object-cover"
                />
                <p className="mt-2 text-sm text-center">{movie.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Watchlist */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Watchlist</h2>
        {watchlistMovies.length === 0 ? (
          <p className="text-gray-400">Nenhum filme na watchlist.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {watchlistMovies.map(movie => (
              <div key={movie.id} className="bg-gray-800 p-2 rounded-md">
                <img
                  src={movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "https://via.placeholder.com/200x300?text=Sem+Imagem"}
                  alt={movie.title}
                  className="rounded-md w-full h-48 object-cover"
                />
                <p className="mt-2 text-sm text-center">{movie.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
