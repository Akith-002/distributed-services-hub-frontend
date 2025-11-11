import React from "react";
import { Server, MessageSquare, Shield, Wifi, WifiOff } from "lucide-react";

export default function Login({
  username,
  setUsername,
  useSSL,
  setUseSSL,
  error,
  onJoin,
  isDashboard = false,
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
                {isDashboard ? (
                  <Server className="w-8 h-8 text-white" />
                ) : (
                  <MessageSquare className="w-8 h-8 text-white" />
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {isDashboard ? "Service Hub" : "FIT Chat"}
              </h1>
              <p className="text-blue-100 text-sm md:text-base">
                {isDashboard
                  ? "Real-time Service Monitoring"
                  : "Connect and communicate instantly"}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {isDashboard ? "Dashboard Name" : "Username"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={
                    isDashboard
                      ? "e.g., Monitor Station 1"
                      : "Enter your username"
                  }
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && onJoin()}
                  className="w-full px-4 py-3 pl-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200 text-gray-800 placeholder:text-gray-400"
                  autoFocus
                />
              </div>
            </div>

            {/* SSL Toggle (only for chat) */}
            {!isDashboard && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                      {useSSL ? (
                        <Shield className="w-5 h-5 text-green-600" />
                      ) : (
                        <Wifi className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {useSSL ? "Secure Connection" : "Standard Connection"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {useSSL ? "SSL/TLS Enabled" : "Unencrypted"}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={useSSL}
                      onChange={(e) => setUseSSL(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-green-400 peer-checked:to-green-600 transition-all duration-300 shadow-inner"></div>
                    <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-7 shadow-md"></div>
                  </div>
                </label>
              </div>
            )}

            {/* Info Box for Dashboard */}
            {isDashboard && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Server className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Hub Server Connection
                    </p>
                    <p className="text-xs text-blue-700 break-words">
                      ws://localhost:7071/registry
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-shake">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  <p className="text-sm text-red-800 flex-1">{error}</p>
                </div>
              </div>
            )}

            {/* Join Button */}
            <button
              onClick={onJoin}
              disabled={!username.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isDashboard ? (
                <>
                  <Server className="w-5 h-5" />
                  Connect to Hub
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5" />
                  Join Chat Room
                </>
              )}
            </button>
          </div>

          {/* Footer Info */}
          <div className="bg-gray-50 px-6 md:px-8 py-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-600">
              {isDashboard ? (
                <>
                  <Server className="w-4 h-4" />
                  <span>Port: {useSSL ? "7443" : "7071"}</span>
                </>
              ) : (
                <>
                  {useSSL ? (
                    <>
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Secure • Port 7443</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-gray-400" />
                      <span>Standard • Port 7071</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info Card (optional) */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isDashboard
              ? "Monitor services in real-time"
              : "Powered by WebSocket technology"}
          </p>
        </div>
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
        .delay-700 {
          animation-delay: 700ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}
