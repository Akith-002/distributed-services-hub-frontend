import { useEffect, useRef, useState } from "react";
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
    // Hub uses TCP registry on 7070 and HTTP/WebSocket on 7071
    // WebSocket endpoint is at /registry
    const port = useSSL ? "7443" : "7071";
    return `${protocol}://localhost:${port}/registry`;
  };

  const connectWebSocket = (name) => {
    // Close previous connection if present
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

      // Start heartbeat to keep connection alive
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          try {
            ws.current.send(JSON.stringify({ type: "PING" }));
          } catch (err) {
            console.warn("Failed to send heartbeat:", err);
          }
        }
      }, 25000); // Send ping every 25 seconds

      // Send initial connection message
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
            // If a service is selected, update it with new data
            if (selectedService) {
              const updatedService = msg.payload.services.find(
                (s) => s.name === selectedService.name
              );
              if (updatedService) {
                setSelectedService(updatedService);
              } else {
                // Selected service was deregistered
                setSelectedService(null);
              }
            }
          }
          break;

        case "SERVICE_ONLINE":
          console.log("Service online:", msg.payload?.name);
          // Service came online - will be in next update
          break;

        case "SERVICE_OFFLINE":
          console.log("Service offline:", msg.payload?.name);
          // Service went offline - will be in next update
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

      // Clear heartbeat interval
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
    // Placeholder for future actions
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
        // Services automatically refresh via WebSocket
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
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Distributed Services Hub</h1>
            <p className="text-blue-100 text-sm mt-1">
              Real-time Service Registry & Monitoring
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {username}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {useSSL ? "SSL" : "No SSL"}
            </span>
            <button
              onClick={handleDisconnect}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && !isConnected && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 px-6 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* Service Registry Sidebar */}
          <ServiceRegistry
            services={services}
            selectedService={selectedService}
            onSelectService={setSelectedService}
            isConnected={isConnected}
          />

          {/* Main Panel with Details and Actions */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Service Details */}
            <ServiceDetailsPanel
              service={selectedService}
              onAction={handleServiceAction}
            />

            {/* External Data Fetcher */}
            <ExternalDataFetcher />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-800 text-gray-200 px-6 py-3 text-xs flex items-center justify-between">
        <div>
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          {isConnected
            ? `Connected to Hub Server • ${services.length} services registered`
            : "Disconnected from Hub Server"}
        </div>
        <div className="text-gray-400">
          Phase 3: Service Registry Dashboard • Connecting to port{" "}
          {useSSL ? "7443" : "7071"}
        </div>
      </div>
    </div>
  );
}
