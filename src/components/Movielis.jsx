import { Link } from "react-router-dom";

{movies.map((movie) => (
  <Link key={movie.id} to={`/movie/${movie.id}`}>
    <div className="bg-gray-700 p-2 rounded-md cursor-pointer hover:bg-gray-600 transition">
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        className="w-full h-64 object-cover rounded-md"
      />
      <p className="text-white mt-2 text-center">{movie.title}</p>
    </div>
  </Link>
))}
