import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
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

export default function SearchResultsPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";
  const [movieResults, setMovieResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    setLoading(true);

    const fetchMovies = fetch(
      `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=pt-PT`,
      API_OPTIONS
    ).then(res => res.json());

    const fetchUsers = supabase
      .from("users")
      .select("uid, username, profile_image_url")
      .ilike("username", `%${query}%`);

    Promise.all([fetchMovies, fetchUsers])
      .then(([movieData, userData]) => {
        setMovieResults(movieData.results || []);
        setUserResults(userData.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro na pesquisa:", err);
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Resultados para: "{query}"</h1>

      {loading ? (
        <p>A carregar...</p>
      ) : (
        <>
          {/* Utilizadores encontrados */}
          {userResults.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Utilizadores</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {userResults.map(user => (
                  <Link
                    key={user.uid}
                    to={`/profile/${user.uid}`}
                    className="bg-gray-800 p-3 rounded-lg flex flex-col items-center hover:bg-gray-700 transition"
                  >
                    <img
                      src={user.profile_image_url || "/default-avatar.png"}
                      alt={user.username}
                      className="w-20 h-20 rounded-full object-cover mb-2"
                    />
                    <span className="text-sm font-medium text-center truncate w-full">{user.username}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Filmes encontrados */}
          {movieResults.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Filmes</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {movieResults.map(movie => (
                  <Link
                    to={`/movie/${movie.id}`}
                    key={movie.id}
                    className="bg-gray-800 p-1 rounded-md hover:opacity-75 transition"
                  >
                    <img
                      loading="lazy"
                      src={movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "https://via.placeholder.com/200x300?text=Sem+Imagem"}
                      alt={movie.title}
                      className="rounded-md w-full h-48 object-cover"
                    />
                    <p className="mt-2 text-center text-sm line-clamp-2">{movie.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {userResults.length === 0 && movieResults.length === 0 && (
            <p className="text-gray-400">Nenhum resultado encontrado.</p>
          )}
        </>
      )}
    </div>
  );
}
