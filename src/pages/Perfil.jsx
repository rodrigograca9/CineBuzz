import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";

// API constants from MovieDetails component
const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MzRkNDdmMDhlYmY4ZjA5OGZiNTk4Y2ViMTA1NGMzZSIsIm5iZiI6MTc0MDA2NDM5Mi42NzkwMDAxLCJzdWIiOiI2N2I3NDY4OGU0ODRmYzIxNTQxYTIzNTEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.eiEa5fYu8UkMxztHU4IgNpCjkxnbmOZVde2p8Zsm2a4';

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

// Movie card component to reuse across sections
const MovieCard = ({ movieId, onNavigate }) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/movie/${movieId}`, API_OPTIONS);
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  if (loading) {
    return (
      <div className="w-32 h-48 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie || !movie.poster_path) {
    return (
      <div className="w-32 h-48 bg-gray-800 rounded-lg flex items-center justify-center text-center p-2">
        <span className="text-gray-400 text-xs">{movie?.title || "Filme não encontrado"}</span>
      </div>
    );
  }

  return (
    <div 
      className="w-32 cursor-pointer hover:opacity-80 transition"
      onClick={() => onNavigate(`/movie/${movieId}`)}
    >
      <img
        src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
        alt={movie.title}
        className="rounded-lg shadow-md hover:scale-105 transform transition duration-300"
      />
      <p className="text-sm mt-2 text-center text-gray-300 line-clamp-1">{movie.title}</p>
    </div>
  );
};

// List card component
const ListCard = ({ list, onNavigate, onDelete }) => (
  <div className="relative group">
    <div 
      className="bg-[#1C2228] rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:bg-gray-800 transition"
      onClick={() => onNavigate(`/list/${list.id}`)}
    >
      <p className="text-white text-center font-medium p-2">{list.name}</p>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete(list.id);
      }}
      className="absolute top-2 right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      title="Apagar lista"
    >
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  </div>
);

// Modal de confirmação de exclusão
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, listName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">Confirmar Exclusão</h2>
        <p className="text-gray-300 mb-6">
          Tem certeza que deseja excluir a lista "{listName}"? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de edição de perfil
const EditProfileModal = ({ isOpen, onClose, userData, onProfileUpdate }) => {
  const [username, setUsername] = useState(userData?.username || "");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(userData?.profile_image_url || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Resetar estados quando o modal abre
    if (isOpen) {
      setUsername(userData?.username || "");
      setMessage("");
      setPreviewUrl(userData?.profile_image_url || null);
      setProfileImage(null);
    }
  }, [isOpen, userData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificar se o arquivo é uma imagem
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
      setMessage("Por favor, selecione uma imagem válida (JPEG, PNG ou GIF).");
      setMessageType("error");
      return;
    }

    // Verificar tamanho máximo (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage("A imagem deve ter no máximo 2MB.");
      setMessageType("error");
      return;
    }

    setProfileImage(file);
    
    // Gerar URL para prévia
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      let profile_image_url = userData?.profile_image_url;
      
      // Se o usuário removeu a imagem
      if (previewUrl === null && userData?.profile_image_url) {
        // Remover imagem antiga do storage
        if (userData.profile_image_url) {
          const oldImagePath = userData.profile_image_url.split('/').pop();
          await supabase.storage.from('profileimages').remove([oldImagePath]);
        }
        profile_image_url = null;
      }
      
      // Se o usuário selecionou uma nova imagem
      if (profileImage) {
        // Remover imagem antiga do storage, se existir
        if (userData.profile_image_url) {
          const oldImagePath = userData.profile_image_url.split('/').pop();
          await supabase.storage.from('profileimages').remove([oldImagePath]);
        }
        
        // Upload da nova imagem
        const fileExt = profileImage.name.split('.').pop();
        const safeUid = userData.uid.replace(/[^a-zA-Z0-9-_]/g, ""); 
        const fileName = `${userData.uid}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profileimages')
          .upload(fileName, profileImage,
            {contentType: profileImage.type
            }
          );
          
        if (uploadError) {
          throw new Error("Erro ao fazer upload da imagem: " + uploadError.message);
        }
        
        // Obter URL pública da imagem
        const { data: urlData } = await supabase.storage
          .from('profileimages')
          .getPublicUrl(fileName);
          
        profile_image_url = urlData.publicUrl;
      }

      // Atualizar informações do usuário
      const { error } = await supabase
        .from("users")
        .update({ 
          username: username,
          profile_image_url: profile_image_url
        })
        .eq("uid", userData.uid);

      if (error) {
        setMessage("Erro ao atualizar perfil: " + error.message);
        setMessageType("error");
        setIsLoading(false);
        return;
      }

      // Sucesso
      setMessage("Perfil atualizado com sucesso!");
      setMessageType("success");
      setTimeout(() => {
        onProfileUpdate({
          ...userData,
          username,
          profile_image_url
        });
        onClose();
      }, 1500);
    } catch (error) {
      setMessage("Ocorreu um erro inesperado: " + error.message);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-semibold text-center text-white mb-4">Editar Perfil</h2>
        
        {/* Mensagem de erro ou sucesso */}
        {message && (
          <div className={`p-3 rounded-lg mb-4 flex items-center ${
            messageType === "success" ? "bg-green-900/50 text-green-400" : "bg-orange-900/50 text-orange-400"
          }`}>
            <span className="mr-2">
              {messageType === "success" ? "✓" : "⚠️"}
            </span>
            <p className="text-sm">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {/* Preview do avatar e opções de imagem */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Imagem de perfil" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
                />
              ) : (
                <div 
                  className="w-24 h-24 bg-[#2c387e] rounded-full flex items-center justify-center text-3xl font-bold border-2 border-blue-400"
                >
                  <span className="text-white">{username.charAt(0).toUpperCase() || userData?.username?.charAt(0).toUpperCase() || "U"}</span>
                </div>
              )}
              
              {/* Botões de ação de imagem */}
              <div className="absolute -bottom-2 -right-2 flex space-x-1">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="bg-blue-500 p-1 rounded-full hover:bg-blue-600"
                  title="Carregar imagem"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </button>
                
                {previewUrl && (
                  <button 
                    type="button"
                    onClick={handleRemoveImage}
                    className="bg-red-500 p-1 rounded-full hover:bg-red-600"
                    title="Remover imagem"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Input file oculto */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg, image/png, image/gif"
              className="hidden"
            />

            <p className="text-gray-400 text-xs mt-4">Clique no ícone de câmera para carregar uma imagem de perfil.</p>
          </div>
          
          {/* Campo de nome de utilizador */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome de Utilizador</label>
            <input
              className="border border-gray-600 bg-gray-700 text-white rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              type="text"
              placeholder="Nome de utilizador"
              required
            />
          </div>
          
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
};

// Modal de visualização de todas as listas
const AllListsModal = ({ isOpen, onClose, lists, onNavigate, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-semibold text-center text-white mb-6">Todas as Listas</h2>
        
        {lists.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhuma lista criada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {lists.map(list => (
              <ListCard 
                key={list.id}
                list={list}
                onNavigate={(path) => {
                  onNavigate(path);
                  onClose();
                }}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAllListsModalOpen, setIsAllListsModalOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
    
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
        if (sessionError) throw new Error("Erro de autenticação: " + sessionError.message);
        if (!sessionData?.session) {
          navigate("/login");
          return;
        }
    
        const userId = sessionData.session.user.id;
    
        const { data, error: userError } = await supabase
          .from("users")
          .select("username, email, likes, watchlist, profile_image_url")
          .eq("uid", userId)
          .single();
    
        if (userError) throw new Error("Erro ao buscar dados do utilizador: " + userError.message);
    
        const processedData = {
          ...data,
          uid: userId,
          likes: data.likes || [],
          watchlist: data.watchlist || []
        };
    
        setUserData(processedData);
        
        const { data: listsData, error: listsError } = await supabase
          .from("user_lists")
          .select("*")
          .eq("user_id", userId)
          .order('created_at', { ascending: false });
    
        if (listsError) {
          throw new Error("Erro ao buscar listas do usuário: " + listsError.message);
        }
    
        setUserLists(listsData || []);
    
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleProfileUpdate = (updatedUserData) => {
    setUserData(updatedUserData);
  };

  const handleDeleteList = (listId) => {
    const listToDelete = userLists.find(list => list.id === listId);
    if (listToDelete) {
      setListToDelete(listToDelete);
      setIsConfirmDeleteModalOpen(true);
    }
  };

  const confirmDeleteList = async () => {
    if (!listToDelete) return;
    
    try {
      const { error } = await supabase
        .from("user_lists")
        .delete()
        .eq("id", listToDelete.id);
        
      if (error) {
        throw new Error("Erro ao excluir lista: " + error.message);
      }
      
      // Atualizar estado após exclusão bem-sucedida
      setUserLists(userLists.filter(list => list.id !== listToDelete.id));
      setIsConfirmDeleteModalOpen(false);
      setListToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir lista:", error);
      alert("Não foi possível excluir a lista. Tente novamente.");
    }
  };

  const createNewList = async () => {
    const listName = prompt("Digite o nome para a nova lista:");
    if (!listName) return;
    
    try {
      const { data, error } = await supabase
        .from("user_lists")
        .insert({
          user_id: userData.uid,
          name: listName,
          movie_ids: [],
          created_at: new Date()
        })
        .select();
    
      if (error) {
        throw new Error("Erro ao criar lista: " + error.message);
      }
      
      if (data && data.length > 0) {
        setUserLists([data[0], ...userLists]);
      }
    } catch (error) {
      console.error("Erro ao criar lista:", error);
      alert("Não foi possível criar a lista. Tente novamente.");
    }
  };

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

  // Get only the last 3 items for likes and watchlist
  const recentLikes = userData.likes.slice(-3).reverse();
  const recentWatchlist = userData.watchlist.slice(-3).reverse();
  
  // Get only the last 4 lists
  const recentLists = userLists.slice(0, 3);

  return (
    <div className="bg-[#0a0a0c] text-white min-h-screen">
      {/* Profile Card */}
      <div className="bg-[#1a237e] p-6 mb-8 rounded-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          {userData.profile_image_url ? (
            <img 
              src={userData.profile_image_url} 
              alt="Imagem de perfil" 
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
            />
          ) : (
            <div className="w-24 h-24 bg-[#2c387e] rounded-full flex items-center justify-center text-3xl font-bold border-2 border-blue-400">
              <span className="text-white">{userData.username?.charAt(0).toUpperCase() || "R"}</span>
            </div>
          )}
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">{userData.username || "rodrigo"}</h1>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar Perfil
              </button>
            </div>
            <p className="text-gray-300 text-sm mt-1">{userData.email}</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6">
        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Likes Section */}
          <div className="bg-[#14181C] rounded-lg p-4">
            <div className="flex items-center justify-between gap-2 mb-4 border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                </svg>
                <h2 className="text-lg font-medium text-white">Likes</h2>
              </div>
              {userData.likes.length > 3 && (
                <button 
                  onClick={() => navigate(`/profile/likes/${userData.uid}`)}
                  className="text-blue-400 text-sm hover:underline"
                >
                  Ver Todos ({userData.likes.length})
                </button>
              )}
            </div>
            
            {userData.likes.length === 0 ? (
              <div className="bg-[#1C2228] rounded-lg p-4 text-center">
                <p className="text-gray-400">Nenhum filme curtido ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {recentLikes.map(movieId => (
                  <MovieCard key={movieId} movieId={movieId} onNavigate={navigate} />
                ))}
              </div>
            )}
          </div>
          
          {/* Watchlist Section */}
          <div className="bg-[#14181C] rounded-lg p-4">
            <div className="flex items-center justify-between gap-2 mb-4 border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                </svg>
                <h2 className="text-lg font-medium text-white">Watchlist</h2>
              </div>
              {userData.watchlist.length > 3 && (
                <button 
                  onClick={() => navigate(`/profile/watchlist/${userData.uid}`)}
                  className="text-blue-400 text-sm hover:underline"
                >
                  Ver Todos ({userData.watchlist.length})
                </button>
              )}
            </div>
            
            {userData.watchlist.length === 0 ? (
              <div className="bg-[#1C2228] rounded-lg p-4 text-center">
                <p className="text-gray-400">Nenhum filme na lista para assistir.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {recentWatchlist.map(movieId => (
                  <MovieCard key={movieId} movieId={movieId} onNavigate={navigate} />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Lists Section */}
        <div className="bg-[#14181C] rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between gap-2 mb-4 border-b border-gray-800 pb-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
              </svg>
              <h2 className="text-lg font-medium text-white">Listas</h2>
            </div>
            {userLists.length > 3 && (
              <button 
                onClick={() => setIsAllListsModalOpen(true)}
                className="text-blue-400 text-sm hover:underline"
              >
                Ver Todas ({userLists.length})
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Create New List Button */}
            <div 
              className="bg-[#1a3170] rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:bg-[#2a4180] transition-colors"
              onClick={createNewList}
            >
              <span className="text-3xl text-white">+</span>
            </div>
            
            {/* Display existing lists */}
            {userLists.length === 0 ? (
              <div className="bg-[#1C2228] rounded-lg aspect-square flex items-center justify-center">
                <p className="text-gray-400 text-center text-sm p-2">Nenhuma lista criada.</p>
              </div>
            ) : (
              recentLists.map(list => (
                <ListCard 
                  key={list.id}
                  list={list}
                  onNavigate={navigate}
                  onDelete={handleDeleteList}
                />
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de edição de perfil */}
      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={userData}
        onProfileUpdate={handleProfileUpdate}
      />
      
      {/* Modal de visualização de todas as listas */}
      <AllListsModal
        isOpen={isAllListsModalOpen}
        onClose={() => setIsAllListsModalOpen(false)}
        lists={userLists}
        onNavigate={navigate}
        onDelete={handleDeleteList}
      />
      
      {/* Modal de confirmação de exclusão */}
      <ConfirmDeleteModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => {
          setIsConfirmDeleteModalOpen(false);
          setListToDelete(null);
        }}
        onConfirm={confirmDeleteList}
        listName={listToDelete?.name || ""}
      />
    </div>
  );
}