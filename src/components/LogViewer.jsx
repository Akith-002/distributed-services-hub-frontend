import { useLogService } from '../hooks/useLogService';
import {
  Terminal,
  Trash2,
  RefreshCw,
  Activity,
  Database,
  Network,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function LogViewer() {
  const { logs, stats, connected, error, clearLogs, fetchLogs } =
    useLogService();
  const [filter, setFilter] = useState({ service: 'all', level: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Get unique services for filter
  const services = [...new Set(logs.map((log) => log.service))];

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    // Filter by service
    if (filter.service !== 'all' && log.service !== filter.service) {
      return false;
    }
    // Filter by level
    if (filter.level !== 'all' && log.level !== filter.level) {
      return false;
    }
    // Filter by search term
    if (
      searchTerm &&
      !log.message.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getLogLevelBadge = (level) => {
    const colors = {
      ERROR: 'bg-red-500',
      WARNING: 'bg-orange-500',
      INFO: 'bg-blue-500',
      DEBUG: 'bg-gray-500',
    };
    return colors[level] || 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white">NIO Log Service</h2>
            <div
              className={`ml-2 w-2 h-2 rounded-full ${
                connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}
            ></div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={!connected}
              className="p-1.5 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
              title="Refresh logs"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={clearLogs}
              disabled={!connected}
              className="p-1.5 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Connection Status */}
        {error && (
          <div className="mt-2 text-xs text-red-100 bg-red-500/20 px-2 py-1 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Stats Bar */}
      {stats && connected && (
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-gray-600">Messages:</span>
              <span className="font-semibold text-gray-800">
                {stats.messagesReceived || 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-green-500" />
              <span className="text-gray-600">Bytes:</span>
              <span className="font-semibold text-gray-800">
                {((stats.bytesReceived || 0) / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-gray-600">Connections:</span>
              <span className="font-semibold text-gray-800">
                {stats.activeConnections || 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-gray-600">Displayed:</span>
              <span className="font-semibold text-gray-800">
                {filteredLogs.length} / {logs.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white px-4 py-2 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-2">
          {/* Service Filter */}
          <select
            value={filter.service}
            onChange={(e) => setFilter({ ...filter, service: e.target.value })}
            className="text-xs px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Services</option>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={filter.level}
            onChange={(e) => setFilter({ ...filter, level: e.target.value })}
            className="text-xs px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="ERROR">Error</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
            <option value="DEBUG">Debug</option>
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent flex-1 min-w-[120px]"
          />

          {/* Auto-scroll toggle */}
          <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            Auto-scroll
          </label>
        </div>
      </div>

      {/* Log List */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto bg-gray-900 font-mono text-xs"
        style={{ minHeight: 0 }}
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Terminal className="w-12 h-12 mx-auto mb-2 text-gray-600" />
              <p>
                {connected
                  ? 'No logs yet. Waiting for messages...'
                  : 'Connecting to log service...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 px-2 py-1.5 hover:bg-gray-800 rounded transition-colors duration-100"
              >
                {/* Timestamp */}
                <span className="text-gray-500 shrink-0 w-20">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>

                {/* Level Badge */}
                <span
                  className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold ${getLogLevelBadge(
                    log.level
                  )} text-white`}
                >
                  {log.level}
                </span>

                {/* Service Name */}
                <span className="text-cyan-400 shrink-0 font-semibold min-w-[100px]">
                  [{log.service}]
                </span>

                {/* Message */}
                <span className="text-gray-300 flex-1 wrap-break-word">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 px-4 py-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            {connected ? '🟢 Connected to Log Service' : '🔴 Disconnected'}
          </span>
          <span className="text-gray-500">ws://localhost:9092/logs</span>
        </div>
      </div>
    </div>
  );
}
