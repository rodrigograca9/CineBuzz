import React from "react";
import { useNavigate } from "react-router-dom";

export default function MovieCard({ movie }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${movie.id}`); // Redireciona para a página de detalhes
  };

  return (
    <div onClick={handleClick} className="cursor-pointer bg-gray-700 p-2 rounded-md hover:bg-gray-600 transition">
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        className="w-full h-64 object-cover rounded-md"
      />
      <p className="text-white mt-2 text-center">{movie.title}</p>
    </div>
  );
}
