import React, { useEffect, useRef, useState } from "react";

export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [text, setText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);

  const connectWebSocket = (name) => {
    ws.current = new WebSocket("ws://localhost:7070/chat");

    ws.current.onopen = () => {
      console.log("✅ Connected to WebSocket");
      setIsConnected(true);
      ws.current.send(
        JSON.stringify({
          type: "JOIN",
          payload: { username: name },
        })
      );
    };

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("📩 Received:", msg);

      if (msg.type === "USER_LIST_UPDATE") {
        console.log("👥 Active users:", msg.payload?.users);
        return;
      }

      setMessages((prev) => [...prev, msg]);
    };

    ws.current.onclose = () => {
      console.log("❌ Disconnected from WebSocket");
      setIsConnected(false);
    };

    ws.current.onerror = (err) => {
      console.error("⚠️ WebSocket error:", err);
    };
  };

  const handleJoin = () => {
    if (!username.trim()) {
      alert("Please enter a username!");
      return;
    }
    connectWebSocket(username);
  };

  const sendMessage = () => {
    if (!text.trim()) return;
    ws.current.send(
      JSON.stringify({
        type: "MESSAGE",
        payload: { text },
      })
    );
    setText("");
  };

  // Cleanup connection when leaving the page
  useEffect(() => {
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  if (!isConnected) {
    return (
      <div style={{ padding: 20, fontFamily: "Arial" }}>
        <h2>💬 Welcome to WebSocket Chat</h2>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button onClick={handleJoin}>Join Chat</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>💬 WebSocket Chat Room</h2>
      <p>
        Connected as: <strong>{username}</strong>
      </p>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          height: 400,
          overflowY: "auto",
          marginBottom: 10,
          backgroundColor: "#181717ff",
        }}
      >
        {messages.map((msg, i) => {
          const isOwnMessage = msg.payload?.username === username;
          const isSystem = msg.type === "SYSTEM";

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isSystem
                  ? "center"
                  : isOwnMessage
                  ? "flex-end"
                  : "flex-start",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  backgroundColor: isSystem
                    ? "transparent"
                    : isOwnMessage
                    ? "#6dd41fff"
                    : "#181717ff",
                  border: isSystem ? "none" : "1px solid #ccc",
                  borderRadius: 10,
                  padding: "8px 12px",
                  textAlign: isSystem ? "center" : "left",
                  boxShadow: isSystem
                    ? "none"
                    : "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
              >
                {isSystem ? (
                  <i>{msg.payload?.text || msg.payload?.message}</i>
                ) : (
                  <>
                    {!isOwnMessage && (
                      <div
                        style={{
                          fontWeight: "bold",
                          color: "#007bff",
                          marginBottom: 4,
                        }}
                      >
                        {msg.payload?.username}
                      </div>
                    )}
                    <div>{msg.payload?.text}</div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex" }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            flex: 1,
            marginRight: 10,
            padding: 10,
            borderRadius: 5,
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 5,
            padding: "10px 20px",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
