import React, { useState } from "react";
import supabase from "../helper/supabaseClient";
import { Link, useNavigate } from "react-router-dom"; // Adicionei useNavigate

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate(); // Hook para navegação

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    
    // Validação de campos
    if (password.length < 6) {
      setMessage("A password deve ter pelo menos 6 caracteres.");
      setMessageType("error");
      return;
    }

    try {
      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        // Mensagens de erro personalizadas baseadas no tipo de erro
        if (error.message.includes("Email already registered")) {
          setMessage("Este email já está registado.");
        } else if (error.message.includes("Password should be")) {
          setMessage("A senha não atende aos requisitos mínimos de segurança.");
        } else if (error.message.includes("User already registered")) {
          setMessage("Nome de utilizador ou email já em uso."); 
        } else if (error.message.includes("Invalid email")) {
          setMessage("Por favor, insira um endereço de email válido.");
        } else {
          setMessage(`Erro ao criar conta: ${error.message}`);
        }
        setMessageType("error");
        return;
      }

      if (data?.user) {
        const userId = data.user.id;

        // Inserir os dados na tabela "users"
        const { error: insertError } = await supabase.from("users").insert([
          {
            uid: userId,
            username,
            email,
          },
        ]);

        if (insertError) {
          // Mensagens personalizadas para erros de inserção
          if (insertError.message.includes("duplicate key")) {
            setMessage("Nome de utilizador já em uso.");
          } else {
            setMessage(`Erro ao guardar os dados: ${insertError.message}`);
          }
          setMessageType("error");
          return;
        }

        setMessage("Conta criada com sucesso! A redirecionar...");
        setMessageType("success");
        
        // Limpar os campos
        setUsername("");
        setEmail("");
        setPassword("");
        
        // Redirecionar para a página de login após 1.5 segundos
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (unexpectedError) {
      setMessage("Ocorreu um erro inesperado.");
      setMessageType("error");
      console.error(unexpectedError);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
      <div className="bg-gray-800 shadow-lg rounded-2xl p-8 w-full max-w-md mt-[-90px]">
        <h2 className="text-2xl font-semibold text-center text-white mb-4">Criar Conta</h2>
        
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
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            type="text"
            placeholder="Nome de utilizador"
            required
          />
          <input
            className="border border-gray-600 bg-gray-700 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder="Email"
            required
          />
          <input
            className="border border-gray-600 bg-gray-700 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            placeholder="Password"
            required
            minLength={6}
          />
          <div className="text-xs text-gray-400 -mt-2">A password deve conter pelo menos 6 caracteres</div>
          
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition"
          >
            Criar Conta
          </button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-4">
          Já tem uma conta? <Link to="/login" className="text-blue-400 hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;