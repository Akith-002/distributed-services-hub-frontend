import React, { useState } from "react";
import { Cloud, Loader } from "lucide-react";

export default function ExternalDataFetcher() {
  const [city, setCity] = useState("Colombo");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      // Connect to API Gateway WebSocket endpoint
      console.log("Connecting to API Gateway at ws://localhost:9001/api");
      const ws = new WebSocket("ws://localhost:9001/api");

      ws.onopen = () => {
        console.log("Connected to API Gateway");
        // Send fetch weather command
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

          // Check for null response
          if (!response) {
            console.warn("Received null response from server, ignoring");
            return;
          }

          console.log("Response type:", response.type);
          console.log("Response status:", response.status);
          console.log("Response temperature:", response.temperature);
          console.log("Response condition:", response.condition);

          // Handle API Gateway weather response format
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
            // Ignore status updates, just log them
            console.log("Received service status update:", response);
          } else {
            console.warn(
              "Unexpected response format. Expected type='WEATHER_RESPONSE' or 'ERROR', got:",
              response.type
            );
            console.warn("Full response:", JSON.stringify(response, null, 2));
            setError("Unexpected response format from API Gateway");
            ws.close();
            setLoading(false);
          }
        } catch (err) {
          // Log the parse error for debugging and satisfy lint rules
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

      // Timeout after 10 seconds
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
    <div className="bg-white border-t border-gray-200 p-6">
      <div className="max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">
            Weather Information
          </h3>
        </div>

        {/* Input Section */}
        <div className="space-y-3 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter city name..."
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleFetchWeather}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? "Fetching..." : "Fetch"}
            </button>
          </div>

          {/* Info Text */}
          <p className="text-xs text-gray-600">
            This component uses the API Gateway Service (HttpURLConnection) to
            fetch real-time weather data from an external API.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">❌ {error}</p>
          </div>
        )}

        {/* Weather Data Display */}
        {weatherData && (
          <div className="space-y-3 bg-linear-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white px-3 py-2 rounded">
                <p className="text-xs text-gray-600 font-medium">Temperature</p>
                <p className="text-2xl font-bold text-blue-600">
                  {weatherData.temperature}°C
                </p>
              </div>
              <div className="bg-white px-3 py-2 rounded">
                <p className="text-xs text-gray-600 font-medium">Condition</p>
                <p className="text-lg font-semibold text-gray-800">
                  {weatherData.condition}
                </p>
              </div>
              {weatherData.humidity !== undefined && (
                <div className="bg-white px-3 py-2 rounded">
                  <p className="text-xs text-gray-600 font-medium">Humidity</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {weatherData.humidity}%
                  </p>
                </div>
              )}
              {weatherData.windSpeed !== undefined && (
                <div className="bg-white px-3 py-2 rounded">
                  <p className="text-xs text-gray-600 font-medium">
                    Wind Speed
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    {weatherData.windSpeed} km/h
                  </p>
                </div>
              )}
            </div>

            {/* Fetch Info */}
            <div className="text-xs text-gray-600 bg-white px-3 py-2 rounded">
              <p>
                <span className="font-medium">Data Source:</span> API Gateway
                Service (via HttpURLConnection)
              </p>
              <p>
                <span className="font-medium">City:</span> {city}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <div className="flex justify-center mb-2">
              <Loader className="w-5 h-5 animate-spin text-blue-500" />
            </div>
            <p className="text-sm text-blue-800">
              Fetching weather data from external API...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!weatherData && !loading && !error && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <Cloud className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              Enter a city name and click "Fetch" to get weather data
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
