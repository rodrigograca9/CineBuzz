import { useState } from "react";
import { FaInstagram, FaFacebookF, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import supabase from "../helper/supabaseClient";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubscribe = async () => {
    setStatus("");

    if (!email.includes("@") || !email.includes(".")) {
      setStatus("E-mail inválido.");
      return;
    }

    const { error } = await supabase.from("newsletter").insert({ email });

    if (error) {
      if (error.code === "23505") {
        setStatus("Este e-mail já está registado.");
      } else {
        setStatus("Erro ao subscrever. Tenta novamente.");
        console.error(error);
      }
    } else {
      toast.success("Obrigado por subscreveres a newsletter!", {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark"
      });
      setStatus("");
      setEmail("");
    }
  };

  return (
    <footer className="bg-gray-800 text-white py-8 relative">
      <ToastContainer />

      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="w-full sm:w-1/2">
          <h3 className="text-xl font-semibold text-gray-200">Subscreve a Newsletter!</h3>
          <p className="text-gray-400 mt-2">Recebe as novidades diretamente no teu e-mail.</p>
          <div className="flex mt-4 gap-3 flex-col sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Insere o e-mail"
              className="p-4 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-[#111827] transition w-full sm:w-auto"
            />
            <button
              onClick={handleSubscribe}
              className="bg-[#111827] hover:bg-[#0a1015] text-white p-4 rounded-lg transition w-full sm:w-auto"
            >
              Enviar
            </button>
          </div>
          {status && (
            <p className="mt-2 text-sm text-center sm:text-left text-red-400">{status}</p>
          )}
        </div>

        <div className="w-full sm:w-1/2">
          <h3 className="text-xl font-semibold text-gray-200">Segue-nos!</h3>
          <div className="flex gap-4 mt-3 text-3xl justify-center sm:justify-start">
            <a href="#" className="p-3 bg-gray-700 hover:bg-[#111827] rounded-full transition transform hover:scale-110"><FaInstagram /></a>
            <a href="#" className="p-3 bg-gray-700 hover:bg-[#111827] rounded-full transition transform hover:scale-110"><FaXTwitter /></a>
            <a href="#" className="p-3 bg-gray-700 hover:bg-[#111827] rounded-full transition transform hover:scale-110"><FaFacebookF /></a>
            <a href="#" className="p-3 bg-gray-700 hover:bg-[#111827] rounded-full transition transform hover:scale-110"><FaTiktok /></a>
            <a href="#" className="p-3 bg-gray-700 hover:bg-[#111827] rounded-full transition transform hover:scale-110"><FaYoutube /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-600 mt-8"></div>

      <div className="text-center text-gray-400 text-sm mt-6">
        <p>&copy; 2025 Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
