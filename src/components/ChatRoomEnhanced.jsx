import React, { useEffect, useRef, useState } from "react";
import "./ChatRoom.css";

/**
 * Enhanced ChatRoom component with SSL/TLS support and additional features
 * - Configurable WebSocket URL (ws:// or wss://)
 * - Message timestamps
 * - Typing indicators
 * - File upload support
 * - Error handling
 * - Message history
 * 
 * @author Member 3 - Full Stack Development
 * @version 2.0
 */
export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [text, setText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [error, setError] = useState(null);
  const [useSSL, setUseSSL] = useState(true); // Member 3: SSL/TLS enabled by default (Javalin 5.x + Jetty SSL connector)
  
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnect = useRef(false);
  const typingTimeoutRef = useRef(null);
  const maxReconnectAttempts = 6;

  // Determine WebSocket URL based on SSL setting
  const getWebSocketUrl = () => {
    const protocol = useSSL ? "wss" : "ws";
    const port = useSSL ? "7443" : "7070";
    return `${protocol}://localhost:${port}/chat`;
  };

  const connectWebSocket = (name) => {
    // Close previous connection if present
    if (ws.current) {
      try {
        ws.current.close();
      } catch (e) {
        console.warn("Error closing existing websocket:", e);
      }
      ws.current = null;
    }

    const wsUrl = getWebSocketUrl();
    console.log(`🔗 Connecting to ${wsUrl}...`);

    try {
      ws.current = new WebSocket(wsUrl);
    } catch (err) {
      setError(`Failed to connect: ${err.message}`);
      return;
    }

    ws.current.onopen = () => {
      console.log("✅ Connected to WebSocket");
      reconnectAttemptsRef.current = 0;
      setIsConnected(true);
      setError(null);
      shouldReconnect.current = true;
      
      // Send JOIN immediately
      try {
        ws.current.send(
          JSON.stringify({
            type: "JOIN",
            payload: { username: name },
          })
        );
      } catch (err) {
        console.error("Failed to send JOIN:", err);
        setError("Failed to join chat");
      }
    };

    ws.current.onmessage = (event) => {
      let msg = null;
      try {
        msg = JSON.parse(event.data);
      } catch (err) {
        console.error("Invalid JSON from server:", event.data, err);
        return;
      }

      // Handle different message types
      switch (msg.type) {
        case "USER_LIST_UPDATE":
          setUsers(Array.isArray(msg.payload?.users) ? msg.payload.users : []);
          break;
        
        case "TYPING":
          handleTypingIndicator(msg.payload?.username, true);
          break;
        
        case "STOP_TYPING":
          handleTypingIndicator(msg.payload?.username, false);
          break;
        
        case "ERROR":
          setError(msg.payload?.text || "An error occurred");
          break;
        
        default:
          // Add message to chat (MESSAGE, SYSTEM, etc.)
          setMessages((prev) => [...prev, msg]);
          break;
      }
    };

    ws.current.onclose = (ev) => {
      console.log("❌ Disconnected from WebSocket", ev.code, ev.reason);
      setIsConnected(false);
      
      // Attempt reconnect with exponential backoff if desired
      if (shouldReconnect.current) {
        const attempt = reconnectAttemptsRef.current + 1;
        reconnectAttemptsRef.current = attempt;
        if (attempt <= maxReconnectAttempts) {
          const backoff = Math.min(30000, 1000 * 2 ** (attempt - 1));
          console.log(`Reconnecting attempt ${attempt} in ${backoff}ms`);
          setTimeout(() => connectWebSocket(name), backoff);
        } else {
          setError("Max reconnect attempts reached. Please refresh the page.");
        }
      }
    };

    ws.current.onerror = (err) => {
      console.error("⚠️ WebSocket error:", err);
      setError("WebSocket connection error");
    };
  };

  const handleTypingIndicator = (user, isTyping) => {
    if (user === username) return; // Don't show own typing indicator
    
    setTypingUsers((prev) => {
      if (isTyping) {
        return prev.includes(user) ? prev : [...prev, user];
      } else {
        return prev.filter((u) => u !== user);
      }
    });
  };

  const handleJoin = () => {
    if (!username.trim()) {
      alert("Please enter a username!");
      return;
    }
    reconnectAttemptsRef.current = 0;
    shouldReconnect.current = true;
    setError(null);
    connectWebSocket(username);
  };

  const sendMessage = () => {
    if (!text.trim()) return;
    
    const out = JSON.stringify({ type: "MESSAGE", payload: { text } });
    try {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(out);
        setText("");
        sendStopTyping();
      } else {
        setError("Not connected. Message not sent.");
      }
    } catch (err) {
      console.error("Failed to send message", err);
      setError("Failed to send message");
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    
    // Send typing indicator
    if (e.target.value && ws.current && ws.current.readyState === WebSocket.OPEN) {
      sendTyping();
    }
  };

  const sendTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    try {
      ws.current.send(JSON.stringify({ type: "TYPING", payload: {} }));
    } catch (err) {
      console.error("Failed to send typing indicator", err);
    }
    
    // Auto stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTyping();
    }, 3000);
  };

  const sendStopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    try {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "STOP_TYPING", payload: {} }));
      }
    } catch (err) {
      console.error("Failed to send stop typing indicator", err);
    }
  };

  const handleDisconnect = () => {
    shouldReconnect.current = false;
    if (ws.current) {
      try {
        ws.current.close();
      } catch (e) {
        console.warn(e);
      }
      ws.current = null;
    }
    setIsConnected(false);
    setMessages([]);
    setUsers([]);
    setTypingUsers([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Cleanup connection when leaving the page
  useEffect(() => {
    return () => {
      if (ws.current) ws.current.close();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Autoscroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Login Screen
  if (!isConnected) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>💬 Secure WebSocket Chat</h2>
          <p className="subtitle">Enter your username to join</p>
          
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleJoin()}
            className="login-input"
            autoFocus
          />
          
          <div className="ssl-toggle">
            <label>
              <input
                type="checkbox"
                checked={useSSL}
                onChange={(e) => setUseSSL(e.target.checked)}
              />
              <span className="ssl-label">
                {useSSL ? "🔒 SSL/TLS Enabled (wss://)" : "⚠️ SSL/TLS Disabled (ws://)"}
              </span>
            </label>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button onClick={handleJoin} className="join-button">
            Join Chat
          </button>
          
          <div className="info-text">
            {useSSL ? (
              <>
                <p>🔐 Connecting via secure WebSocket (WSS)</p>
                <p>Port: 7443</p>
              </>
            ) : (
              <>
                <p>⚠️ Connecting via unsecured WebSocket (WS)</p>
                <p>Port: 7070</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Chat Room
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Secure WebSocket Chat</h2>
        <div className="header-info">
          <span className="username-badge">👤 {username}</span>
          <span className="ssl-badge">
            {useSSL ? "🔒 SSL/TLS" : "⚠️ No SSL"}
          </span>
          <button onClick={handleDisconnect} className="disconnect-button">
            Disconnect
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="chat-main">
        {/* Users Panel */}
        <div className="users-panel">
          <h4>Online Users ({users.length})</h4>
          <div className="users-list">
            {users.length === 0 ? (
              <div className="no-users">No users online</div>
            ) : (
              users.map((u) => (
                <div key={u} className={`user-item ${u === username ? "current-user" : ""}`}>
                  <span className="user-status">🟢</span>
                  {u}
                  {u === username && <span className="you-badge">(you)</span>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Panel */}
        <div className="messages-panel">
          <div className="messages-container">
            {messages.map((msg, i) => {
              const isOwnMessage = msg.payload?.username === username;
              const isSystem = msg.type === "SYSTEM";

              return (
                <div
                  key={i}
                  className={`message-wrapper ${
                    isSystem ? "system" : isOwnMessage ? "own" : "other"
                  }`}
                >
                  <div className="message-bubble">
                    {!isSystem && !isOwnMessage && (
                      <div className="message-sender">{msg.payload?.username}</div>
                    )}
                    <div className="message-text">{msg.payload?.text}</div>
                    {msg.timestamp && (
                      <div className="message-time">{msg.timestamp}</div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                <span className="typing-text">
                  {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing
                </span>
                <span className="typing-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="message-input-container">
            <input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={handleTextChange}
              onKeyPress={handleKeyPress}
              onBlur={sendStopTyping}
              className="message-input"
            />
            <button onClick={sendMessage} className="send-button" disabled={!text.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
