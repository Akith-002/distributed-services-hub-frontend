import React, { useState, useEffect, useRef } from "react";
import { ActivitySquare, Trash2, Download, AlertCircle, PlayCircle } from "lucide-react";

export default function NioLogStreamTab({ isConnected }) {
  const [logs, setLogs] = useState([]);
  const [sendingDemo, setSendingDemo] = useState(false);
  const logsEndRef = useRef(null);

  useEffect(() => {
    const handleServiceResult = (event) => {
      const msg = event.detail;
      if (msg.result_from === "NIO_SERVICE") {
        const logEntry = {
          id: Date.now() + Math.random(), // Ensure unique IDs
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

  const handleSendDemoLogs = () => {
    setSendingDemo(true);
    
    // Simulate receiving demo logs
    const demoLogs = [
      "API_GATEWAY: Weather API request initiated for Colombo",
      "API_GATEWAY: HttpURLConnection established to api.open-meteo.com",
      "API_GATEWAY: Response received - 200 OK (28.5°C, Partly Cloudy)",
      "SECURE_FILE_SERVICE: Client connected via SSL handshake (TLSv1.3)",
      "SECURE_FILE_SERVICE: File 'document.pdf' stored successfully (2.4 MB)",
      "SECURE_FILE_SERVICE: SSL session closed gracefully",
      "RMI_SERVICE: Task 'calculate-pi' invoked remotely",
      "RMI_SERVICE: Pi calculation completed - Result: 3.14159265359",
      "HUB_SERVER: Service 'API_GATEWAY' heartbeat received",
      "HUB_SERVER: Service 'JSSE_SERVICE' heartbeat received",
      "HUB_SERVER: Broadcasting service registry update to 3 dashboard clients",
      "NIO_LOG_SERVICE: New connection accepted (non-blocking I/O)",
      "NIO_LOG_SERVICE: ByteBuffer allocated - Ready to read log data",
      "NIO_LOG_SERVICE: Log written to file - logs/service-2025-11-12.log"
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < demoLogs.length) {
        const logEntry = {
          id: Date.now() + Math.random(),
          timestamp: new Date(),
          message: `LOG: ${demoLogs[index]}`,
        };
        setLogs((prev) => [...prev, logEntry]);
        index++;
      } else {
        clearInterval(interval);
        setSendingDemo(false);
      }
    }, 400); // Send one log every 400ms
  };

  return (
    <div className="space-y-4">
      {/* Info Banner - How to Generate Logs */}
      {logs.length === 0 && (
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-700/50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-200 mb-2">
                How to View Logs
              </h3>
              <p className="text-sm text-purple-100 mb-3">
                The log service is running on port 9091 and ready to receive log messages.
              </p>
              
              <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-700/30 mb-3">
                <p className="text-xs font-semibold text-purple-300 mb-2">
                  Quick Demo:
                </p>
                <p className="text-xs text-purple-200">
                  Click the <strong className="text-purple-300">"Demo Logs"</strong> button above to see sample log entries.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-700/30">
                <p className="text-xs font-semibold text-purple-300 mb-2">
                  Send Real Logs:
                </p>
                <code className="text-xs text-purple-200 font-mono block">
                  cd nio-log-service
                  <br />
                  .\test-log-client.ps1
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 px-6 py-4 border-b border-slate-600">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ActivitySquare className="w-5 h-5 text-purple-400" />
            NIO Log Stream
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Real-time logging service with non-blocking I/O
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
              onClick={handleSendDemoLogs}
              disabled={sendingDemo}
              className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                sendingDemo
                  ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              <PlayCircle className="w-3 h-3" />
              {sendingDemo ? "Sending..." : "Demo Logs"}
            </button>
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
              Waiting for log messages...
            </h3>
            <p className="text-slate-400 max-w-md mb-4">
              The NIO Log Service is <span className="text-green-400 font-semibold">running on port 9091</span> and 
              using Java NIO Selector for non-blocking I/O. Logs will stream here in real-time when clients 
              connect and send log messages.
            </p>
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 max-w-lg">
              <p className="text-xs text-slate-300 mb-2">
                <strong>To see logs in action:</strong>
              </p>
              <ol className="text-xs text-slate-400 text-left space-y-1">
                <li>1. Open a terminal in <code className="text-purple-300">nio-log-service</code> folder</li>
                <li>2. Run: <code className="text-purple-300">.\test-log-client.ps1</code></li>
                <li>3. Watch logs appear here in real-time! ✨</li>
              </ol>
            </div>
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
          About Non-Blocking I/O
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          This service uses Java NIO (New I/O) with ServerSocketChannel and Selector for high-performance non-blocking I/O. 
          A single thread with a Selector can manage thousands of concurrent connections by listening for I/O events 
          without blocking on any single operation.
          <br /><br />
          <strong>Implementation:</strong> Port 9091 • Non-blocking event loop • Efficient connection handling
        </p>
      </div>
    </div>
  );
}
