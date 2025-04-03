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
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/movie/now_playing?language=en-US`, API_OPTIONS)
        .then((res) => res.json())
        .then((data) => setRecentMovies(data.results || [])),
      
      fetch(`${API_BASE_URL}/movie/popular?language=en-US`, API_OPTIONS)
        .then((res) => res.json())
        .then((data) => setPopularMovies(data.results || [])),
      
      fetch(`${API_BASE_URL}/movie/top_rated?language=en-US`, API_OPTIONS)
        .then((res) => res.json())
        .then((data) => setTopRatedMovies(data.results || [])),
      
      fetch(`${API_BASE_URL}/trending/movie/week?language=en-US`, API_OPTIONS)
        .then((res) => res.json())
        .then((data) => setTrendingMovies(data.results || []))
    ]).finally(() => setLoading(false));
  }, []);

  const MovieSection = ({ movies, title }) => (
    <div className="mb-8">
      <h2 className="text-3xl font-bold mb-4 text-white border-b-2 border-gray-700 pb-2">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {movies.slice(0, 6).map((movie) => (
          <Link
            to={`/movie/${movie.id}`}
            key={movie.id}
            className="bg-gray-800 rounded-lg hover:scale-105 transition-transform duration-300 group shadow-lg overflow-hidden"
          >
            <div>
              <img
                src={movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "https://via.placeholder.com/200x300?text=Sem+Imagem"}
                alt={movie.title}
                className="w-full h-72 object-cover"
              />
            </div>
            <div className="px-2 py-2 bg-gray-800">
              <p className="text-white text-sm font-semibold text-center truncate">
                {movie.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  const HeroBanner = () => {
    const featuredMovie = trendingMovies[0];
    
    if (!featuredMovie) return null;

    return (
      <div className="relative mb-12 h-[500px] overflow-hidden rounded-lg shadow-2xl">
        <div className="absolute inset-0">
          <img 
            src={`https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`} 
            alt={featuredMovie.title}
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 flex items-center h-full">
          <div className="w-2/3 text-white">
            <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">{featuredMovie.title}</h1>
            <p className="text-gray-300 mb-6 line-clamp-3 text-lg">{featuredMovie.overview}</p>
            <div className="flex space-x-4">
              <Link 
                to={`/movie/${featuredMovie.id}`}
                className="bg-gray-700 hover:bg-gray-500 px-6 py-3 rounded-full transition text-white font-semibold"
              >
                Ver Detalhes
              </Link>
              <Link 
                to="/filmes"
                className="border border-white px-6 py-3 rounded-full hover:bg-white hover:text-black transition font-semibold"
              >
                Explorar Filmes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <HeroBanner />
        <MovieSection movies={recentMovies} title="Estreias em Cartaz" />
        <MovieSection movies={popularMovies} title="Filmes Populares" />
        <MovieSection movies={topRatedMovies} title="Melhores Avaliações" />
      </div>
    </div>
  );
}