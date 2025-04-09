import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa"; // Ícone de pesquisa
import supabase from "../helper/supabaseClient"; // Importar o cliente Supabase

export default function Navbar() {
  const [search, setSearch] = useState(""); // Estado para pesquisa
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Verificar o estado de autenticação ao carregar o componente
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        setIsLoggedIn(true);
        // Buscar os dados do utilizador da tabela "users"
        fetchUserData(data.session.user.id);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    // Configurar o listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setIsLoggedIn(true);
          fetchUserData(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setIsLoggedIn(false);
          setUserData(null);
        }
      }
    );

    checkAuth();

    // Cleanup do listener
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Função para buscar os dados do utilizador
  const fetchUserData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("username")
        .eq("uid", userId)
        .single();

      if (error) {
        console.error("Erro ao buscar dados do utilizador:", error);
        return;
      }

      if (data) {
        setUserData(data);
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
    }
  };

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

  // Função para fazer logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erro ao fazer logout:", error);
        return;
      }
      
      // O listener onAuthStateChange já vai atualizar o estado
      setMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Erro inesperado:", error);
    }
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
          
          {/* Watchlist e Listas apenas para utilizadores autenticados */}
          {isLoggedIn && (
            <>
              <button
                onClick={() => navigate("/watchlist")}
                className="text-lg font-medium hover:text-[#1D4ED8] transition duration-300"
              >
                Watchlist
              </button>
              
              <button
                onClick={() => navigate("/lists")}
                className="text-lg font-medium hover:text-[#1D4ED8] transition duration-300"
              >
                Listas
              </button>
            </>
          )}
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
        {isLoggedIn && userData ? (
          // Menu do Utilizador (mostrado apenas quando logado)
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-full hover:bg-gray-700 transition"
            >
              <span className="bg-gray-700 w-6 h-6 rounded-full"></span>{" "}
              {userData.username} ▼
            </button>

            {menuOpen && (
              <div className="absolute right-0 bg-gray-700 p-2 mt-2 w-44 rounded-lg shadow-lg transform transition-all duration-300 z-10">
                <button
                  onClick={() => {
                    navigate("/");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left p-2 hover:bg-gray-600 transition"
                >
                  Início
                </button>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left p-2 hover:bg-gray-600 transition"
                >
                  Perfil
                </button>
                <button
                  onClick={() => {
                    navigate("/lists");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left p-2 hover:bg-gray-600 transition"
                >
                  Listas
                </button>
                <button
                  onClick={() => {
                    navigate("/likes");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left p-2 hover:bg-gray-600 transition"
                >
                  Likes
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left p-2 hover:bg-red-600 transition"
                >
                  Sign out
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