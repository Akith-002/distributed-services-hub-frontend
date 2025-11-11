import React from "react";
import {
  Server,
  Circle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Cpu,
} from "lucide-react";

export default function ServiceRegistry({
  services,
  selectedService,
  onSelectService,
  isConnected,
}) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "online":
        return "bg-green-100 text-green-800 border-green-200";
      case "offline":
        return "bg-red-100 text-red-800 border-red-200";
      case "timeout":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIndicator = (status) => {
    switch (status?.toLowerCase()) {
      case "online":
        return (
          <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-500/20" />
        );
      case "offline":
        return <Circle className="w-4 h-4 text-red-500 fill-red-500/20" />;
      case "timeout":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400 fill-gray-400/20" />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffSeconds = Math.floor((now - date) / 1000);

      if (diffSeconds < 60) return `${diffSeconds}s ago`;
      if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
      return `${Math.floor(diffSeconds / 3600)}h ago`;
    } catch {
      return "N/A";
    }
  };

  return (
    <aside className="w-full lg:w-96 bg-white border-r border-gray-200 flex flex-col shadow-lg max-h-[40vh] lg:max-h-full">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 md:py-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Service Registry
              </h2>
              <p className="text-xs text-gray-600">Connected services</p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          ></div>
          <span
            className={`text-xs font-semibold ${
              isConnected ? "text-green-700" : "text-red-700"
            }`}
          >
            {isConnected ? "Live Connection" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Service Count Badge */}
      <div className="px-4 md:px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">
            {services.length} {services.length === 1 ? "Service" : "Services"}
          </p>
          {services.length > 0 && (
            <div className="flex gap-1">
              {services.filter((s) => s.status?.toLowerCase() === "online")
                .length > 0 && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md">
                  {
                    services.filter((s) => s.status?.toLowerCase() === "online")
                      .length
                  }{" "}
                  online
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Services List */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Server className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">
              No Services Yet
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Services will appear here once they connect to the Hub Server
            </p>
          </div>
        ) : (
          <div className="p-3 md:p-4 space-y-2">
            {services.map((service) => (
              <button
                key={service.name}
                onClick={() => onSelectService(service)}
                className={`w-full text-left transition-all duration-200 rounded-xl overflow-hidden ${
                  selectedService?.name === service.name
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-md transform scale-[1.02]"
                    : "bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="p-4">
                  {/* Service Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getStatusIndicator(service.status)}
                      <h3 className="font-bold text-gray-900 truncate text-sm">
                        {service.name}
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap border ${getStatusColor(
                        service.status
                      )}`}
                    >
                      {service.status?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </div>

                  {/* Service Details Grid */}
                  <div className="space-y-2 pl-6">
                    {/* Port */}
                    <div className="flex items-center gap-2">
                      <Server className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">Port:</span>
                      <span className="text-xs font-mono font-semibold text-gray-900">
                        {service.port}
                      </span>
                    </div>

                    {/* Heartbeat */}
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">Last seen:</span>
                      <span className="text-xs font-medium text-gray-900">
                        {formatTime(service.lastHeartbeat)}
                      </span>
                    </div>

                    {/* Metadata */}
                    {service.metadata && (
                      <div className="pt-2 border-t border-gray-200 space-y-1.5">
                        {service.metadata.type && (
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            <span className="text-xs text-gray-600">Type:</span>
                            <span className="text-xs font-medium text-blue-700">
                              {service.metadata.type}
                            </span>
                          </div>
                        )}
                        {service.metadata.cpuLoad !== undefined && (
                          <div className="flex items-center gap-2">
                            <Cpu className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600">CPU:</span>
                            <span className="text-xs font-semibold text-orange-600">
                              {service.metadata.cpuLoad}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedService?.name === service.name && (
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 md:px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <p className="text-xs text-gray-600 flex items-center gap-2">
          <Circle className="w-2 h-2 text-blue-500 fill-blue-500" />
          Click a service to view details
        </p>
      </div>
    </aside>
  );
}
