import React, { useEffect, useState } from "react";
import mqtt from "mqtt";
import {
  FaLightbulb,
  FaPowerOff,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { MdOutlineWbSunny } from "react-icons/md";
import { GiSmokeBomb } from "react-icons/gi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [client, setClient] = useState(null);
  const [ledStatus, setLedStatus] = useState("off");
  const [sensorData, setSensorData] = useState({ analog: 0, ppm: 0 });
  const [alert, setAlert] = useState("");
  const [ppmHistory, setPpmHistory] = useState([]);
  const [analogHistory, setAnalogHistory] = useState([]);
  const [ppm, setPPM] = useState(null);
  const [lastMessageTime, setLastMessageTime] = useState(Date.now());
  const [espOnline, setEspOnline] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastMessageTime > 10000) {
        setEspOnline(false);
      } else {
        setEspOnline(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [lastMessageTime]);

  useEffect(() => {
    const clientId = "dashboard_" + Math.random().toString(16).substr(2, 8);
    const options = {
      clientId,
      clean: true,
      connectTimeout: 4000,
    };

    const mqttClient = mqtt.connect("wss://broker.hivemq.com:8884/mqtt", options);
    setClient(mqttClient);

    mqttClient.on("connect", () => {
      console.log("✅ Conectado a broker.hivemq.com");
      [
        "iot/led/status",
        "iot/led/control",
        "iot/sensor/mq7",
        "iot/sensor/ppm",
        "iot/alert/mq7",
      ].forEach((topic) => mqttClient.subscribe(topic));
    });

    mqttClient.on("message", (topic, message) => {
      const msg = message.toString();
      console.log(`📩 ${topic}:`, msg);
      setLastMessageTime(Date.now());

      if (topic === "iot/led/control" || topic === "iot/led/status") {
        setLedStatus(msg);
      } else if (topic === "iot/sensor/mq7") {
        const analogValue = parseInt(msg);
        setSensorData((prev) => ({ ...prev, analog: analogValue }));
        setAnalogHistory((prev) => [...prev.slice(-19), {
          time: new Date().toLocaleTimeString(),
          value: analogValue,
        }]);
      } else if (topic === "iot/sensor/ppm") {
        const ppmValue = parseFloat(msg).toFixed(2);
        setSensorData((prev) => ({ ...prev, ppm: ppmValue }));
        setPpmHistory((prev) => [...prev.slice(-19), {
          time: new Date().toLocaleTimeString(),
          value: parseFloat(ppmValue),
        }]);
      } else if (topic === "iot/alert/mq7") {
        setAlert(msg);
        setTimeout(() => setAlert(""), 5000);
      }
    });

    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  const toggleLED = (status) => {
    if (client && client.connected) {
      client.publish("iot/led/control", status);
      setLedStatus(status);
    }
  };

  const isDanger = sensorData.ppm > 100;
  const dangerLevel = Math.min((sensorData.ppm / 200) * 100, 100);
  const hasSensorData = espOnline && sensorData.ppm !== 0 && sensorData.analog !== 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white font-sans px-4 py-10 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center relative z-10">
        <h1 className="text-5xl sm:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4">
          🌐 IoT | Panel de Control | 🌐
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Controla tu ESP32 y monitorea el monóxido de carbono en tiempo real.
        </p>

        {!espOnline && (
          <div className="bg-red-700/80 border border-red-500 text-white px-6 py-4 rounded-xl mb-6 shadow-lg animate-pulse text-center">
            <p className="text-xl font-semibold">📴 Dispositivo desconectado</p>
            <p className="text-sm text-red-200">No se están recibiendo datos del ESP32. Verifica la conexión.</p>
          </div>
        )}

        {alert && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-red-900 text-yellow-200 px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
            <FaExclamationTriangle size={24} />
            <span className="font-bold">{alert}</span>
          </div>
        )}

        {/* Control LED */}
        <div className="w-full bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700 mb-10">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <FaLightbulb className={`text-yellow-300 ${ledStatus === "on" ? "animate-pulse" : ""}`} size={32} />
            Control de LED
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className={`relative w-16 h-16 rounded-full transition-all duration-500 shadow-lg ${ledStatus === "on" ? "bg-yellow-200 shadow-yellow-200/70 animate-ping-slow" : "bg-gray-600 shadow-gray-600/30"}`}>
                {ledStatus === "on" && <div className="absolute inset-0 rounded-full bg-yellow-100 blur-lg opacity-70 animate-pulse"></div>}
              </div>
              <div>
                <p className="text-lg text-gray-300">Estado:</p>
                <p className={`text-2xl font-bold ${ledStatus === "on" ? "text-yellow-300" : "text-gray-400"}`}>
                  {ledStatus === "on" ? "Encendido 💡" : "Apagado 🔌"}
                </p>
              </div>
            </div>
            <div className="flex gap-4 flex-wrap justify-center">
              <button
                onClick={() => toggleLED("on")}
                disabled={ledStatus === "on" || !espOnline}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-bold px-6 py-3 rounded-xl transition-all transform hover:scale-105"
              >
                Encender
              </button>
              <button
                onClick={() => toggleLED("off")}
                disabled={ledStatus === "off" || !espOnline}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white font-bold px-6 py-3 rounded-xl transition-all transform hover:scale-105"
              >
                Apagar
              </button>
            </div>
          </div>
          {/* Mensaje informativo */}
          <div className="text-center text-sm text-gray-400 mt-2">
            {!espOnline ? (
              <p className="text-red-300 font-semibold flex items-center justify-center gap-2">
                <FaPowerOff />
                ⚠️ No puedes controlar el LED porque el dispositivo no está conectado.
              </p>
            ) : ledStatus === "on" ? (
              <p className="flex items-center justify-center gap-2">
                <span className="animate-pulse">●</span>
                La luz de la habitación está <strong className="text-yellow-300">encendida</strong>.
              </p>
            ) : (
              <p>
                La luz está <strong className="text-gray-300">apagada</strong>. Puedes encenderla si lo deseas.
              </p>
            )}
          </div>
        </div>

        {/* Sensor CO - Versión Amigable y Educativa */}
        <div className="w-full bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          {/* Título principal con icono y explicación simple */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-3 text-white">
              <GiSmokeBomb className={`text-red-400 ${isDanger ? "animate-bounce" : ""}`} size={36} />
              Monitoreo de Monóxido de Carbono
            </h2>
            <p className="text-gray-300 mt-2 text-sm max-w-2xl mx-auto leading-relaxed">
              Este sensor vigila el aire en busca de <strong className="text-red-300">monóxido de carbono (CO)</strong>, un gas invisible, inodoro y muy peligroso.
              Es como un "detective de aire" que te avisa si algo no está bien.
            </p>
          </div>

          {/* Datos principales en tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Señal del sensor (técnico, pero explicado) */}
            <div className="bg-gray-900/70 rounded-xl p-5 border border-gray-600 text-center">
              <div className="text-sm text-gray-400 uppercase tracking-wide">Señal del sensor</div>
              <p className="text-3xl font-bold text-cyan-300 mt-2">{sensorData.analog}</p>
              <p className="text-xs text-gray-400 mt-1">
                Este número es como el "latido" del sensor. Nos ayuda a calcular cuánto CO hay.
              </p>
            </div>

            {/* Concentración de CO (clave) */}
            <div className="bg-gray-900/70 rounded-xl p-5 border border-gray-600 text-center">
              <div className="text-sm text-gray-400 uppercase tracking-wide">Nivel de CO en el aire</div>
              <p className="text-3xl font-bold mt-2 flex items-center justify-center gap-2">
                <span className={isDanger ? "text-red-400" : "text-green-400"}>
                  {sensorData.ppm} ppm
                </span>
                {isDanger ? (
                  <FaExclamationTriangle className="text-red-500 animate-pulse" size={24} />
                ) : (
                  <FaCheckCircle className="text-green-500" size={24} />
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {isDanger
                  ? "¡Cuidado! Nivel alto de gas peligroso."
                  : "Todo bien: nivel seguro de CO."}
              </p>
            </div>

            {/* Alerta de desconexión ESP */}
            {!espOnline && (
              <div className="col-span-2 bg-yellow-900/30 border border-yellow-500 p-4 rounded-xl animate-pulse mt-2">
                <p className="text-yellow-300 text-lg font-semibold flex items-center justify-center gap-2">
                  <FaPowerOff /> Dispositivo desconectado
                </p>
                <p className="text-yellow-200 text-sm mt-1">
                  No estamos recibiendo datos. Revisa que el sensor esté encendido y conectado a internet.
                </p>
              </div>
            )}
          </div>

          {/* Mensaje principal de seguridad - Destacado */}
          {espOnline ? (
            <div className={`text-center p-6 rounded-xl mt-4 border-l-6 transition-all duration-500 ${isDanger
              ? "bg-red-900/50 border-red-500 text-red-100"
              : "bg-green-900/20 border-green-500 text-green-100"
              }`}>
              <h3 className="text-2xl font-bold flex items-center justify-center gap-3">
                {isDanger ? (
                  <>
                    <FaExclamationTriangle className="text-red-400 animate-bounce" size={28} />
                    <span>¡ALERTA DE SEGURIDAD!</span>
                  </>
                ) : (
                  <>
                    <MdOutlineWbSunny className="text-green-400" size={28} />
                    <span>Todo está bien</span>
                  </>
                )}
              </h3>
              <p className="text-lg mt-3 leading-relaxed">
                {isDanger ? (
                  <>
                    <strong>¡Ventila ahora!</strong> Hay niveles altos de monóxido de carbono.
                    <br />
                    Apaga aparatos de gas, abre ventanas y sal del lugar si te sientes mal.
                  </>
                ) : (
                  <>
                    El aire está limpio y seguro. <br />
                    Puedes respirar tranquilo.
                  </>
                )}
              </p>
            </div>
          ) : null}

          {/* Mini explicación educativa al final */}
          <div className="mt-6 text-center text-xs text-gray-400 bg-gray-900/30 p-4 rounded-xl border border-gray-600">
            <p>
              💡 <strong>¿Sabías que?</strong> El monóxido de carbono (CO) es un gas tóxico que se produce cuando algo quema combustible sin suficiente oxígeno.
              Puede venir de estufas, calentadores o coches. No se ve ni huele, ¡por eso este sensor es tan importante!
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-green-300">📈 Historial PPM (CO)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ppmHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="time" tick={{ fill: "#ccc", fontSize: 12 }} />
                <YAxis tick={{ fill: "#ccc" }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-blue-300">📊 Historial Sensor Analógico</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analogHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="time" tick={{ fill: "#ccc", fontSize: 12 }} />
                <YAxis tick={{ fill: "#ccc" }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#c084fc" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Conectando ideas 💡 a la nube ☁️ | Erick</p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
        }
        .animate-ping-slow {
          animation: ping-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}