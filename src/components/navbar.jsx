import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBars, FaTimes } from "react-icons/fa";
import supabase from "../helper/supabaseClient";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsLoggedIn(true);
        fetchUserData(data.session.user.id);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

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

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (!userData?.uid) return;

    const userChannel = supabase
      .channel(`public:users:uid=eq.${userData.uid}`)
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `uid=eq.${userData.uid}`
        },
        (payload) => {
          setUserData(current => ({ ...current, ...payload.new }));
        }
      )
      .subscribe();

    const refreshInterval = setInterval(() => {
      fetchUserData(userData.uid);
    }, 60000);

    return () => {
      supabase.removeChannel(userChannel);
      clearInterval(refreshInterval);
    };
  }, [userData?.uid]);

  const fetchUserData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("username, is_admin, uid, profile_image_url")
        .eq("uid", userId)
        .single();

      if (error) {
        console.error("Erro ao procurar dados do utilizador:", error);
        return;
      }

      if (data) {
        setUserData({ ...data, uid: userId });
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${search}`);
      setSearch("");
      setSearchExpanded(false);
    }
  };

  const toggleSearch = () => {
    setSearchExpanded(!searchExpanded);
    if (!searchExpanded) {
      setTimeout(() => {
        document.getElementById("search-input")?.focus();
      }, 100);
    } else {
      setSearch("");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erro ao fazer logout:", error);
        return;
      }
      setMenuOpen(false);
      setMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Erro inesperado:", error);
    }
  };

  const navigateToAdmin = () => {
    if (!userData?.is_admin) {
      alert("Acesso negado: Apenas administradores.");
      navigate("/");
      return;
    }
    navigate("/admin");
    setMenuOpen(false);
  };

  return (
    <nav className="bg-[#14181C] text-white p-4 flex items-center justify-between shadow-lg px-4 md:px-8 relative z-20">
      {/* Logo */}
      <img
        src="/logo.png"
        alt="Logo"
        className="h-10 cursor-pointer"
        onClick={() => navigate("/")}
      />

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6">
        <button onClick={() => navigate("/movies")} className="hover:text-[#1D4ED8]">Filmes</button>

        {isLoggedIn && (
          <>
            <button onClick={() => navigate(`/profile/watchlist/${userData.uid}`)} className="hover:text-[#1D4ED8]">Watchlist</button>
            <button onClick={() => navigate(`/profile/lists/${userData.uid}`)} className="hover:text-[#1D4ED8]">Listas</button>
          </>
        )}

        {/* Search */}
        <div className="relative">
          {searchExpanded ? (
            <form onSubmit={handleSearch} className="flex items-center bg-gray-700 rounded-full overflow-hidden">
              <input
                id="search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar..."
                className="p-2 pl-4 pr-10 bg-gray-700 text-white outline-none w-48"
              />
              <button type="button" onClick={toggleSearch} className="absolute right-3 text-gray-400 hover:text-white">
                <FaSearch />
              </button>
            </form>
          ) : (
            <button onClick={toggleSearch} className="text-gray-400 hover:text-white">
              <FaSearch />
            </button>
          )}
        </div>

        {isLoggedIn && userData ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-full hover:bg-gray-700"
            >
              {userData.profile_image_url ? (
                <img src={userData.profile_image_url} alt="Perfil" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="bg-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {userData.username?.charAt(0).toUpperCase()}
                </div>
              )}
              {userData.username} ▼
            </button>

            {menuOpen && (
              <div className="absolute right-0 bg-gray-700 p-2 mt-2 w-44 rounded-lg shadow-lg z-50">
                <button onClick={() => navigate("/")} className="block w-full p-2 hover:bg-gray-600">Início</button>
                <button onClick={() => navigate("/profile")} className="block w-full p-2 hover:bg-gray-600">Perfil</button>
                <button onClick={() => navigate(`/profile/lists/${userData.uid}`)} className="block w-full p-2 hover:bg-gray-600">Listas</button>
                <button onClick={() => navigate(`/profile/likes/${userData.uid}`)} className="block w-full p-2 hover:bg-gray-600">Likes</button>
                <button onClick={handleLogout} className="block w-full p-2 hover:bg-red-600">Sign out</button>
                {userData.is_admin && (
                  <button onClick={navigateToAdmin} className="block w-full p-2 hover:bg-gray-600">Painel admin</button>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <button onClick={() => navigate("/login")} className="hover:text-[#1D4ED8]">Login</button>
            <button onClick={() => navigate("/register")} className="hover:text-[#1D4ED8]">Sign Up</button>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#1F2937] flex flex-col items-start p-4 gap-3 md:hidden shadow-lg z-10">
          <button onClick={() => { navigate("/movies"); setMobileMenuOpen(false); }}>Filmes</button>

          {isLoggedIn && (
            <>
              <button onClick={() => { navigate(`/profile/watchlist/${userData.uid}`); setMobileMenuOpen(false); }}>Watchlist</button>
              <button onClick={() => { navigate(`/profile/lists/${userData.uid}`); setMobileMenuOpen(false); }}>Listas</button>
            </>
          )}

          {/* Search on Mobile */}
          <form onSubmit={handleSearch} className="w-full">
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 rounded bg-gray-600 text-white"
            />
          </form>

          {isLoggedIn && userData ? (
            <>
              <button onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}>Perfil</button>
              <button onClick={() => { navigate(`/profile/likes/${userData.uid}`); setMobileMenuOpen(false); }}>Likes</button>
              {userData.is_admin && (
                <button onClick={() => { navigateToAdmin(); setMobileMenuOpen(false); }}>Painel admin</button>
              )}
              <button onClick={handleLogout} className="text-red-400">Sign out</button>
            </>
          ) : (
            <>
              <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}>Login</button>
              <button onClick={() => { navigate("/register"); setMobileMenuOpen(false); }}>Sign Up</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
