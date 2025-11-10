export default function LoginScreen({
  username,
  setUsername,
  useSSL,
  setUseSSL,
  error,
  onJoin,
  isDashboard = false,
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          {isDashboard ? (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Distributed Services Hub
              </h2>
              <p className="text-gray-600">
                Enter dashboard name to connect to Hub
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                FIT Chat
              </h2>
              <p className="text-gray-600">Enter your username to join</p>
            </>
          )}
        </div>

        <input
          type="text"
          placeholder={
            isDashboard
              ? "Dashboard name (e.g., Monitor 1)"
              : "Enter your username"
          }
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onJoin()}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none mb-4"
          autoFocus
        />

        {!isDashboard && (
          <label className="flex items-center justify-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={useSSL}
              onChange={(e) => setUseSSL(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">
              {useSSL ? "SSL/TLS Enabled (wss://)" : "SSL/TLS Disabled (ws://)"}
            </span>
          </label>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {isDashboard && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ℹ️ Connecting to ws://localhost:7071/registry (SSL not configured)
          </div>
        )}

        <button
          onClick={onJoin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isDashboard ? "Connect to Hub" : "Join Chat"}
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          {isDashboard ? (
            <p>Connecting to Hub Server • Port: {useSSL ? "7443" : "7071"}</p>
          ) : (
            <p>
              {useSSL
                ? "Secure WebSocket (WSS) • Port: 7443"
                : "Unsecured WebSocket (WS) • Port: 7071"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
