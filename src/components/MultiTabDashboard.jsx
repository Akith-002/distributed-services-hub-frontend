import { useEffect, useRef, useState } from "react";
import {
  Server,
  Cloud,
  Shield,
  ActivitySquare,
  Zap,
  AlertTriangle,
  WifiOff,
} from "lucide-react";
import ServiceRegistryTab from "./tabs/ServiceRegistryTab";
import ApiGatewayTab from "./tabs/ApiGatewayTab";
import SecurityTestTab from "./tabs/SecurityTestTab";
import NioLogStreamTab from "./tabs/NioLogStreamTab";
import RmiTaskRunnerTab from "./tabs/RmiTaskRunnerTab";

export default function MultiTabDashboard() {
  const [activeTab, setActiveTab] = useState("registry");
  const [services, setServices] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("Dashboard-User");
  const [useSSL, setUseSSL] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

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
          if (msg.payload && msg.payload.services) {
            setServices(msg.payload.services);
          }
          break;

        case "SERVICE_RESULT":
          // Broadcast service results to all interested tabs
          // They will handle filtering by result_from
          window.dispatchEvent(
            new CustomEvent("service-result", { detail: msg })
          );
          break;

        case "PONG":
          // Heartbeat response from server
          break;

        default:
          console.log("Unknown message type:", msg.type);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection error");
    };

    ws.current.onclose = () => {
      console.log("Disconnected from Hub Server");
      setIsConnected(false);
      clearInterval(heartbeatIntervalRef.current);

      if (
        shouldReconnectRef.current &&
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        reconnectAttemptsRef.current++;
        console.log(
          `Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
        );
        setTimeout(() => connectWebSocket(name), 3000);
      }
    };
  };

  useEffect(() => {
    connectWebSocket(username);

    return () => {
      shouldReconnectRef.current = false;
      clearInterval(heartbeatIntervalRef.current);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [useSSL]);

  const sendCommand = (commandFor, payload) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const command = {
        command_for: commandFor,
        payload: payload,
      };
      console.log("Sending command:", command);
      ws.current.send(JSON.stringify(command));
    } else {
      setError("Not connected to Hub Server");
    }
  };

  const tabs = [
    {
      id: "registry",
      label: "Service Registry",
      icon: Server,
      component: ServiceRegistryTab,
      description: "Member 1 - Multithreading & Concurrency",
    },
    {
      id: "api-gateway",
      label: "API Gateway",
      icon: Cloud,
      component: ApiGatewayTab,
      description: "Member 2 - HttpURLConnection",
    },
    {
      id: "security",
      label: "Security Test",
      icon: Shield,
      component: SecurityTestTab,
      description: "Member 3 - JSSE & SSLServerSocket",
    },
    {
      id: "nio-logs",
      label: "NIO Log Stream",
      icon: ActivitySquare,
      component: NioLogStreamTab,
      description: "Member 4 - Java NIO & Selector",
    },
    {
      id: "rmi-tasks",
      label: "RMI Task Runner",
      icon: Zap,
      component: RmiTaskRunnerTab,
      description: "Member 5 - Java RMI",
    },
  ];

  const activeTabObj = tabs.find((tab) => tab.id === activeTab);
  const ActiveComponent = activeTabObj?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Server className="w-6 h-6 text-white" />
                </div>
                Distributed Services Hub
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                All Services Operational - Phases 1-6 Complete ✓
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-green-300">
                    5 Services Active
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm font-medium text-slate-300">
                  {isConnected ? "Hub Connected" : "Hub Disconnected"}
                </span>
              </div>
              {!isConnected && <WifiOff className="w-5 h-5 text-red-400" />}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-950 border border-red-700 rounded-lg p-3 flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-100">{error}</p>
                <p className="text-xs text-red-300 mt-1">
                  Make sure the Hub Server is running on port 7071
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-400 bg-slate-700/50"
                      : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/30"
                  }`}
                  title={tab.description}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ActiveComponent ? (
          <ActiveComponent
            services={services}
            isConnected={isConnected}
            onSendCommand={sendCommand}
            selectedService={selectedService}
            onSelectService={setSelectedService}
            ws={ws.current}
          />
        ) : (
          <div className="text-center text-slate-400 py-12">
            Loading tab content...
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">Hub Server</div>
              <div className="text-sm font-semibold text-green-300">✓ Phase 1</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">API Gateway</div>
              <div className="text-sm font-semibold text-cyan-300">✓ Phase 3</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">Secure File</div>
              <div className="text-sm font-semibold text-amber-300">✓ Phase 4</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">NIO Logger</div>
              <div className="text-sm font-semibold text-purple-300">✓ Phase 5</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">RMI Tasks</div>
              <div className="text-sm font-semibold text-yellow-300">✓ Phase 6</div>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              All Services Operational - Phases 1-6 Complete -{" "}
              <span className={isConnected ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                {isConnected ? "✓ Hub Connected" : "✗ Hub Disconnected"}
              </span>
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Network Programming L3S1 • Microservices Architecture • November 2025
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
