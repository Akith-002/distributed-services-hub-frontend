import React from "react";
import { Server, Circle, AlertCircle } from "lucide-react";

export default function ServiceRegistry({
  services,
  selectedService,
  onSelectService,
  isConnected,
}) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "online":
        return "bg-green-100 text-green-800";
      case "offline":
        return "bg-red-100 text-red-800";
      case "timeout":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIndicator = (status) => {
    switch (status?.toLowerCase()) {
      case "online":
        return <Circle className="w-3 h-3 fill-green-500 text-green-500" />;
      case "offline":
        return <Circle className="w-3 h-3 fill-red-500 text-red-500" />;
      case "timeout":
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      default:
        return <Circle className="w-3 h-3 fill-gray-400 text-gray-400" />;
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
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 bg-linear-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2 mb-2">
          <Server className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-800">Service Registry</h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Circle
            className={`w-2 h-2 ${
              isConnected ? "fill-green-500" : "fill-red-500"
            }`}
          />
          <span className="text-gray-600">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Service Count */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
        <p className="text-xs text-gray-600">
          {services.length} {services.length === 1 ? "service" : "services"}{" "}
          registered
        </p>
      </div>

      {/* Services List */}
      <div className="flex-1 overflow-y-auto">
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <Server className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm text-center">No services registered</p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Services will appear here once they connect to the Hub
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {services.map((service) => (
              <button
                key={service.name}
                onClick={() => onSelectService(service)}
                className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                  selectedService?.name === service.name
                    ? "bg-blue-50 border-l-4 border-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                {/* Service Name Row */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {getStatusIndicator(service.status)}
                    <span className="font-semibold text-gray-800 truncate text-sm">
                      {service.name}
                    </span>
                  </div>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(
                      service.status
                    )}`}
                  >
                    {service.status || "unknown"}
                  </span>
                </div>

                {/* Service Details Row */}
                <div className="ml-5 text-xs text-gray-600 space-y-0.5">
                  <div>
                    <span className="font-medium">Port:</span> {service.port}
                  </div>
                  <div>
                    <span className="font-medium">Heartbeat:</span>{" "}
                    {formatTime(service.lastHeartbeat)}
                  </div>
                </div>

                {/* Metadata if available */}
                {service.metadata && (
                  <div className="ml-5 text-xs text-gray-500 mt-1 space-y-0.5">
                    {service.metadata.type && (
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        {service.metadata.type}
                      </div>
                    )}
                    {service.metadata.cpuLoad !== undefined && (
                      <div>
                        <span className="font-medium">CPU:</span>{" "}
                        {service.metadata.cpuLoad}%
                      </div>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        <p>Click on a service to view details</p>
      </div>
    </div>
  );
}
