import React from "react";
import { Info, Activity, AlertCircle, CheckCircle } from "lucide-react";

export default function ServiceDetailsPanel({ service, onAction }) {
  if (!service) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">
            Select a service to view details
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Click on any service in the registry to see more information
          </p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "online":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "offline":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "timeout":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status) => {
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

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-500 to-indigo-600 text-white px-6 py-6 shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{service.name}</h2>
            <div className="flex items-center gap-2">
              {getStatusIcon(service.status)}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                  service.status
                )}`}
              >
                {service.status || "unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Connection Info */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Connection Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 px-4 py-3 rounded-lg">
              <p className="text-xs text-gray-600 font-medium">Host</p>
              <p className="text-lg font-mono text-gray-800 mt-1">
                {service.host}
              </p>
            </div>
            <div className="bg-gray-50 px-4 py-3 rounded-lg">
              <p className="text-xs text-gray-600 font-medium">Port</p>
              <p className="text-lg font-mono text-gray-800 mt-1">
                {service.port}
              </p>
            </div>
          </div>
        </section>

        {/* Heartbeat Info */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Heartbeat Information
          </h3>
          <div className="bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600 font-medium">Last Heartbeat</p>
            <p className="text-base text-gray-800 font-mono mt-1">
              {formatDate(service.lastHeartbeat)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Service is responding to heartbeat checks from the Hub
            </p>
          </div>
        </section>

        {/* Metadata */}
        {service.metadata && Object.keys(service.metadata).length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Service Metadata
            </h3>
            <div className="space-y-2">
              {Object.entries(service.metadata).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </span>
                  <span className="text-sm text-gray-600 font-mono">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Service Type Info */}
        {service.metadata?.type && (
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Service Type
            </h3>
            <div className="bg-linear-to-r from-indigo-50 to-blue-50 px-4 py-3 rounded-lg border border-indigo-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{service.metadata.type}</span>
              </p>
              <p className="text-xs text-gray-600 mt-2">
                This service handles {service.metadata.type.toLowerCase()}{" "}
                requests
              </p>
            </div>
          </section>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-2 flex-wrap">
        <button
          onClick={() => onAction("logs")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors"
        >
          View Logs
        </button>
        <button
          onClick={() => onAction("details")}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm font-medium transition-colors"
        >
          More Details
        </button>
        <button
          onClick={() => onAction("refresh")}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 text-sm font-medium transition-colors ml-auto"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
