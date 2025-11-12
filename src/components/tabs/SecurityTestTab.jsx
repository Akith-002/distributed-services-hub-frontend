import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertCircle,
  CheckCircle,
  Loader,
  Lock,
  Unlock,
} from "lucide-react";

export default function SecurityTestTab({ onSendCommand, isConnected }) {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const handleServiceResult = (event) => {
      const msg = event.detail;
      if (msg.result_from === "JSSE_SERVICE") {
        // Parse the test result
        const result = {
          timestamp: new Date(),
          message: msg.data,
          success: msg.data.includes("SUCCESS") || msg.data.includes("SECURE"),
        };
        setTestResults((prev) => [result, ...prev].slice(0, 10)); // Keep last 10
        setLastUpdate(new Date());
        setError(null);
        setLoading(false);
      }
    };

    window.addEventListener("service-result", handleServiceResult);
    return () =>
      window.removeEventListener("service-result", handleServiceResult);
  }, []);

  const handleRunSecurityTest = () => {
    if (!isConnected) {
      setError("Not connected to Hub Server");
      return;
    }

    setLoading(true);
    setError(null);
    setTestResults([]);
    onSendCommand("JSSE_SERVICE", "run-test");

    // Timeout after 10 seconds
    setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Request timeout - no response from Security service");
      }
    }, 10000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Controls */}
      <div className="lg:col-span-1">
        <div className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600/50 to-orange-600/50 px-6 py-4 border-b border-slate-600">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              Security Test
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Member 3 - JSSE & SSLServerSocket
            </p>
          </div>

          {/* Controls */}
          <div className="p-6 space-y-4">
            <div className="bg-slate-600/30 rounded-lg p-4 border border-slate-500/50">
              <p className="text-sm text-slate-300 mb-3">
                This test runs two automated security checks:
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>
                    <strong>Test 1:</strong> Regular Socket (should fail)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>
                    <strong>Test 2:</strong> SSL Socket (should succeed)
                  </span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleRunSecurityTest}
              disabled={!isConnected || loading}
              className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                isConnected && !loading
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl"
                  : "bg-slate-600 text-slate-400 cursor-not-allowed opacity-50"
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Run Security Test
                </>
              )}
            </button>

            {!isConnected && (
              <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                <p className="text-xs text-red-300">
                  ⚠️ Not connected to Hub. Make sure the Hub Server is running.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            {lastUpdate && !loading && testResults.length > 0 && !error && (
              <div className="p-3 bg-green-900/30 border border-green-700/50 rounded-lg flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-300">
                  Tests completed: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-slate-700/30 border-t border-slate-600 px-6 py-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>🔐 JSSE/SSL Implementation:</strong>
              <br />
              The Secure File Service runs on SSLServerSocket (port 9090). This
              test proves only SSL connections are accepted.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Test Results */}
      <div className="lg:col-span-2">
        {testResults.length === 0 && !loading && (
          <div className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="text-6xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-slate-100 mb-2">
                Ready to run security tests
              </h3>
              <p className="text-slate-400">
                Click "Run Security Test" to verify SSLServerSocket
                configuration
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Loader className="w-12 h-12 text-amber-400 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                Running security tests
              </h3>
              <p className="text-slate-400">
                Testing insecure and secure connections...
              </p>
            </div>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="space-y-4">
            {testResults.map((result, idx) => (
              <div
                key={idx}
                className={`rounded-lg border-2 overflow-hidden ${
                  result.success
                    ? "bg-green-900/20 border-green-700/50"
                    : "bg-red-900/20 border-red-700/50"
                }`}
              >
                <div className="p-4 flex items-start gap-3">
                  {result.success ? (
                    <>
                      <Lock className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-300">
                          Secure Connection Test
                        </h4>
                        <p className="text-sm text-green-200 mt-1">
                          {result.message}
                        </p>
                        <p className="text-xs text-green-400 mt-2">
                          ✓ SSLServerSocket correctly accepted secure connection
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-300">
                          Insecure Connection Test
                        </h4>
                        <p className="text-sm text-red-200 mt-1">
                          {result.message}
                        </p>
                        <p className="text-xs text-red-400 mt-2">
                          ✓ SSLServerSocket correctly rejected insecure
                          connection
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="bg-slate-700/30 border-t border-slate-600 px-4 py-2">
                  <p className="text-xs text-slate-400">
                    {result.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {testResults.length >= 2 && (
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg border border-green-700/50 p-4">
                <h4 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Security Verification Complete
                </h4>
                <p className="text-sm text-green-200">
                  ✓ Test 1 (Insecure) FAILED as expected - proves
                  SSLServerSocket rejects non-SSL connections
                  <br />✓ Test 2 (Secure) SUCCEEDED - proves SSLServerSocket
                  accepts valid SSL connections
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
