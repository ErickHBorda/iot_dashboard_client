import { useState } from "react";
import { FaMicrochip, FaWifi, FaExclamationTriangle, FaEye, FaEyeSlash, FaBarcode, FaAccessibleIcon } from "react-icons/fa";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "1234") {
      onLogin();
    } else {
      setError("Usuario o contraseña incorrecta. Intenta nuevamente.");
      setTimeout(() => setError(""), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Glow decorativo */}
      <div className="absolute top-0 left-0 w-60 h-60 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse -z-10"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse -z-10"></div>

      {/* Login Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-10 rounded-2xl shadow-2xl max-w-sm w-full text-white border border-gray-700 relative z-10"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2 text-cyan-400 text-5xl animate-bounce">
            <FaMicrochip />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Portal del Internet de las Cosas 🔐
          </h2>
          <p className="text-sm text-gray-400 mt-2 italic">
            Conecta tu mundo físico a la nube ☁️
          </p>
        </div>

        {/* Usuario */}
        <div className="mb-4">
          <label className="block mb-1 text-sm text-gray-300">Usuario</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ej: admin"
            required
          />
        </div>

        {/* Contraseña con botón de mostrar */}
        <div className="mb-6 relative">
          <label className="block mb-1 text-sm text-gray-300">Contraseña</label>
          <input
            type={showPassword ? "text" : "password"}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ej: $d189$@j"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-pink-400 transition"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Botón de login */}
        <button
          type="submit"
          className="w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded font-bold transition-all"
        >
          Iniciar Sesión
        </button>
      </form>

      {/* Footer decorativo */}
      <div className="absolute bottom-5 text-gray-600 text-xs text-center w-full">
        <p className="flex items-center justify-center gap-2">
          <FaWifi /> Plataforma conectada por MQTT | Proyecto final de la asignatura Computación en la Nube | Ciclo: 8°
        </p>
        <p className="flex items-center justify-center gap-2">
          <FaEye /> Desarrollado por: ERICK
        </p>
      </div>

      {/* Toast de error */}
      {error && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-red-900 text-yellow-200 px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <FaExclamationTriangle className="text-yellow-300" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}