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

  useEffect(() => {
    fetch(`${API_BASE_URL}/movie/${id}`, API_OPTIONS)
      .then((res) => res.json())
      .then((data) => setMovie(data));

    fetch(`${API_BASE_URL}/movie/${id}/similar`, API_OPTIONS)
      .then((res) => res.json())
      .then((data) => setRelatedMovies(data.results || []));
  }, [id]);

  if (!movie) return <p className="text-white">Carregando...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      {/* Cabeçalho do Filme */}
      <h1 className="text-3xl font-bold">
        {movie.title}  ({movie.release_date?.split("-")[0]})
      </h1>
      <p className="text-gray-400 mt-2">Dirigido por: {movie.director || "Desconhecido"}</p>

      {/* Área principal com poster e descrição */}
      <div className="mt-4 flex gap-6">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="w-1/3 rounded-md shadow-lg"
        />
        <p className="text-gray-300">{movie.overview}</p>
      </div>

      {/* Avaliação e Interações */}
      <div className="mt-4 flex items-center gap-6">
        <p className="text-yellow-400 text-2xl">⭐ {movie.vote_average.toFixed(1)}/10</p>
        <p className="text-gray-400">📊 {movie.vote_count} avaliações</p>
        <button className="bg-blue-600 px-4 py-2 rounded-md">💙 Favorito</button>
      </div>

      {/* Comentários (Placeholder) */}
      <div className="mt-6">
        <h2 className="text-xl font-bold">Comentários</h2>
        <div className="mt-2 p-4 bg-gray-800 rounded-md">
          <p className="text-sm font-bold">&lt;&lt;Nome do usuário&gt;&gt;</p>
          <p className="text-gray-300">
            "Este filme redefiniu o cinema como o conhecemos. A atuação é tão intensa que senti como se os personagens estivessem presos a sala de tela a sentar ao meu lado."
          </p>
        </div>
        <div className="mt-2 p-4 bg-gray-800 rounded-md">
          <p className="text-sm font-bold">&lt;&lt;Nome do usuário&gt;&gt;</p>
          <p className="text-gray-300">
            "O roteiro? Uma obra-prima digna de prêmios. Se este filme fosse um prato, seria um banquete de emoções!"
          </p>
        </div>
      </div>

      {/* Filmes Relacionados */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Filmes relacionados</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto">
          {relatedMovies.slice(0, 4).map((related) => (
            <div 
              key={related.id} 
              className="w-32 cursor-pointer hover:opacity-80 transition"
              onClick={() => navigate(`/movie/${related.id}`)} // Navegação ao clicar
            >
              <img
                src={`https://image.tmdb.org/t/p/w200${related.poster_path}`}
                alt={related.title}
                className="rounded-md"
              />
              <p className="text-sm mt-2">{related.title}</p>
            </div>
          ))}
        </div>
      </div>

    
    </div>
  );
}
