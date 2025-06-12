import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        
        // Verificar sessão do utilizador
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData?.session) {
          navigate("/login");
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Verificar se o utilizador é administrador
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("is_admin")
          .eq("uid", userId)
          .single();
        
        if (userError || !userData?.is_admin) {
          navigate("/"); // Redirecionar se não for admin
          return;
        }
        
        setIsAdmin(true);
        fetchUsers();
        fetchComments();
      } catch (error) {
        console.error("Erro ao verificar status de administrador:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);
  
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("username", { ascending: true });
        
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Erro ao carregar utilizadores:", error);
    }
  };
  
  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          users (username, profile_image_url)
        `)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
    }
  };
  
  const deleteUser = async (userId) => {
    if (!window.confirm("Tem certeza que deseja excluir este utilizador? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    try {
      // Remover perfil do utilizador
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("uid", userId);
        
      if (error) throw error;
      
      // Atualizar a lista de utilizadores
      setUsers(users.filter(user => user.uid !== userId));
      
      alert("Utilizador removido com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir utilizador:", error);
      alert("Erro ao excluir utilizador: " + error.message);
    }
  };
  
  const deleteComment = async (commentId) => {
    if (!window.confirm("Tem certeza que deseja excluir este comentário?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);
        
      if (error) throw error;
      
      setComments(comments.filter(comment => comment.id !== commentId));
      alert("Comentário removido com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir comentário:", error);
      alert("Erro ao excluir comentário: " + error.message);
    }
  };
  
  const clearUserLikes = async (userId) => {
    if (!window.confirm("Tem certeza que deseja remover todos os likes deste utilizador?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ likes: [] })
        .eq("uid", userId);
        
      if (error) throw error;
      
      alert("Likes removidos com sucesso!");
      fetchUsers(); // Atualizar dados
    } catch (error) {
      console.error("Erro ao remover likes:", error);
      alert("Erro ao remover likes: " + error.message);
    }
  };
  
  const clearUserWatchlist = async (userId) => {
    if (!window.confirm("Tem certeza que deseja limpar a watchlist deste utilizador?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ watchlist: [] })
        .eq("uid", userId);
        
      if (error) throw error;
      
      alert("Watchlist limpa com sucesso!");
      fetchUsers(); // Atualizar dados
    } catch (error) {
      console.error("Erro ao limpar watchlist:", error);
      alert("Erro ao limpar watchlist: " + error.message);
    }
  };
  
  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_admin: !currentStatus })
        .eq("uid", userId);
        
      if (error) throw error;
      
      setUsers(users.map(user => {
        if (user.uid === userId) {
          return { ...user, is_admin: !currentStatus };
        }
        return user;
      }));
      
      alert(`Usuário ${!currentStatus ? "promovido a administrador" : "removido de administrador"} com sucesso!`);
    } catch (error) {
      console.error("Erro ao alterar status de administrador:", error);
      alert("Erro ao alterar status: " + error.message);
    }
  };
  
  const viewUserDetails = (user) => {
    setSelectedUser(user);
  };
  
  if (loading) {
    return (
      <div className="bg-[#14181C] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando painel de administração...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="bg-[#14181C] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-400">Acesso negado. Você não tem permissões de administrador.</p>
          <button 
            onClick={() => navigate("/")} 
            className="mt-4 bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }
  
  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredComments = comments.filter(comment => 
    comment.content?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    comment.users?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#0a0a0c] text-white min-h-screen">
      {/* Header */}
      <div className="bg-[#1a237e] p-6 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Painel de Administração</h1>
            <button 
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            >
              Voltar ao Site
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button 
            className={`py-3 px-6 ${activeTab === "users" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400"}`}
            onClick={() => setActiveTab("users")}
          >
            Utilizadores
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={`Pesquisar ${activeTab === "users" ? "utilizadores" : "comentários"}...`}
            className="w-full p-3 bg-[#1C2228] border border-gray-700 rounded-lg text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1C2228] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Detalhes do Utilizador</h2>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center mb-6">
                {selectedUser.profile_image_url ? (
                  <img src={selectedUser.profile_image_url} alt="Perfil" className="w-16 h-16 rounded-full object-cover mr-4" />
                ) : (
                  <div className="w-16 h-16 bg-[#2c387e] rounded-full flex items-center justify-center text-xl font-bold mr-4">
                    <span>{selectedUser.username?.charAt(0).toUpperCase() || "U"}</span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium">{selectedUser.username}</h3>
                  <p className="text-gray-400">{selectedUser.email}</p>
                  <p className="text-sm mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${selectedUser.is_admin ? "bg-green-900 text-green-400" : "bg-gray-800 text-gray-400"}`}>
                      {selectedUser.is_admin ? "Administrador" : "Utilizador"}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#14181C] p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                    </svg>
                    Likes
                  </h4>
                  <p className="text-gray-400">Total: {selectedUser.likes?.length || 0}</p>
                </div>
                
                <div className="bg-[#14181C] p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                    </svg>
                    Watchlist
                  </h4>
                  <p className="text-gray-400">Total: {selectedUser.watchlist?.length || 0}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-6">
                <button 
                  onClick={() => clearUserLikes(selectedUser.uid)}
                  className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-lg"
                >
                  Remover Todos os Likes
                </button>
                <button 
                  onClick={() => clearUserWatchlist(selectedUser.uid)}
                  className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-lg"
                >
                  Limpar Watchlist
                </button>
                <button 
                  onClick={() => toggleAdminStatus(selectedUser.uid, selectedUser.is_admin)}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
                >
                  {selectedUser.is_admin ? "Remover Admin" : "Tornar Admin"}
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm("Esta ação irá excluir permanentemente este utilizador. Continuar?")) {
                      deleteUser(selectedUser.uid);
                      setSelectedUser(null);
                    }
                  }}
                  className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Excluir Utilizador
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Content Tabs */}
        {activeTab === "users" && (
          <div className="bg-[#14181C] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#1C2228]">
                <tr>
                  <th className="py-3 px-4 text-left">Utilizador</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 px-4 text-center text-gray-400">
                      Nenhum utilizador encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.uid} className="border-b border-gray-800">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {user.profile_image_url ? (
                            <img src={user.profile_image_url} alt="Perfil" className="w-8 h-8 rounded-full object-cover mr-3" />
                          ) : (
                            <div className="w-8 h-8 bg-[#2c387e] rounded-full flex items-center justify-center text-sm font-bold mr-3">
                              <span>{user.username?.charAt(0).toUpperCase() || "U"}</span>
                            </div>
                          )}
                          {user.username}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.is_admin ? "bg-green-900 text-green-400" : "bg-gray-800 text-gray-400"}`}>
                          {user.is_admin ? "Admin" : "Utilizador"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => viewUserDetails(user)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded"
                            title="Ver detalhes"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </button>
                          <button 
                            onClick={() => deleteUser(user.uid)}
                            className="bg-red-600 hover:bg-red-700 text-white p-1 rounded"
                            title="Excluir usuário"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === "comments" && (
          <div className="bg-[#14181C] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#1C2228]">
                <tr>
                  <th className="py-3 px-4 text-left">Utilizador</th>
                  <th className="py-3 px-4 text-left">Filme ID</th>
                  <th className="py-3 px-4 text-left">Comentário</th>
                  <th className="py-3 px-4 text-left">Data</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredComments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 px-4 text-center text-gray-400">
                      Nenhum comentário encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredComments.map((comment) => (
                    <tr key={comment.id} className="border-b border-gray-800">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {comment.users?.profile_image_url ? (
                            <img src={comment.users.profile_image_url} alt="Perfil" className="w-8 h-8 rounded-full object-cover mr-3" />
                          ) : (
                            <div className="w-8 h-8 bg-[#2c387e] rounded-full flex items-center justify-center text-sm font-bold mr-3">
                              <span>{comment.users?.username?.charAt(0).toUpperCase() || "U"}</span>
                            </div>
                          )}
                          {comment.users?.username || "Usuário desconhecido"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{comment.movie_id}</td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                          {comment.content}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(comment.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          onClick={() => deleteComment(comment.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-1 rounded"
                          title="Excluir comentário"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}