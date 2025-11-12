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

export default function FileServiceTab({ services, isConnected }) {
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

  // Find the secure file service
  const fileService = services?.find(
    (s) => s.serviceName === "JSSE_SERVICE" || s.port === 9090
  ) || { serviceName: "JSSE_SERVICE", port: 9090 };

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
      console.log("[FileService] Attempting to connect to ws://localhost:9001/api");
      ws.current = new WebSocket("ws://localhost:9001/api");

      ws.current.onopen = () => {
        console.log("[FileService] ✓ Connected to API Gateway");
        setError(null);
        // Automatically list files when connected
        setTimeout(() => {
          console.log("[FileService] Auto-listing files on connect...");
          listFiles();
        }, 500);
      };

      ws.current.onmessage = (event) => {
        console.log("[FileService] Raw message received:", event.data);
        try {
          const response = JSON.parse(event.data);
          handleWebSocketMessage(response);
        } catch (err) {
          console.error("[FileService] Error parsing WebSocket message:", err);
          console.error("[FileService] Raw data was:", event.data);
        }
      };

      ws.current.onerror = (err) => {
        console.error("[FileService] WebSocket error:", err);
        setError("Failed to connect to API Gateway on port 9001. Make sure it's running.");
      };

      ws.current.onclose = (event) => {
        console.log("[FileService] Disconnected from API Gateway. Code:", event.code, "Reason:", event.reason);
      };
    } catch (err) {
      console.error("[FileService] Failed to create WebSocket:", err);
      setError("Failed to create WebSocket connection: " + err.message);
    }
  };

  const handleWebSocketMessage = (response) => {
    console.log("Received from API Gateway:", response);
    console.log("Response type:", response.type);
    console.log("Response files:", response.files);

    switch (response.type) {
      case "FILE_LIST":
        {
          const fileList = response.files || [];
          console.log("Setting files to:", fileList);
          setFiles(fileList);
          setIsListing(false);
        }
        break;

      case "FILE_UPLOAD_SUCCESS":
        {
          setUploadMessage(
            response.message ||
              `File "${response.fileName}" uploaded successfully`
          );
          setIsUploading(false);
          setSelectedFile(null);
          // Automatically refresh file list after upload
          setTimeout(() => listFiles(), 500);
          // Clear success message after 3 seconds
          setTimeout(() => setUploadMessage(""), 3000);
        }
        break;

      case "FILE_DOWNLOAD_SUCCESS":
        {
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
          // Clear success message after 3 seconds
          setTimeout(() => setDownloadMessage(""), 3000);
        }
        break;

      case "ERROR":
        setError(response.error);
        setIsUploading(false);
        setIsDownloading(false);
        setIsListing(false);
        break;

      default:
        console.log("Unknown message type:", response.type, "Full response:", response);
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

    console.log("Sending listFiles command:", command);
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

      console.log("Sending uploadFile command:", command.fileName);
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

    console.log("Sending downloadFile command:", command);
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
      <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Secure File Service
            </h2>
            <p className="text-sm text-slate-300">
              Upload, download, and manage files securely
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-300 text-sm mb-1">Error</p>
              <p className="text-sm text-red-200">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Success Messages */}
      {uploadMessage && (
        <div className="bg-green-900/30 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-300 text-sm mb-1">
                Success
              </p>
              <p className="text-sm text-green-200">{uploadMessage}</p>
            </div>
            <button
              onClick={() => setUploadMessage("")}
              className="text-green-400 hover:text-green-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {downloadMessage && (
        <div className="bg-green-900/30 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-300 text-sm mb-1">
                Downloaded
              </p>
              <p className="text-sm text-green-200">{downloadMessage}</p>
            </div>
            <button
              onClick={() => setDownloadMessage("")}
              className="text-green-400 hover:text-green-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Section */}
        <div className="bg-slate-700/50 rounded-lg shadow-lg border border-slate-600 overflow-hidden">
          <div className="bg-slate-700/70 px-5 py-4 border-b border-slate-600">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              Upload File
            </h4>
          </div>

          <div className="p-6 space-y-4">
            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-3 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                selectedFile
                  ? "border-blue-400 bg-slate-600/50"
                  : "border-slate-500 bg-slate-700/30 hover:border-blue-400 hover:bg-slate-600/50"
              }`}
            >
              {selectedFile ? (
                <div>
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mx-auto mb-3 shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-bold text-white text-lg truncate mb-1">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-slate-300">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center w-16 h-16 bg-slate-600 rounded-lg mx-auto mb-3">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-200 mb-1">
                    Click to select file
                  </p>
                  <p className="text-xs text-slate-400">or drag and drop</p>
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
                className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <File className="w-4 h-4" />
                Choose File
              </button>

              <button
                onClick={uploadFile}
                disabled={!selectedFile || isUploading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
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
        <div className="bg-slate-700/50 rounded-lg shadow-lg border border-slate-600 overflow-hidden">
          <div className="bg-slate-700/70 px-5 py-4 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-400" />
                File Library ({files.length})
              </h4>
              <button
                onClick={listFiles}
                disabled={isListing}
                className="px-3 py-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 text-slate-200 rounded-lg font-semibold text-xs transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none flex items-center gap-2"
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
                <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FolderOpen className="w-8 h-8 text-slate-400" />
                </div>
                <p className="font-semibold text-slate-200 mb-1">No files yet</p>
                <p className="text-sm text-slate-400">
                  Upload your first file to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {files.map((fileName, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-600/50 px-4 py-3 rounded-lg border border-slate-500 hover:bg-slate-600/70 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-white truncate text-sm">
                        {fileName}
                      </span>
                    </div>
                    <button
                      onClick={() => downloadFile(fileName)}
                      disabled={isDownloading}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg font-semibold text-xs transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none flex items-center gap-2 shrink-0"
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
      <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-green-300 text-lg mb-1">
              🔒 SSL/TLS Secured
            </h4>
            <p className="text-sm text-slate-300 mb-2">
              All file operations are encrypted using SSL/TLS protocols for
              maximum security.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-slate-600 text-slate-200 px-3 py-1 rounded-full font-semibold">
                Port: {fileService.port}
              </span>
              <span className="bg-slate-600 text-slate-200 px-3 py-1 rounded-full font-semibold">
                RSA 2048-bit
              </span>
              <span className="bg-slate-600 text-slate-200 px-3 py-1 rounded-full font-semibold">
                TLS 1.2/1.3
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
