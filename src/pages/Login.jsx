import React, { useState, useEffect } from 'react';
import supabase from '../helper/supabaseClient';
import { Link, useNavigate, useLocation } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState(""); // Pode ser email ou username
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se existe uma URL de redirecionamento no localStorage
  useEffect(() => {
    // Se tiver um parâmetro de redirecionamento na URL, usá-lo
    const params = new URLSearchParams(location.search);
    const redirectUrl = params.get('redirect');
    
    if (redirectUrl) {
      localStorage.setItem('redirectAfterLogin', redirectUrl);
    }
  }, [location]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      // Verifica se o identificador é um email ou username
      const isEmail = identifier.includes('@');
      
      if (isEmail) {
        // Login diretamente com email e password
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password: password,
        });
        
        if (error) {
          handleLoginError(error);
          return;
        }

        if (data) {
          handleLoginSuccess();
        }
      } else {
        // É um nome de utilizador, precisamos buscar o email correspondente
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', identifier)
          .single();

        if (userError || !userData) {
          setMessage("Nome de utilizador não encontrado.");
          setMessageType("error");
          setPassword("");
          setIsLoading(false);
          return;
        }

        // Agora temos o email, podemos fazer login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: password,
        });

        if (error) {
          handleLoginError(error);
          return;
        }

        if (data) {
          handleLoginSuccess();
        }
      }
    } catch (unexpectedError) {
      setMessage("Ocorreu um erro inesperado.");
      setMessageType("error");
      console.error(unexpectedError);
      setIsLoading(false);
    }
  };

  // Função para lidar com erros de login
  const handleLoginError = (error) => {
    if (error.message.includes("Invalid login credentials")) {
      setMessage("Credenciais incorretas.");
    } else {
      setMessage(`Erro ao entrar: ${error.message}`);
    }
    setMessageType("error");
    setPassword("");
    setIsLoading(false);
  };

  // Função para lidar com login bem-sucedido
  const handleLoginSuccess = () => {
    setMessage("Login bem-sucedido! A redirecionar...");
    setMessageType("success");
    
    // Verificar se existe uma URL de redirecionamento
    const redirectUrl = localStorage.getItem('redirectAfterLogin');
    
    // Redirecionar após 1.5 segundos
    setTimeout(() => {
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin'); // Limpar após usar
        navigate(redirectUrl);
      } else {
        navigate("/");
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
      <div className="bg-gray-800 shadow-lg rounded-2xl p-8 w-full max-w-md mt-[-90px]">
        <h2 className="text-2xl font-semibold text-center text-white mb-4">Entrar</h2>
        
        {/* Mensagem de erro ou sucesso com ícone */}
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
          <input
            className="border border-gray-600 bg-gray-700 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setIdentifier(e.target.value)}
            value={identifier}
            type="text"
            placeholder="Email ou nome de utilizador"
            required
          />
          <input
            className="border border-gray-600 bg-gray-700 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            placeholder="Password"
            required
          />
          
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Entrar
          </button>
        </form>
        
        <div className="flex flex-col space-y-2 mt-4">
          <p className="text-center text-sm text-gray-400">
            Não tem uma conta? <Link to="/register" className="text-blue-400 hover:underline">Fazer registo</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;