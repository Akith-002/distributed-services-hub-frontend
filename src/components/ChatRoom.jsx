import React, { useEffect, useRef, useState } from "react";

export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("TestUser");
  const [text, setText] = useState("");
  const ws = useRef(null);

  useEffect(() => {
    // Connect to WebSocket server
    ws.current = new WebSocket("ws://localhost:7070/chat");

    ws.current.onopen = () => {
      console.log("✅ Connected to WebSocket");
      ws.current.send(
        JSON.stringify({
          type: "JOIN",
          payload: { username },
        })
      );
    };

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("📩 Received:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    ws.current.onclose = () => console.log("❌ Disconnected from WebSocket");
    ws.current.onerror = (err) => console.error("⚠️ WebSocket error:", err);

    return () => {
      ws.current.close();
    };
  }, []);

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

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>💬 WebSocket Chat</h2>
      <p>
        Connected as: <strong>{username}</strong>
      </p>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          height: 300,
          overflowY: "auto",
          marginBottom: 10,
        }}
      >
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.payload?.username ? (
              <b>{msg.payload.username}:</b>
            ) : (
              <i>{msg.type}</i>
            )}{" "}
            {msg.payload?.text || msg.payload?.message || ""}
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "80%", marginRight: 10 }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
