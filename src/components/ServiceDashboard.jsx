import { useEffect, useRef, useState } from "react";
import {
  Server,
  Activity,
  AlertTriangle,
  LogOut,
  Shield,
  WifiOff,
} from "lucide-react";
import ServiceRegistry from "./ServiceRegistry";
import ServiceDetailsPanel from "./ServiceDetailsPanel";
import ExternalDataFetcher from "./ExternalDataFetcher";
import Login from "./Login";

export default function ServiceDashboard() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [useSSL, setUseSSL] = useState(false);

  const ws = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(false);
  const maxReconnectAttempts = 6;
  const heartbeatIntervalRef = useRef(null);

  const getWebSocketUrl = () => {
    const protocol = useSSL ? "wss" : "ws";
    const port = useSSL ? "7443" : "7071";
    return `${protocol}://localhost:${port}/registry`;
  };

  const connectWebSocket = (name) => {
    if (ws.current) {
      try {
        ws.current.close();
      } catch (e) {
        console.warn("Error closing existing websocket:", e);
      }
      ws.current = null;
    }

    const wsUrl = getWebSocketUrl();
    console.log(`Connecting to Hub Server at ${wsUrl}...`);

    try {
      ws.current = new WebSocket(wsUrl);
    } catch (err) {
      setError(`Failed to create WebSocket: ${err.message}`);
      console.error("WebSocket creation error:", err);
      return;
    }

    ws.current.onopen = () => {
      console.log("Connected to Hub Server");
      reconnectAttemptsRef.current = 0;
      setIsConnected(true);
      setError(null);
      shouldReconnectRef.current = true;

      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          try {
            ws.current.send(JSON.stringify({ type: "PING" }));
          } catch (err) {
            console.warn("Failed to send heartbeat:", err);
          }
        }
      }, 25000);

      try {
        ws.current.send(
          JSON.stringify({
            type: "DASHBOARD_CONNECT",
            payload: { username: name },
          })
        );
      } catch (err) {
        console.error("Failed to send connection message:", err);
        setError("Failed to connect to Hub");
      }
    };

    ws.current.onmessage = (event) => {
      let msg = null;
      try {
        msg = JSON.parse(event.data);
      } catch (err) {
        console.error("Invalid JSON from server:", event.data, err);
        return;
      }

      console.log(
        "Received message from Hub:",
        msg.type,
        msg.payload?.services?.length
      );

      switch (msg.type) {
        case "SERVICE_REGISTRY_UPDATE":
          if (Array.isArray(msg.payload?.services)) {
            setServices(msg.payload.services);
            if (selectedService) {
              const updatedService = msg.payload.services.find(
                (s) => s.name === selectedService.name
              );
              if (updatedService) {
                setSelectedService(updatedService);
              } else {
                setSelectedService(null);
              }
            }
          }
          break;

        case "SERVICE_ONLINE":
          console.log("Service online:", msg.payload?.name);
          break;

        case "SERVICE_OFFLINE":
          console.log("Service offline:", msg.payload?.name);
          break;

        case "ERROR":
          setError(msg.payload?.text || "An error occurred");
          break;

        default:
          console.log("Unknown message type:", msg.type);
          break;
      }
    };

    ws.current.onclose = (ev) => {
      console.log("Disconnected from Hub Server", ev.code, ev.reason);
      setIsConnected(false);

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      if (shouldReconnectRef.current) {
        const attempt = reconnectAttemptsRef.current + 1;
        reconnectAttemptsRef.current = attempt;
        if (attempt <= maxReconnectAttempts) {
          const backoff = Math.min(30000, 1000 * 2 ** (attempt - 1));
          console.log(
            `Attempting to reconnect (${attempt}/${maxReconnectAttempts}) in ${backoff}ms`
          );
          setError(
            `Reconnecting... (Attempt ${attempt}/${maxReconnectAttempts})`
          );
          setTimeout(() => connectWebSocket(name), backoff);
        } else {
          setError(
            "Max reconnection attempts reached. Please refresh the page to try again."
          );
        }
      }
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error:", err);
      setError(
        "WebSocket connection error. Please check if the Hub Server is running."
      );
    };
  };

  const handleJoin = () => {
    if (!username.trim()) {
      alert("Please enter a dashboard name!");
      return;
    }
    reconnectAttemptsRef.current = 0;
    shouldReconnectRef.current = true;
    setError(null);
    setServices([]);
    setSelectedService(null);
    connectWebSocket(username);
  };

  const handleDisconnect = () => {
    shouldReconnectRef.current = false;
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (ws.current) {
      try {
        ws.current.close();
      } catch (e) {
        console.warn(e);
      }
      ws.current = null;
    }
    setIsConnected(false);
    setServices([]);
    setSelectedService(null);
    setUsername("");
    setError(null);
  };

  const handleServiceAction = (action) => {
    console.log("Service action:", action, selectedService?.name);
    switch (action) {
      case "logs":
        alert(
          `Viewing logs for ${selectedService?.name}\n(Coming in Phase 4+)`
        );
        break;
      case "details":
        alert(
          `Detailed view for ${selectedService?.name}\n(Coming in Phase 4+)`
        );
        break;
      case "refresh":
        alert("Services will refresh when the Hub sends updates");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (ws.current) ws.current.close();
    };
  }, []);

  if (!isConnected) {
    return (
      <Login
        username={username}
        setUsername={setUsername}
        useSSL={useSSL}
        setUseSSL={setUseSSL}
        error={error}
        onJoin={handleJoin}
        isDashboard={true}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]"></div>
        <div className="relative px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Service Hub Dashboard
                </h1>
                <p className="text-blue-100 text-xs md:text-sm flex items-center gap-2 mt-0.5">
                  <Activity className="w-3 h-3" />
                  Real-time Monitoring & Registry
                </p>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium truncate max-w-[120px]">
                  {username}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                {useSSL ? (
                  <Shield className="w-3 h-3 text-green-300" />
                ) : (
                  <WifiOff className="w-3 h-3 text-blue-200" />
                )}
                <span className="text-white text-sm">
                  {useSSL ? "SSL" : "Standard"}
                </span>
              </div>

              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 active:bg-red-700 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && !isConnected && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b-2 border-red-300 px-4 md:px-6 py-3 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm font-medium text-red-800 flex-1">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        <div className="h-full flex flex-col lg:flex-row">
          {/* Service Registry Sidebar */}
          <ServiceRegistry
            services={services}
            selectedService={selectedService}
            onSelectService={setSelectedService}
            isConnected={isConnected}
          />

          {/* Main Panel */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Service Details */}
            <div className="flex-1 min-h-0">
              <ServiceDetailsPanel
                service={selectedService}
                onAction={handleServiceAction}
              />
            </div>

            {/* External Data Fetcher */}
            <ExternalDataFetcher />
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 px-4 md:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            ></div>
            <span className="text-gray-300 font-medium">
              {isConnected
                ? `Connected • ${services.length} service${
                    services.length !== 1 ? "s" : ""
                  } active`
                : "Disconnected from Hub Server"}
            </span>
          </div>
          <div className="text-gray-400 flex items-center gap-2">
            <Server className="w-3 h-3" />
            <span>Port: {useSSL ? "7443" : "7071"} • Phase 3</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
