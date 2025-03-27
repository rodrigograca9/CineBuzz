import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate(); // Hook para navegação
  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [cast, setCast] = useState([]);
  const [director, setDirector] = useState(""); // Estado para armazenar o nome do diretor

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
        setDirector(directorData ? directorData.name : "Desconhecido"); // Se não houver diretor, colocar "Desconhecido"
      });

    // Fetch movie cast (elenco)
    fetch(`${API_BASE_URL}/movie/${id}/credits`, API_OPTIONS)
      .then((res) => res.json())
      .then((data) => setCast(data.cast || []));
  }, [id]);

  if (!movie) return <p className="text-white">A carregar...</p>;

  const getGenres = (genres) => genres.map((genre) => genre.name).join(", ");
  const getCast = (cast) => cast.slice(0, 5).map((actor) => actor.name).join(", ");

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      {/* Cabeçalho do Filme */}
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-blue-500">
        {movie.title} ({movie.release_date?.split("-")[0]})
      </h1>
      <p className="text-gray-400 mt-2">Dirigido por: {director}</p> {/* Agora exibe o diretor corretamente */}

      {/* Área principal com poster e descrição */}
      <div className="mt-6 flex flex-col sm:flex-row gap-6">
        {/* Imagem do filme */}
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="w-full sm:w-1/4 rounded-lg shadow-xl transform transition duration-300 hover:scale-105"
        />

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
          <div className="mt-6 flex items-center gap-6">
            <p className="text-yellow-400 text-3xl font-semibold">⭐ {movie.vote_average.toFixed(1)}/10</p>
            <p className="text-gray-400">📊 {movie.vote_count} avaliações</p>
            <button className="bg-blue-600 px-6 py-3 rounded-md hover:bg-blue-500 transform transition duration-200">
              💙 Favorito
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
        <div className="mt-6 flex gap-6 overflow-x-auto py-4 max-w-full overflow-x-hidden">
          {relatedMovies.slice(0, 6).map((related) => (
            <div
              key={related.id}
              className="w-32 cursor-pointer hover:opacity-80 transition"
              onClick={() => navigate(`/movie/${related.id}`)} // Navegação ao clicar
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
    </div>
  );
}
