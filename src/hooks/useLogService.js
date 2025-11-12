import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Custom hook to connect to the NIO Log Service WebSocket
 * Endpoint: ws://localhost:9092/logs
 */
export const useLogService = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    // Clear any existing connection
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        console.warn('[LogService] Error closing existing connection:', e);
      }
    }

    try {
      console.log('[LogService] Connecting to ws://localhost:9092/logs...');
      const websocket = new WebSocket('ws://localhost:9092/logs');

      websocket.onopen = () => {
        console.log('[LogService] Connected');
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Request log history
        try {
          websocket.send(JSON.stringify({ type: 'FETCH_LOGS' }));
        } catch (err) {
          console.error('[LogService] Failed to request logs:', err);
        }
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'LOG_MESSAGE':
              // New log message
              setLogs((prevLogs) => {
                const newLogs = [...prevLogs, data.log];
                // Keep only last 1000 logs in browser to prevent memory issues
                if (newLogs.length > 1000) {
                  return newLogs.slice(-1000);
                }
                return newLogs;
              });
              break;

            case 'LOG_HISTORY':
              // Initial log history
              console.log(
                `[LogService] Received ${data.count} historical logs`
              );
              setLogs(data.logs || []);
              break;

            case 'LOG_STATS':
              // Statistics update
              setStats(data.stats);
              break;

            case 'CLEAR_LOGS':
              // Logs cleared
              setLogs([]);
              break;

            default:
              console.log('[LogService] Unknown message type:', data.type);
          }
        } catch (err) {
          console.error('[LogService] Error parsing message:', err);
        }
      };

      websocket.onerror = (err) => {
        console.error('[LogService] WebSocket error:', err);
        setError('Connection error');
      };

      websocket.onclose = (event) => {
        console.log('[LogService] Disconnected', event.code, event.reason);
        setConnected(false);

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const attempt = reconnectAttemptsRef.current + 1;
          const backoff = Math.min(10000, 1000 * Math.pow(2, attempt - 1));

          console.log(
            `[LogService] Reconnecting in ${backoff}ms (attempt ${attempt}/${maxReconnectAttempts})`
          );
          setError(`Reconnecting... (${attempt}/${maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current = attempt;
            connect();
          }, backoff);
        } else {
          setError(
            "Failed to connect to Log Service. Please check if it's running on port 9092."
          );
        }
      };

      wsRef.current = websocket;
    } catch (err) {
      console.error('[LogService] Connection error:', err);
      setError('Failed to create WebSocket connection');
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    // Initial connection
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          console.warn('[LogService] Error during cleanup:', e);
        }
      }
    };
  }, [connect]);

  const clearLogs = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'CLEAR_LOGS' }));
      } catch (err) {
        console.error('[LogService] Failed to clear logs:', err);
      }
    }
  }, []);

  const fetchLogs = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'FETCH_LOGS' }));
      } catch (err) {
        console.error('[LogService] Failed to fetch logs:', err);
      }
    }
  }, []);

  return {
    logs,
    stats,
    connected,
    error,
    clearLogs,
    fetchLogs,
  };
};
