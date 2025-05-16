import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Verificar se o usuário está autenticado
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error("Erro de autenticação: " + sessionError.message);
        }
        
        if (!sessionData?.session) {
          // Redirecionar para login se não estiver autenticado
          navigate("/login");
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Buscar apenas os campos que existem na tabela users
        const { data, error: userError } = await supabase
          .from("users")
          .select("username, email")
          .eq("uid", userId)
          .single();
        
        if (userError) {
          throw new Error("Erro ao buscar dados do utilizador: " + userError.message);
        }
        
        // Adicionar os campos que ainda não existem no banco com valores vazios
        const processedData = {
          ...data,
          likes: [],
          watchlist: [],
          lists: []
        };
        
        setUserData(processedData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="bg-[#14181C] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">A carregar perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#14181C] text-white min-h-screen p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-[#1C2228] p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-red-400 mb-6 text-lg">{error}</p>
            <button 
              onClick={() => navigate("/login")} 
              className="bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Voltar para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-[#14181C] text-white min-h-screen p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-[#1C2228] p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <p className="text-white mb-6 text-lg">Erro ao carregar perfil. Por favor, tente novamente.</p>
            <button 
              onClick={() => navigate("/login")} 
              className="bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-700 transition-colors mr-4"
            >
              Voltar para Login
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-600 px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#14181C] text-white min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header do perfil com design melhorado */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg p-8 mb-8 shadow-lg">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-blue-500">
              {userData.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{userData.username}</h1>
              <p className="text-blue-300 mt-1">{userData.email}</p>
            </div>
          </div>
        </div>
        
        {/* Seções com estilo melhorado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-[#1C2228] p-6 rounded-lg shadow-md transition-transform hover:scale-102">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
              </svg>
              Likes
            </h2>
            <div className="bg-[#14181C] rounded-lg p-4 text-center">
              <p className="text-gray-400">Funcionalidade em desenvolvimento.</p>
            </div>
          </section>
          
          <section className="bg-[#1C2228] p-6 rounded-lg shadow-md transition-transform hover:scale-102">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
              </svg>
              Watchlist
            </h2>
            <div className="bg-[#14181C] rounded-lg p-4 text-center">
              <p className="text-gray-400">Funcionalidade em desenvolvimento.</p>
            </div>
          </section>
        </div>
        
        <section className="mt-6 bg-[#1C2228] p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
            </svg>
            Listas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div 
              onClick={() => alert("Funcionalidade em desenvolvimento")}
              className="aspect-square bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center text-2xl rounded-lg cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-colors shadow-md"
            >
              <span className="text-4xl font-light">+</span>
            </div>
            <div className="aspect-square bg-[#14181C] rounded-lg flex items-center justify-center p-4 text-center">
              <p className="text-gray-400">Funcionalidade em desenvolvimento.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}