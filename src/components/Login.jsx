export default function LoginScreen({
  username,
  setUsername,
  useSSL,
  setUseSSL,
  error,
  onJoin,
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            FIT Chat
          </h2>
          <p className="text-gray-600">Enter your username to join</p>
        </div>

        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onJoin()}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none mb-4"
          autoFocus
        />

        <label className="flex items-center justify-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={useSSL}
            onChange={(e) => setUseSSL(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">
            {useSSL
              ? 'SSL/TLS Enabled (wss://)'
              : 'SSL/TLS Disabled (ws://)'}
          </span>
        </label>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={onJoin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Join Chat
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          {useSSL ? (
            <>
              <p>Secure WebSocket (WSS) • Port: 7443</p>
            </>
          ) : (
            <>
              <p>Unsecured WebSocket (WS) • Port: 7070</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
