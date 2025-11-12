import React, { useState, useEffect } from "react";
import {
  Cloud,
  Droplet,
  Wind,
  Eye,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function ApiGatewayTab({ onSendCommand, isConnected }) {
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [city, setCity] = useState("Colombo");

  useEffect(() => {
    const handleServiceResult = (event) => {
      const msg = event.detail;
      if (msg.result_from === "API_GATEWAY") {
        try {
          const data = JSON.parse(msg.data);
          setWeatherData(data);
          setLastUpdate(new Date());
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error("Error parsing weather data:", err);
          setError("Failed to parse weather data");
          setLoading(false);
        }
      }
    };

    window.addEventListener("service-result", handleServiceResult);
    return () =>
      window.removeEventListener("service-result", handleServiceResult);
  }, []);

  const handleFetchWeather = () => {
    if (!isConnected) {
      setError("Not connected to Hub Server");
      return;
    }

    setLoading(true);
    setError(null);
    onSendCommand("API_GATEWAY", "get-weather");

    // Timeout after 10 seconds
    setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Request timeout - no response from API Gateway service");
      }
    }, 10000);
  };

  const getWeatherEmoji = () => {
    if (!weatherData?.current) return "🌤️";
    const code = weatherData.current.weather_code;
    // Simplified weather code mapping (0=clear, 1-3=cloudy, 45-48=fog, 80-82=rain, 85-86=snow)
    if (code === 0) return "☀️";
    if (code <= 3) return "☁️";
    if (code <= 48) return "🌫️";
    if (code <= 67) return "❄️";
    if (code <= 82) return "🌧️";
    return "⛈️";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Controls */}
      <div className="lg:col-span-1">
        <div className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600/50 to-blue-600/50 px-6 py-4 border-b border-slate-600">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-cyan-400" />
              API Gateway
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Member 2 - HttpURLConnection to External APIs
            </p>
          </div>

          {/* Controls */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City name"
                disabled={loading}
                className="w-full px-4 py-2 bg-slate-600/50 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">
                Currently showing weather for: <strong>{city}</strong>
              </p>
            </div>

            <button
              onClick={handleFetchWeather}
              disabled={!isConnected || loading}
              className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                isConnected && !loading
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl"
                  : "bg-slate-600 text-slate-400 cursor-not-allowed opacity-50"
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  Fetch Weather
                </>
              )}
            </button>

            {!isConnected && (
              <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                <p className="text-xs text-red-300">
                  ⚠️ Not connected to Hub. Make sure the Hub Server is running.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            {lastUpdate && !loading && !error && (
              <div className="p-3 bg-green-900/30 border border-green-700/50 rounded-lg flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-300">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-slate-700/30 border-t border-slate-600 px-6 py-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>🔗 How it works:</strong>
              <br />
              1. Click "Fetch Weather" to send command to Hub
              <br />
              2. Hub forwards command to API Gateway service (port 9001)
              <br />
              3. API Gateway uses HttpURLConnection to fetch data
              <br />
              4. Result displays here
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Weather Display */}
      <div className="lg:col-span-2">
        {!weatherData && !loading && !error && (
          <div className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="text-6xl mb-4">☀️</div>
              <h3 className="text-xl font-semibold text-slate-100 mb-2">
                Ready to fetch weather data
              </h3>
              <p className="text-slate-400">
                Click "Fetch Weather" to get current conditions via
                HttpURLConnection
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Loader className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                Fetching weather data
              </h3>
              <p className="text-slate-400">
                Sending command through Hub to API Gateway service...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 rounded-lg border border-red-700/50 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-red-200 mb-2">
                Error fetching weather
              </h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {weatherData && (
          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-lg border border-cyan-700/50 overflow-hidden">
            {/* Current Weather */}
            <div className="p-8 bg-slate-700/50 border-b border-slate-600">
              <div className="text-center">
                <div className="text-7xl mb-4">{getWeatherEmoji()}</div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {weatherData.current?.temperature_2m}°C
                </h1>
                <p className="text-lg text-slate-300">
                  {city} - Current Weather
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
              {/* Temperature */}
              <div className="bg-slate-600/40 rounded-lg p-4 border border-slate-500/50">
                <div className="flex items-center gap-2 mb-2">
                  <Droplet className="w-4 h-4 text-red-400" />
                  <p className="text-xs font-semibold text-slate-400">
                    TEMPERATURE
                  </p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {weatherData.current?.temperature_2m}°C
                </p>
              </div>

              {/* Weather Code */}
              <div className="bg-slate-600/40 rounded-lg p-4 border border-slate-500/50">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <p className="text-xs font-semibold text-slate-400">
                    WEATHER CODE
                  </p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {weatherData.current?.weather_code}
                </p>
              </div>

              {/* Last Update */}
              <div className="bg-slate-600/40 rounded-lg p-4 border border-slate-500/50">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="w-4 h-4 text-cyan-400" />
                  <p className="text-xs font-semibold text-slate-400">
                    DATA SOURCE
                  </p>
                </div>
                <p className="text-sm font-bold text-cyan-300">
                  Open-Meteo API
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {lastUpdate?.toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Raw JSON Data */}
            <div className="bg-slate-700/30 border-t border-slate-600 px-6 py-4">
              <p className="text-xs font-semibold text-slate-400 mb-2">
                Raw JSON Response:
              </p>
              <pre className="bg-slate-800 p-3 rounded text-xs text-cyan-300 overflow-x-auto max-h-48">
                {JSON.stringify(weatherData, null, 2)}
              </pre>
            </div>

            {/* Footer Info */}
            <div className="bg-slate-700/30 border-t border-slate-600 px-6 py-4">
              <p className="text-xs text-slate-400">
                ✅ <strong>HttpURLConnection Success!</strong> Real weather data
                fetched from Open-Meteo Free API (no authentication required)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
