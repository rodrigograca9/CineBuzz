import { useEffect, useState } from "react";
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

const MOVIES_PER_PAGE = 24;

export default function FilmesPage() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, [search, selectedGenre, selectedYear, currentPage]);

  useEffect(() => {
    fetchGenres();
  }, []);

  async function fetchMovies() {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/discover/movie?language=pt-PT&page=${currentPage}`;

      if (search) {
        url = `${API_BASE_URL}/search/movie?query=${search}&language=pt-PT&page=${currentPage}`;
      }

      const filters = [];
      if (selectedGenre) filters.push(`with_genres=${selectedGenre}`);
      if (selectedYear) filters.push(`primary_release_year=${selectedYear}`);

      if (filters.length > 0) {
        url += `&${filters.join("&")}`;
      }

      const res = await fetch(url, API_OPTIONS);
      if (!res.ok) throw new Error("Erro ao buscar filmes!");
      const data = await res.json();

      setMovies(data.results.slice(0, MOVIES_PER_PAGE));
      setTotalPages(Math.ceil(data.total_results / MOVIES_PER_PAGE));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchGenres() {
    try {
      const res = await fetch(`${API_BASE_URL}/genre/movie/list?language=pt-BR`, API_OPTIONS);
      const data = await res.json();
      setGenres(data.genres || []);
    } catch (err) {
      console.error("Erro ao carregar gêneros:", err);
    }
  }

  function handleSearchChange(e) {
    setSearch(e.target.value);
    setCurrentPage(1);
  }

  function handleGenreChange(e) {
    setSelectedGenre(e.target.value);
    setCurrentPage(1);
  }

  function handleYearChange(e) {
    setSelectedYear(e.target.value);
    setCurrentPage(1);
  }

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Explorar Filmes</h2>

      {/* Barra de Pesquisa e Filtros */}
      <form onSubmit={(e) => e.preventDefault()} className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Pesquisar filme..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 w-1/3 rounded bg-gray-800 text-white"
        />
        <select
          value={selectedGenre}
          onChange={handleGenreChange}
          className="p-2 rounded bg-gray-800 text-white"
        >
          <option value="">Todos os Gêneros</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Ano"
          value={selectedYear}
          onChange={handleYearChange}
          className="p-2 w-24 rounded bg-gray-800 text-white"
        />
      </form>

      {/* Lista de Filmes */}
      {loading && <p className="text-white text-center">Carregando...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && movies.length === 0 && (
        <p className="text-center text-gray-400">Nenhum filme encontrado.</p>
      )}

      <div className="grid grid-cols-6 gap-4">
        {movies.map((movie) => (
          <Link
            to={`/movie/${movie.id}`}
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
        ))}
      </div>

      {/* Paginação */}
      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-600' : 'bg-gray-600 hover:bg-blue-500'}`}
        >
          Anterior
        </button>
        <span className="px-4 py-2 text-white">Página {currentPage} de {totalPages}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`px-4 py-2 rounded ${currentPage >= totalPages ? 'bg-gray-600' : 'bg-gray-600 hover:bg-blue-500'}`}
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
