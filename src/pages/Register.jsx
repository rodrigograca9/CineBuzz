import React, { useState } from "react";
import supabase from "../helper/supabaseClient";
import { Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // Novo estado para definir o tipo de mensagem

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    // Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setMessageType("error"); // Define como erro
      return;
    }

    if (data?.user) {
      const userId = data.user.id; // ID do usuário gerado pelo Supabase Auth

      // Inserir os dados na tabela "users"
      const { error: insertError } = await supabase.from("users").insert([
        {
          uid: userId, // Agora esse campo está correto
          username,
          email,
        },
      ]);

      if (insertError) {
        setMessage(insertError.message);
        setMessageType("error"); // Define como erro
        return;
      }

      setMessage("Conta criada com sucesso!");
      setMessageType("success"); // Define como sucesso
    }

    // Limpar os campos
    setUsername("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
      {/* Ajustei a margem para trazer a caixa um pouco mais para cima */}
      <div className="bg-gray-800 shadow-lg rounded-2xl p-8 w-full max-w-md mt-[-90px]">
        <h2 className="text-2xl font-semibold text-center text-white mb-4">Criar Conta</h2>
        
        {/* Mensagem de erro ou sucesso com cor dinâmica */}
        {message && (
          <p
            className={`text-center text-sm mb-4 ${
              messageType === "success" ? "text-green-400" : "text-orange-400"
            }`}
          >
            {message}
          </p>
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
          />
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
