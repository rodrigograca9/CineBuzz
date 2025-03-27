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
      fetch(`${API_BASE_URL}/movie/now_playing?language=pt-BR`, API_OPTIONS)
        .then((res) => res.json())
        .then((data) => setRecentMovies(data.results || [])),
      
      fetch(`${API_BASE_URL}/movie/popular?language=pt-BR`, API_OPTIONS)
        .then((res) => res.json())
        .then((data) => setPopularMovies(data.results || [])),
      
      fetch(`${API_BASE_URL}/movie/top_rated?language=pt-BR`, API_OPTIONS)
        .then((res) => res.json())
        .then((data) => setTopRatedMovies(data.results || [])),
      
      fetch(`${API_BASE_URL}/trending/movie/week?language=pt-BR`, API_OPTIONS)
        .then((res) => res.json())
        .then((data) => setTrendingMovies(data.results || []))
    ]).finally(() => setLoading(false));
  }, []);

  const MovieSection = ({ movies, title }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      <div className="grid grid-cols-6 gap-4">
        {movies.slice(0, 6).map((movie) => (
          <Link
            to={`/movie/${movie.id}`}
            key={movie.id}
            className="bg-gray-800 p-2 rounded-lg hover:scale-105 transition-transform duration-300 group"
          >
            <div className="relative">
              <img
                src={movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "https://via.placeholder.com/200x300?text=Sem+Imagem"}
                alt={movie.title}
                className="rounded-md w-full h-72 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2">
                <p className="text-white text-sm font-semibold truncate text-center">
                  {movie.title}
                </p>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{new Date(movie.release_date).getFullYear()}</span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#D9D9D9] mr-1">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
                </svg>
                {movie.vote_average.toFixed(1)}
              </span>
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
      <div className="relative mb-12 h-[500px] overflow-hidden rounded-lg">
        <div className="absolute inset-0">
          <img 
            src={`https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`} 
            alt={featuredMovie.title}
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 flex items-center h-full">
          <div className="w-1/2 text-white">
            <h1 className="text-4xl font-bold mb-4">{featuredMovie.title}</h1>
            <p className="text-gray-300 mb-6 line-clamp-3">{featuredMovie.overview}</p>
            <div className="flex space-x-4">
              <Link 
                to={`/movie/${featuredMovie.id}`}
                className="bg-[#282c34] hover:bg-[#3c434e] px-6 py-3 rounded-full transition"
              >
                Ver Detalhes
              </Link>
              <Link 
                to="/filmes"
                className="border border-white px-6 py-3 rounded-full hover:bg-white hover:text-black transition"
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
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <HeroBanner />
        
        <MovieSection 
          movies={recentMovies} 
          title="Estreias em Cartaz" 
        />
        
        <MovieSection 
          movies={popularMovies} 
          title="Filmes Populares" 
        />
        
        <MovieSection 
          movies={topRatedMovies} 
          title="Melhores Avaliações" 
        />
      </div>
    </div>
  );
}
