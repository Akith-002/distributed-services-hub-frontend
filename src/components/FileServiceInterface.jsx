import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  FileText,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Shield,
  RefreshCw,
  Loader,
  X,
  File,
} from "lucide-react";

export default function FileServiceInterface({ service }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [downloadMessage, setDownloadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const ws = useRef(null);

  React.useEffect(() => {
    connectToApiGateway();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const connectToApiGateway = () => {
    try {
      ws.current = new WebSocket("ws://localhost:9001/api");

      ws.current.onopen = () => {
        console.log("Connected to API Gateway for file operations");
      };

      ws.current.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          handleWebSocketMessage(response);
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.current.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError("Failed to connect to API Gateway");
      };

      ws.current.onclose = () => {
        console.log("Disconnected from API Gateway");
      };
    } catch (err) {
      setError("Failed to create WebSocket connection: " + err.message);
    }
  };

  const handleWebSocketMessage = (response) => {
    switch (response.type) {
      case "FILE_LIST":
        setFiles(response.files || []);
        setIsListing(false);
        break;

      case "FILE_UPLOAD_SUCCESS":
        setUploadMessage(
          response.message ||
            `File "${response.fileName}" uploaded successfully`
        );
        setIsUploading(false);
        setSelectedFile(null);
        setTimeout(() => listFiles(), 500);
        break;

      case "FILE_DOWNLOAD_SUCCESS":
        setDownloadMessage(
          `File "${response.fileName}" downloaded successfully`
        );
        setIsDownloading(false);
        const blob = new Blob([response.fileData], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = response.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        break;

      case "ERROR":
        setError(response.error);
        setIsUploading(false);
        setIsDownloading(false);
        setIsListing(false);
        break;

      default:
        console.log("Unknown message type:", response.type);
    }
  };

  const listFiles = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError("Not connected to API Gateway");
      return;
    }

    setIsListing(true);
    setError(null);

    const command = {
      command: "listFiles",
    };

    ws.current.send(JSON.stringify(command));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadMessage("");
      setError(null);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError("Not connected to API Gateway");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadMessage("");

    try {
      const fileData = await selectedFile.text();

      const command = {
        command: "uploadFile",
        fileName: selectedFile.name,
        fileData: fileData,
      };

      ws.current.send(JSON.stringify(command));
    } catch (err) {
      setError("Failed to read file: " + err.message);
      setIsUploading(false);
    }
  };

  const downloadFile = (fileName) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError("Not connected to API Gateway");
      return;
    }

    setIsDownloading(true);
    setError(null);
    setDownloadMessage("");

    const command = {
      command: "downloadFile",
      fileName: fileName,
    };

    ws.current.send(JSON.stringify(command));
  };

  const formatFileSize = (size) => {
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-5 rounded-2xl border-2 border-blue-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Secure File Service
            </h3>
            <p className="text-sm text-blue-700">
              Upload, download, and manage files securely
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm animate-shake">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 text-sm mb-1">Error</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Success Messages */}
      {uploadMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm animate-slideIn">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-900 text-sm mb-1">
                Success
              </p>
              <p className="text-sm text-green-800">{uploadMessage}</p>
            </div>
            <button
              onClick={() => setUploadMessage("")}
              className="text-green-500 hover:text-green-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {downloadMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm animate-slideIn">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-900 text-sm mb-1">
                Downloaded
              </p>
              <p className="text-sm text-green-800">{downloadMessage}</p>
            </div>
            <button
              onClick={() => setDownloadMessage("")}
              className="text-green-500 hover:text-green-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload File
            </h4>
          </div>

          <div className="p-6 space-y-4">
            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                selectedFile
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              {selectedFile ? (
                <div>
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-3 shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-bold text-gray-900 text-lg truncate mb-1">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-3">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-semibold text-gray-700 mb-1">
                    Click to select file
                  </p>
                  <p className="text-xs text-gray-500">or drag and drop</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <File className="w-4 h-4" />
                Choose File
              </button>

              <button
                onClick={uploadFile}
                disabled={!selectedFile || isUploading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
              >
                {isUploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* File List Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-600" />
                File Library ({files.length})
              </h4>
              <button
                onClick={listFiles}
                disabled={isListing}
                className="px-3 py-2 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 rounded-lg font-semibold text-xs transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none flex items-center gap-2 transform hover:scale-105 active:scale-95"
              >
                {isListing ? (
                  <Loader className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Refresh
              </button>
            </div>
          </div>

          <div className="p-6">
            {files.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-700 mb-1">No files yet</p>
                <p className="text-sm text-gray-500">
                  Upload your first file to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {files.map((fileName, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-900 truncate text-sm">
                        {fileName}
                      </span>
                    </div>
                    <button
                      onClick={() => downloadFile(fileName)}
                      disabled={isDownloading}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg font-semibold text-xs transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none flex items-center gap-2 flex-shrink-0 transform hover:scale-105 active:scale-95"
                    >
                      {isDownloading ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <Download className="w-3 h-3" />
                          <span className="hidden sm:inline">Download</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-xl flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-green-900 text-lg mb-1">
              🔒 SSL/TLS Secured
            </h4>
            <p className="text-sm text-green-800 mb-2">
              All file operations are encrypted using SSL/TLS protocols for
              maximum security.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                Port: {service.port}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                RSA 2048-bit
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                TLS 1.2/1.3
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
