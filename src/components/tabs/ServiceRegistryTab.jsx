import React, { useState } from "react";
import {
  Server,
  Circle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Cpu,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function ServiceRegistryTab({
  services,
  selectedService,
  onSelectService,
  isConnected,
}) {
  const [expandedService, setExpandedService] = useState(null);

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
    <div className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-4 border-b border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              Service Registry
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Member 1 - Multithreading & Concurrency (ConcurrentHashMap)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{services.length}</p>
              <p className="text-xs text-slate-400">
                {services.length === 1 ? "Service" : "Services"}
              </p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2 bg-slate-600/50 px-3 py-2 rounded-lg border border-slate-500 mt-3 w-fit">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span
            className={`text-xs font-semibold ${
              isConnected ? "text-green-300" : "text-red-300"
            }`}
          >
            {isConnected ? "✓ Live Connection" : "✗ Disconnected"}
          </span>
        </div>
      </div>

      {/* Services List */}
      <div className="p-6">
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-600 rounded-2xl flex items-center justify-center mb-4">
              <Server className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-100 mb-1">
              No Services Yet
            </h3>
            <p className="text-sm text-slate-400 max-w-xs">
              Services will appear here once they connect to the Hub Server on
              port 7070
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.name}
                className={`rounded-lg overflow-hidden transition-all duration-200 border-2 ${
                  expandedService === service.name
                    ? "bg-slate-600/50 border-blue-400 shadow-lg"
                    : "bg-slate-600/30 border-slate-600 hover:border-slate-500 hover:bg-slate-600/40"
                }`}
              >
                {/* Service Header */}
                <button
                  onClick={() =>
                    setExpandedService(
                      expandedService === service.name ? null : service.name
                    )
                  }
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-600/30 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIndicator(service.status)}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white text-left truncate">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {service.host}:{service.port}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-3">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap border ${getStatusColor(
                        service.status
                      )}`}
                    >
                      {service.status?.toUpperCase() || "UNKNOWN"}
                    </span>
                    {expandedService === service.name ? (
                      <ChevronUp className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedService === service.name && (
                  <div className="px-4 py-4 bg-slate-700/30 border-t border-slate-500 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Host:Port */}
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Host:Port</p>
                        <p className="text-sm font-mono text-blue-300">
                          {service.host}:{service.port}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Status</p>
                        <p className="text-sm font-semibold">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(
                              service.status
                            )}`}
                          >
                            {service.status?.toUpperCase() || "UNKNOWN"}
                          </span>
                        </p>
                      </div>

                      {/* Last Heartbeat */}
                      <div>
                        <p className="text-xs text-slate-400 mb-1">
                          Last Heartbeat
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <p className="text-sm text-slate-200">
                            {formatTime(service.lastHeartbeat)}
                          </p>
                        </div>
                      </div>

                      {/* Uptime/Registration Time */}
                      <div>
                        <p className="text-xs text-slate-400 mb-1">
                          Registered
                        </p>
                        <p className="text-sm text-slate-200">
                          {new Date(
                            service.registrationTime
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Metadata */}
                    {service.metadata && (
                      <div className="pt-3 border-t border-slate-500">
                        <p className="text-xs text-slate-400 mb-2 font-semibold">
                          Metadata
                        </p>
                        <div className="space-y-1.5 text-sm">
                          {service.metadata.type && (
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                              <span className="text-slate-300">
                                Type:{" "}
                                <span className="text-blue-300">
                                  {service.metadata.type}
                                </span>
                              </span>
                            </div>
                          )}
                          {service.metadata.version && (
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                              <span className="text-slate-300">
                                Version:{" "}
                                <span className="text-green-300">
                                  {service.metadata.version}
                                </span>
                              </span>
                            </div>
                          )}
                          {service.metadata.cpuLoad !== undefined && (
                            <div className="flex items-center gap-2">
                              <Cpu className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-300">
                                CPU Load:{" "}
                                <span className="text-orange-300 font-semibold">
                                  {service.metadata.cpuLoad}%
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Info */}
                    <div className="pt-3 border-t border-slate-500">
                      <p className="text-xs text-slate-400">
                        ℹ️ This service is running and responding to the Hub
                        heartbeat monitor (5 second intervals, 30 second
                        timeout)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-700/30 border-t border-slate-600 px-6 py-3">
        <p className="text-xs text-slate-400">
          💡 <strong>Tip:</strong> Services register via TCP on port 7070, send
          heartbeats every 10 seconds, and are removed if timeout exceeds 30
          seconds.
        </p>
      </div>
    </div>
  );
}
