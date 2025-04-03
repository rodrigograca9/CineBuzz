import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa"; // Ícone de pesquisa

export default function Navbar() {
  const [search, setSearch] = useState(""); // Estado para pesquisa
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${search}`); // Redireciona para a página de pesquisa
    }
  };

  const toggleSearch = () => {
    setSearchExpanded(!searchExpanded);
    if (!searchExpanded) {
      // Focar no input quando expandir
      setTimeout(() => {
        document.getElementById("search-input")?.focus();
      }, 100);
    } else {
      // Limpar busca ao fechar
      setSearch("");
    }
  };

  // Função simulada de logout (remover quando implementar autenticação real)
  const handleLogout = () => {
    setIsLoggedIn(false);
    alert("Logout realizado!");
  };

  return (
    <nav className="bg-[#14181C] text-white p-4 flex justify-between items-center shadow-lg px-8">
      {/* Logo */}
      <div className="flex items-center">
        <img
          src="/logo.png"
          alt="Logo do CineBuzz"
          className="h-12 cursor-pointer transform transition duration-300 hover:scale-105 mr-8"
          onClick={() => navigate("/")}
        />

        {/* Links de Navegação com espaço à esquerda */}
        <div className="flex gap-6">
          <button
            onClick={() => navigate("/movies")}
            className="text-lg font-medium hover:text-[#1D4ED8] transition duration-300"
          >
            Filmes
          </button>

          <button
            onClick={() => navigate("/series")}
            className="text-lg font-medium hover:text-[#1D4ED8] transition duration-300"
          >
            Séries
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-center">
        {/* Barra de Pesquisa Expansível */}
        <div className="relative">
          {searchExpanded ? (
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-gray-700 rounded-full overflow-hidden"
            >
              <input
                id="search-input"
                type="text"
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-2 pl-4 pr-10 bg-gray-700 text-white outline-none w-48 transition-all duration-300 rounded-full"
              />
              <button
                type="button"
                onClick={toggleSearch}
                className="absolute right-3 text-gray-400 hover:text-white transition"
              >
                <FaSearch />
              </button>
            </form>
          ) : (
            <button
              onClick={toggleSearch}
              className="p-2 text-gray-400 hover:text-white transition"
            >
              <FaSearch size={18} />
            </button>
          )}
        </div>

        {/* Renderização condicional baseada no estado de login */}
        {isLoggedIn ? (
          // Menu do Utilizador (mostrado apenas quando logado)
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-full hover:bg-gray-700 transition"
            >
              <span className="bg-gray-700 w-6 h-6 rounded-full"></span> Utilizador ▼
            </button>

            {menuOpen && (
              <div className="absolute right-0 bg-gray-700 p-2 mt-2 w-44 rounded-lg shadow-lg transform transition-all duration-300 z-10">
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
                  onClick={handleLogout}
                  className="block w-full text-left p-2 hover:bg-red-600 transition"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="text-lg font-medium hover:text-[#1D4ED8] transition duration-300"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="text-lg font-medium hover:text-[#1D4ED8] transition duration-300"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}