import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa"; // Ícone de pesquisa

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState(""); // Estado para pesquisa
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${search}`); // Redireciona para a página de pesquisa
    }
  };

  return (
    <nav className="bg-[#14181C] text-white p-4 flex justify-between items-center shadow-lg">
      {/* Logo */}
      <img
        src="/logo.png"
        alt="Logo do CineBuzz"
        className="h-12 cursor-pointer transform transition duration-300 hover:scale-105"
        onClick={() => navigate("/")}
      />

      <div className="flex gap-8 items-center">
        {/* Links de Navegação */}
        <button
          onClick={() => navigate("/movies")}
          className="text-lg font-medium hover:text-[#1D4ED8] transition duration-300"
        >
          Filmes
        </button>

        <button
          onClick={() => navigate("/watchlist")}
          className="text-lg font-medium hover:text-[#1D4ED8] transition duration-300"
        >
          Watchlist
        </button>

        {/* Barra de Pesquisa */}
        <form
          onSubmit={handleSearch}
          className="relative flex items-center bg-gray-800 rounded-full overflow-hidden"
        >
          <input
            type="text"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 pl-4 pr-10 bg-gray-700 text-white outline-none w-48 focus:w-64 transition-all duration-300 rounded-full"
          />
          <button
            type="submit"
            className="absolute right-3 text-gray-400 hover:text-white transition"
          >
            <FaSearch />
          </button>
        </form>

        {/* Menu do Utilizador */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-full hover:bg-gray-700 transition"
          >
            <span className="bg-gray-700 w-6 h-6 rounded-full"></span> Utilizador ▼
          </button>

          {menuOpen && (
            <div className="absolute right-0 bg-gray-700 p-2 mt-2 w-44 rounded-lg shadow-lg transform transition-all duration-300">
              <button
                onClick={() => navigate("/")}
                className="block w-full text-left p-2 hover:bg-gray-600 transition"
              >
                Início
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="block w-full text-left p-2 hover:bg-gray-600 transition"
              >
                Perfil
              </button>
              <button
                onClick={() => navigate("/lists")}
                className="block w-full text-left p-2 hover:bg-gray-600 transition"
              >
                Listas
              </button>
              <button
                onClick={() => navigate("/likes")}
                className="block w-full text-left p-2 hover:bg-gray-600 transition"
              >
                Likes
              </button>
              <button
                onClick={() => alert("Logout realizado!")}
                className="block w-full text-left p-2 hover:bg-red-600 transition"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
