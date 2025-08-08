import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

export default function NotFound({ isAuthenticated }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      {/* Icono */}
      <FaExclamationTriangle className="text-yellow-400 text-7xl mb-6 animate-bounce" />

      {/* Título 404 con gradiente */}
      <h1 className="text-8xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse">
        404
      </h1>

      {/* Mensaje */}
      <p className="text-xl text-gray-300 mb-8 text-center max-w-lg">
        Oops... La página que buscas no existe.  
        {isAuthenticated
          ? " Vuelve al dashboard para seguir controlando tus dispositivos."
          : " Inicia sesión para acceder a tu panel."}
      </p>

      {/* Botones */}
      <div className="flex gap-4 flex-wrap justify-center">
        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 transform transition-all duration-300 shadow-lg"
            >
              Ir al Dashboard
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:scale-105 transform transition-all duration-300 shadow-lg"
            >
              Cerrar Sesión
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 hover:scale-105 transform transition-all duration-300 shadow-lg"
          >
            Ir al Login
          </Link>
        )}
      </div>
    </div>
  );
}