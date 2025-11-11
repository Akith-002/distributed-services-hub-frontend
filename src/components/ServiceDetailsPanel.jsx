import React from "react";
import {
  Info,
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  FileText,
  MoreHorizontal,
  Server,
  Clock,
  Shield,
  Database,
} from "lucide-react";
import FileServiceInterface from "./FileServiceInterface";

export default function ServiceDetailsPanel({ service, onAction }) {
  if (!service) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Info className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            No Service Selected
          </h3>
          <p className="text-gray-600 mb-4">
            Select a service from the registry to view detailed information and
            perform actions
          </p>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <Server className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-700">
              Choose from the left sidebar
            </span>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "online":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "offline":
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case "timeout":
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      default:
        return <Activity className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "online":
        return "bg-green-100 text-green-800 border-green-300";
      case "offline":
        return "bg-red-100 text-red-800 border-red-300";
      case "timeout":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white relative z-20 min-h-0">
      {/* Service Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]"></div>
        <div className="relative px-4 md:px-6 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <Server className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-white truncate">
                    {service.name}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Service Details & Management
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {getStatusIcon(service.status)}
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 shadow-md ${getStatusBadgeColor(
                    service.status
                  )}`}
                >
                  {service.status?.toUpperCase() || "UNKNOWN"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
        {/* Connection Information Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Connection Information
            </h3>
          </div>
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    Host
                  </p>
                </div>
                <p className="text-xl font-mono font-bold text-gray-900 truncate">
                  {service.host}
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">
                    Port
                  </p>
                </div>
                <p className="text-xl font-mono font-bold text-gray-900">
                  {service.port}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Heartbeat Information Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600 animate-pulse" />
              Heartbeat Status
            </h3>
          </div>
          <div className="p-4 md:p-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-green-600" />
                <p className="text-sm font-semibold text-green-900 uppercase tracking-wide">
                  Last Heartbeat
                </p>
              </div>
              <p className="text-lg font-mono font-bold text-gray-900 mb-3">
                {formatDate(service.lastHeartbeat)}
              </p>
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span>Service responding to health checks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Card */}
        {service.metadata && Object.keys(service.metadata).length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600" />
                Service Metadata
              </h3>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(service.metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 truncate">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-base font-mono font-bold text-gray-900 truncate">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security Features for SecureFileService */}
        {service.name === "SecureFileService" && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Security Features
              </h3>
            </div>
            <div className="p-4 md:p-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-green-900">
                      SSL/TLS 1.2/1.3 Encryption
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-green-900">
                      RSA 2048-bit Certificate
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-green-900">
                      Secure File Storage & Transfer
                    </span>
                  </div>
                </div>
                <p className="text-xs text-green-800 bg-green-100 px-3 py-2 rounded-lg">
                  🔒 All file operations encrypted over SSL connections on port{" "}
                  {service.port}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* File Service Interface */}
        {service.name === "SecureFileService" && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="p-4 md:p-6">
              <FileServiceInterface service={service} />
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 px-4 md:px-6 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onAction("logs")}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <FileText className="w-4 h-4" />
            View Logs
          </button>
          <button
            onClick={() => onAction("details")}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <MoreHorizontal className="w-4 h-4" />
            More Details
          </button>
          <button
            onClick={() => onAction("refresh")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 ml-auto transform hover:scale-105 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
