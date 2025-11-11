import React, { useState } from "react";
import {
  Cloud,
  Loader,
  MapPin,
  Wind,
  Droplets,
  Thermometer,
  CloudRain,
  Search,
} from "lucide-react";

export default function ExternalDataFetcher() {
  const [city, setCity] = useState("Colombo");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(true);

  const handleFetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      console.log("Connecting to API Gateway at ws://localhost:9001/api");
      const ws = new WebSocket("ws://localhost:9001/api");

      ws.onopen = () => {
        console.log("Connected to API Gateway");
        const command = {
          command: "fetchWeather",
          city: city.trim(),
        };
        console.log("Sending weather command:", command);
        ws.send(JSON.stringify(command));
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log("Weather API Response:", response);

          if (!response) {
            console.warn("Received null response from server, ignoring");
            return;
          }

          if (
            response.type === "WEATHER_RESPONSE" &&
            response.status === "success"
          ) {
            console.log("✓ Valid weather response, setting data");
            setWeatherData({
              temperature: response.temperature,
              condition: response.condition,
              humidity: response.humidity,
              windSpeed: response.windSpeed,
            });
            ws.close();
            setLoading(false);
          } else if (response.type === "ERROR") {
            console.error("API Error:", response.error);
            setError(response.error || "Failed to fetch weather data");
            ws.close();
            setLoading(false);
          } else if (response.type === "SERVICE_STATUS_UPDATE") {
            console.log("Received service status update:", response);
          } else {
            console.warn("Unexpected response format:", response.type);
            setError("Unexpected response format from API Gateway");
            ws.close();
            setLoading(false);
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
          setError("Invalid response from server");
          ws.close();
          setLoading(false);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError("Failed to connect to API Gateway");
        setLoading(false);
      };

      ws.onclose = () => {
        if (loading) {
          setError("Connection closed unexpectedly");
          setLoading(false);
        }
      };

      setTimeout(() => {
        if (loading) {
          ws.close();
          setError("Request timeout");
          setLoading(false);
        }
      }, 10000);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      handleFetchWeather();
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-t-2 border-gray-200 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header (with collapse/expand) */}
        <div className="mb-6">
          {collapsed ? (
            <div className="flex items-center justify-between gap-3 mb-2 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow">
                  <Cloud className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Weather</h3>
                  <p className="text-xs text-gray-500">
                    Click to open weather tools
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCollapsed(false)}
                  className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow-md"
                >
                  Show Weather
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Weather Information
                  </h3>
                  <p className="text-sm text-gray-600">
                    Real-time weather data via API Gateway
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => setCollapsed(true)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md"
                  >
                    Hide
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <>
            {/* Search Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter city name..."
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 text-gray-800 placeholder:text-gray-400"
                  />
                </div>
                <button
                  onClick={handleFetchWeather}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Get Weather</span>
                    </>
                  )}
                </button>
              </div>

              {/* Info Badge */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <p className="text-xs text-blue-800 flex items-center gap-2">
                  <Cloud className="w-3 h-3" />
                  Uses API Gateway Service (HttpURLConnection) to fetch external
                  weather data
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm animate-shake">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-sm font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 text-sm mb-1">
                      Error
                    </p>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Weather Data Display */}
            {weatherData && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Weather Header */}
                <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-white/10"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-5 h-5" />
                      <h4 className="text-2xl font-bold">{city}</h4>
                    </div>
                    <p className="text-blue-100 text-sm">
                      Current Weather Conditions
                    </p>
                  </div>
                </div>

                {/* Temperature and Condition */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-200">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-3">
                        <Thermometer className="w-10 h-10 text-blue-600" />
                      </div>
                      <div className="text-5xl font-bold text-gray-900 mb-1">
                        {weatherData.temperature}°C
                      </div>
                      <div className="text-lg font-semibold text-gray-700">
                        {weatherData.condition}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {weatherData.humidity !== undefined && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                            <Droplets className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
                            Humidity
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                          {weatherData.humidity}%
                        </p>
                      </div>
                    )}
                    {weatherData.windSpeed !== undefined && (
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-xl">
                            <Wind className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-indigo-900 uppercase tracking-wide">
                            Wind Speed
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                          {weatherData.windSpeed}{" "}
                          <span className="text-lg text-gray-600">km/h</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4" />
                      <span className="font-medium">Data Source:</span>
                      <span>API Gateway Service</span>
                    </div>
                    <div className="text-gray-500">via HttpURLConnection</div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-2xl shadow-lg border border-blue-200 p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Loader className="w-12 h-12 animate-spin text-blue-500" />
                    <Cloud className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  Fetching Weather Data
                </p>
                <p className="text-sm text-gray-600">
                  Connecting to external API via Gateway Service...
                </p>
              </div>
            )}

            {/* Empty State */}
            {!weatherData && !loading && !error && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <CloudRain className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Ready to Fetch Weather
                </h4>
                <p className="text-sm text-gray-600">
                  Enter a city name and click "Get Weather" to retrieve
                  real-time weather information
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
