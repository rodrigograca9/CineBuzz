import { FaInstagram, FaFacebookF, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6"; // X (Twitter) atualizado

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-6">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        {/* Newsletter */}
        <div>
          <h3 className="font-bold text-lg">Subscreve a Newsletter!</h3>
          <div className="flex gap-2 mt-2">
            <input
              type="email"
              placeholder="Insere o e-mail"
              className="p-2 rounded bg-gray-700 text-white outline-none"
            />
            <button className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded transition">
              Enviar
            </button>
          </div>
        </div>

        {/* Redes Sociais */}
        <div>
          <h3 className="font-bold text-lg">Segue-nos!</h3>
          <div className="flex gap-3 mt-2 text-xl">
            <a href="#" className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition">
              <FaInstagram />
            </a>
            <a href="#" className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition">
              <FaXTwitter />
            </a>
            <a href="#" className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition">
              <FaFacebookF />
            </a>
            <a href="#" className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition">
              <FaTiktok />
            </a>
            <a href="#" className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition">
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
