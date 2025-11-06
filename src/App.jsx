import { useEffect, useRef, useState } from 'react';
import LoginScreen from './components/Login.jsx';
import MessagesPanel from './components/MessagesPanel.jsx';
import MessageInput from './components/MessageInput.jsx';
import UploadModal from './components/UploadModal.jsx';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [error, setError] = useState(null);
  const [useSSL, setUseSSL] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnect = useRef(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const maxReconnectAttempts = 6;

  const getWebSocketUrl = () => {
    const protocol = useSSL ? 'wss' : 'ws';
    const port = useSSL ? '7443' : '7070';
    return `${protocol}://localhost:${port}/chat`;
  };

  const connectWebSocket = (name) => {
    // Close previous connection if present
    if (ws.current) {
      try {
        ws.current.close();
      } catch (e) {
        console.warn('Error closing existing websocket:', e);
      }
      ws.current = null;
    }

    const wsUrl = getWebSocketUrl();
    console.log(`Connecting to ${wsUrl}...`);

    try {
      ws.current = new WebSocket(wsUrl);
    } catch (err) {
      setError(`Failed to connect: ${err.message}`);
      return;
    }

    ws.current.onopen = () => {
      console.log('Connected to WebSocket');
      reconnectAttemptsRef.current = 0;
      setIsConnected(true);
      setError(null);
      shouldReconnect.current = true;

      try {
        ws.current.send(
          JSON.stringify({
            type: 'JOIN',
            payload: { username: name },
          })
        );
      } catch (err) {
        console.error('Failed to send JOIN:', err);
        setError('Failed to join chat');
      }
    };

    ws.current.onmessage = (event) => {
      let msg = null;
      try {
        msg = JSON.parse(event.data);
      } catch (err) {
        console.error('Invalid JSON from server:', event.data, err);
        return;
      }

      switch (msg.type) {
        case 'USER_LIST_UPDATE':
          setUsers(Array.isArray(msg.payload?.users) ? msg.payload.users : []);
          break;

        case 'TYPING':
          handleTypingIndicator(msg.payload?.username, true);
          break;

        case 'STOP_TYPING':
          handleTypingIndicator(msg.payload?.username, false);
          break;

        case 'ERROR':
          setError(msg.payload?.text || 'An error occurred');
          break;

        default:
          setMessages((prev) => [...prev, msg]);
          break;
      }
    };

    ws.current.onclose = (ev) => {
      console.log('Disconnected from WebSocket', ev.code, ev.reason);
      setIsConnected(false);

      if (shouldReconnect.current) {
        const attempt = reconnectAttemptsRef.current + 1;
        reconnectAttemptsRef.current = attempt;
        if (attempt <= maxReconnectAttempts) {
          const backoff = Math.min(30000, 1000 * 2 ** (attempt - 1));
          console.log(`Reconnecting attempt ${attempt} in ${backoff}ms`);
          setTimeout(() => connectWebSocket(name), backoff);
        } else {
          setError('Max reconnect attempts reached. Please refresh the page.');
        }
      }
    };

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('WebSocket connection error');
    };
  };

  const handleTypingIndicator = (user, isTyping) => {
    if (user === username) return;

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
      alert('Please enter a username!');
      return;
    }
    reconnectAttemptsRef.current = 0;
    shouldReconnect.current = true;
    setError(null);
    connectWebSocket(username);
  };

  const sendMessage = () => {
    if (!text.trim()) return;

    const out = JSON.stringify({ type: 'MESSAGE', payload: { text } });
    try {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(out);
        setText('');
        sendStopTyping();
      } else {
        setError('Not connected. Message not sent.');
      }
    } catch (err) {
      console.error('Failed to send message', err);
      setError('Failed to send message');
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);

    if (
      e.target.value &&
      ws.current &&
      ws.current.readyState === WebSocket.OPEN
    ) {
      sendTyping();
    }
  };

  const sendTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      ws.current.send(JSON.stringify({ type: 'TYPING', payload: {} }));
    } catch (err) {
      console.error('Failed to send typing indicator', err);
    }

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
        ws.current.send(JSON.stringify({ type: 'STOP_TYPING', payload: {} }));
      }
    } catch (err) {
      console.error('Failed to send stop typing indicator', err);
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
    setUploadMessage('');
    setSelectedFile(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadMessage('');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select a file!');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('username', username);
    formData.append('file', selectedFile);

    try {
      const protocol = useSSL ? 'https' : 'http';
      const port = useSSL ? '7443' : '7070';
      const response = await fetch(`${protocol}://localhost:${port}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadMessage(`✅ ${data.message}`);
        setTimeout(() => {
          setShowUploadModal(false);
          setSelectedFile(null);
        }, 1500);
      } else {
        const errorText = await response.text();
        setUploadMessage(`❌ Upload failed: ${errorText}`);
      }
    } catch (error) {
      setUploadMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadMessage('');
  };

  useEffect(() => {
    return () => {
      if (ws.current) ws.current.close();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isConnected) {
    return (
      <LoginScreen
        username={username}
        setUsername={setUsername}
        useSSL={useSSL}
        setUseSSL={setUseSSL}
        error={error}
        onJoin={handleJoin}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Chat Header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">FIT Chat</h2>
          <div className="flex items-center gap-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {username}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {useSSL ? 'SSL' : 'No SSL'}
            </span>
            <button
              onClick={handleDisconnect}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 px-6 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Users Panel */}
        <div className="w-100 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h4 className="font-semibold text-gray-700">
              Online Users ({users.length})
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {users.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-4">
                No users online
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 ${
                    u === username ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-700">{u}</span>
                  <span className="text-green-500">🟢</span>
                  {u === username && (
                    <span className="ml-auto text-xs text-blue-600 font-medium">
                      (you)
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <MessagesPanel
            messages={messages}
            typingUsers={typingUsers}
            currentUsername={username}
            messagesEndRef={messagesEndRef}
          />

          <MessageInput
            text={text}
            onTextChange={handleTextChange}
            onSend={sendMessage}
            onKeyDown={handleKeyDown}
            onBlur={sendStopTyping}
            onUploadClick={handleUploadClick}
          />
        </div>
      </div>

      <UploadModal
        show={showUploadModal}
        selectedFile={selectedFile}
        uploadMessage={uploadMessage}
        isUploading={isUploading}
        onClose={closeModal}
        onFileSelect={handleFileSelect}
        onUpload={handleFileUpload}
        fileInputRef={fileInputRef}
      />
    </div>
  );
}
