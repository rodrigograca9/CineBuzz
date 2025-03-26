import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MzRkNDdmMDhlYmY4ZjA5OGZiNTk4Y2ViMTA1NGMzZSIsIm5iZiI6MTc0MDA2NDM5Mi42NzkwMDAxLCJzdWIiOiI2N2I3NDY4OGU0ODRmYzIxNTQxYTIzNTEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.eiEa5fYu8UkMxztHU4IgNpCjkxnbmOZVde2p8Zsm2a4';
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
export default function HomePage() {
  const [recentMovies, setRecentMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);

  useEffect(() => {
    // Busca filmes recentes
    fetch(`${API_BASE_URL}/movie/now_playing`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
      .then((res) => res.json())
      .then((data) => setRecentMovies(data.results || []));

    // Busca filmes populares
    fetch(`${API_BASE_URL}/movie/popular`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
      .then((res) => res.json())
      .then((data) => setPopularMovies(data.results || []));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Filmes Recentes</h2>
      <div className="grid grid-cols-6 gap-4">
        {recentMovies.length > 0 ? (
          recentMovies.slice(0,18).map((movie) => (
            <Link
              to={`/movie/${movie.id}`} // Redireciona para a página de detalhes
              key={movie.id}
              className="bg-gray-800 p-2 rounded-md hover:opacity-75 transition"
            >
              <img
                src={movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "https://via.placeholder.com/200x300?text=Sem+Imagem"}
                alt={movie.title}
                className="rounded-md"
              />
              <p className="mt-2 text-center">{movie.title}</p>
            </Link>
          ))
        ) : (
          <p>Carregando...</p>
        )}
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Populares Agora</h2>
      <div className="grid grid-cols-6 gap-4">
        {popularMovies.length > 0 ? (
          popularMovies.slice(0,18).map((movie) => (
            <Link
              to={`/movie/${movie.id}`} // Redireciona para a página de detalhes
              key={movie.id}
              className="bg-gray-800 p-2 rounded-md hover:opacity-75 transition"
            >
              <img
                src={movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "https://via.placeholder.com/200x300?text=Sem+Imagem"}
                alt={movie.title}
                className="rounded-md"
              />
              <p className="mt-2 text-center">{movie.title}</p>
            </Link>
          ))
        ) : (
          <p>Carregando...</p>
        )}
      </div>
    </div>
  );
}