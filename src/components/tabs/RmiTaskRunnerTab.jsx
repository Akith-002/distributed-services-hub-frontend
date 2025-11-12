import React, { useState, useEffect } from "react";
import { Zap, AlertCircle, CheckCircle, Loader } from "lucide-react";

export default function RmiTaskRunnerTab({ onSendCommand, isConnected }) {
  const [loading, setLoading] = useState(false);
  const [taskResult, setTaskResult] = useState(null);
  const [selectedTask, setSelectedTask] = useState("calculate-pi");
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const availableTasks = [
    {
      id: "calculate-pi",
      name: "Calculate Pi",
      description: "Calculate Pi to 1000 decimal places using Machin's formula",
    },
    {
      id: "fibonacci-10",
      name: "Fibonacci (10)",
      description: "Calculate 10th Fibonacci number (recursive)",
    },
    {
      id: "fibonacci-20",
      name: "Fibonacci (20)",
      description: "Calculate 20th Fibonacci number (recursive)",
    },
    {
      id: "prime-check",
      name: "Prime Check",
      description: "Check if 982451653 is a prime number",
    },
    {
      id: "sum-range",
      name: "Sum Range",
      description: "Sum all numbers from 1 to 1,000,000",
    },
  ];

  useEffect(() => {
    const handleServiceResult = (event) => {
      const msg = event.detail;
      if (msg.result_from === "RMI_SERVICE") {
        setTaskResult({
          timestamp: new Date(),
          message: msg.data,
          success: true,
        });
        setLastUpdate(new Date());
        setError(null);
        setLoading(false);
      }
    };

    window.addEventListener("service-result", handleServiceResult);
    return () =>
      window.removeEventListener("service-result", handleServiceResult);
  }, []);

  const handleExecuteTask = () => {
    if (!isConnected) {
      setError("Not connected to Hub Server");
      return;
    }

    setLoading(true);
    setError(null);
    setTaskResult(null);
    onSendCommand("RMI_SERVICE", selectedTask);

    // Timeout after 15 seconds (some tasks may take time)
    setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Request timeout - no response from RMI Task Service");
      }
    }, 15000);
  };

  const currentTask = availableTasks.find((t) => t.id === selectedTask);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Controls */}
      <div className="lg:col-span-1">
        <div className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-600/50 to-red-600/50 px-6 py-4 border-b border-slate-600">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              RMI Task Runner
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Member 5 - Java Remote Method Invocation
            </p>
          </div>

          {/* Task Selection */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Task
              </label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 bg-slate-600/50 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {availableTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-2">
                {currentTask?.description}
              </p>
            </div>

            <button
              onClick={handleExecuteTask}
              disabled={!isConnected || loading}
              className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                isConnected && !loading
                  ? "bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                  : "bg-slate-600 text-slate-400 cursor-not-allowed opacity-50"
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Execute Task
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
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            {lastUpdate && !loading && taskResult && !error && (
              <div className="p-3 bg-green-900/30 border border-green-700/50 rounded-lg flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <p className="text-xs text-green-300">
                  Executed: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-slate-700/30 border-t border-slate-600 px-6 py-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>🔗 Java RMI Flow (Remote Method Invocation):</strong>
              <br />
              1. Dashboard sends task command to Hub via WebSocket
              <br />
              2. Hub forwards command to RMI service via TCP
              <br />
              3. RMI client looks up remote object: <span className="text-yellow-300 font-mono">rmi://localhost:1099/TaskService</span>
              <br />
              4. Remote method invocation: <span className="text-yellow-300 font-mono">taskService.executeTask(taskName)</span>
              <br />
              5. Result serialized and returned through RMI stub
              <br />
              6. Response flows back: RMI Service → Hub → Dashboard
              <br />
              <br />
              <strong className="text-yellow-300">Key Concepts:</strong> Remote interface, UnicastRemoteObject, RMI Registry, Stub/Skeleton, Object serialization, Distributed computing
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Results */}
      <div className="lg:col-span-2">
        {!taskResult && !loading && (
          <div className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-slate-100 mb-2">
                Ready to execute remote task
              </h3>
              <p className="text-slate-400">
                Select a task and click "Execute Task" to invoke a remote method
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Loader className="w-12 h-12 text-yellow-400 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                Executing remote task
              </h3>
              <p className="text-slate-400">
                Invoking remote method on RMI server...
              </p>
            </div>
          </div>
        )}

        {taskResult && (
          <div className="space-y-4">
            {/* Result Card */}
            <div className="bg-gradient-to-br from-yellow-900/30 to-red-900/30 rounded-lg border border-yellow-700/50 overflow-hidden">
              {/* Header */}
              <div className="bg-slate-700/50 border-b border-slate-600 px-6 py-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Task Result
                </h3>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-2">
                    <strong>Task:</strong> {currentTask?.name}
                  </p>
                  <p className="text-sm text-slate-300 mb-4">
                    {currentTask?.description}
                  </p>
                </div>

                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <p className="text-sm text-yellow-300 font-mono whitespace-pre-wrap break-words">
                    {taskResult.message}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-600">
                  <p className="text-xs text-slate-400">
                    Execution time: {taskResult.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* RMI Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-4">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  RMI Architecture
                </h4>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex gap-2">
                    <span className="text-yellow-400 shrink-0">→</span>
                    <span>
                      <strong>RMI Registry:</strong> Service discovery (port
                      1099)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-400 shrink-0">→</span>
                    <span>
                      <strong>Remote Interface:</strong> Defines remote methods
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-400 shrink-0">→</span>
                    <span>
                      <strong>Stub/Skeleton:</strong> Automatic serialization
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-400 shrink-0">→</span>
                    <span>
                      <strong>Remote Exception:</strong> Network failures
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-4">
                <h4 className="font-semibold text-white mb-3">
                  Available Tasks
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {availableTasks.map((task) => (
                    <li
                      key={task.id}
                      className={`flex gap-2 ${
                        selectedTask === task.id
                          ? "text-yellow-300 font-semibold"
                          : ""
                      }`}
                    >
                      <span
                        className={
                          selectedTask === task.id
                            ? "text-yellow-400"
                            : "text-slate-500"
                        }
                      >
                        ★
                      </span>
                      {task.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
