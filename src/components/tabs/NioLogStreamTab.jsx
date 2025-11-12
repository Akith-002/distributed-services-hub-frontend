import React, { useState, useEffect, useRef } from "react";
import { ActivitySquare, Trash2, Download, AlertCircle } from "lucide-react";

export default function NioLogStreamTab({ isConnected }) {
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    const handleServiceResult = (event) => {
      const msg = event.detail;
      if (msg.result_from === "NIO_SERVICE") {
        const logEntry = {
          id: Date.now(),
          timestamp: new Date(),
          message: msg.data,
        };
        setLogs((prev) => [...prev, logEntry]);
      }
    };

    window.addEventListener("service-result", handleServiceResult);
    return () =>
      window.removeEventListener("service-result", handleServiceResult);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleClearLogs = () => {
    if (confirm("Are you sure you want to clear all logs?")) {
      setLogs([]);
    }
  };

  const handleDownloadLogs = () => {
    const logContent = logs
      .map((log) => `[${log.timestamp.toLocaleTimeString()}] ${log.message}`)
      .join("\n");

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(logContent)
    );
    element.setAttribute("download", `logs-${Date.now()}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 px-6 py-4 border-b border-slate-600">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ActivitySquare className="w-5 h-5 text-purple-400" />
            NIO Log Stream
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Member 4 - Java NIO with Selector (Non-blocking I/O)
          </p>
        </div>

        {/* Controls */}
        <div className="px-6 py-4 bg-slate-700/30 border-b border-slate-600 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-slate-400">
            <span className="font-semibold text-slate-300">{logs.length}</span>{" "}
            log entries
            {!isConnected && (
              <span className="ml-3 text-red-400">⚠️ Not connected to Hub</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadLogs}
              disabled={logs.length === 0}
              className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                logs.length > 0
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-600 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Download className="w-3 h-3" />
              Download
            </button>
            <button
              onClick={handleClearLogs}
              disabled={logs.length === 0}
              className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                logs.length > 0
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-slate-600 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Logs Display */}
      <div className="bg-slate-800 border border-slate-600 rounded-lg overflow-hidden flex flex-col h-[600px]">
        {logs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">
              Waiting for logs
            </h3>
            <p className="text-slate-400 max-w-md">
              Logs from all services will appear here in real-time. The NIO Log
              Service uses Java NIO Selector for non-blocking I/O to handle
              multiple concurrent log streams.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto font-mono text-sm">
            <div className="p-4 space-y-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="text-slate-300 hover:bg-slate-700/30 p-2 rounded transition-colors"
                >
                  <span className="text-slate-500">
                    [{log.timestamp.toLocaleTimeString()}]
                  </span>{" "}
                  <span className="text-cyan-400">{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* How It Works */}
        <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <ActivitySquare className="w-4 h-4 text-purple-400" />
            How NIO Works
          </h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex gap-2">
              <span className="text-purple-400 flex-shrink-0">→</span>
              <span>
                <strong>ServerSocketChannel:</strong> Non-blocking TCP listener
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 flex-shrink-0">→</span>
              <span>
                <strong>Selector:</strong> Single thread manages all I/O events
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 flex-shrink-0">→</span>
              <span>
                <strong>SocketChannel:</strong> Non-blocking client connections
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 flex-shrink-0">→</span>
              <span>
                <strong>Scalability:</strong> Thousands of concurrent
                connections
              </span>
            </li>
          </ul>
        </div>

        {/* Features */}
        <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <span className="text-pink-400">✨</span>
            Log Stream Features
          </h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex gap-2">
              <span className="text-green-400 flex-shrink-0">✓</span>
              <span>Real-time log streaming from all services</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400 flex-shrink-0">✓</span>
              <span>Automatic scrolling to latest entries</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400 flex-shrink-0">✓</span>
              <span>Download logs as text file</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400 flex-shrink-0">✓</span>
              <span>Timestamps for each log entry</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-slate-700/30 rounded-lg border border-slate-600 p-4">
        <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          About Java NIO (Lesson 7)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Unlike traditional ServerSocket (blocking I/O), Java NIO uses
          ServerSocketChannel, SocketChannel, and Selector for high-performance
          non-blocking I/O. A single thread with a Selector can manage thousands
          of concurrent connections by listening for I/O events (accept, read,
          write) without blocking on any single operation. This is essential for
          scalable network services.
        </p>
      </div>
    </div>
  );
}
