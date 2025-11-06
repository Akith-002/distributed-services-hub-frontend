import { Upload, X, File, Image } from 'lucide-react';

export default function UploadModal({
  show,
  selectedFile,
  uploadMessage,
  isUploading,
  onClose,
  onFileSelect,
  onUpload,
  fileInputRef,
}) {
  if (!show) return null;

  const getFileIcon = () => {
    if (!selectedFile) return <File className="w-12 h-12 text-gray-400" />;

    const type = selectedFile.type;
    if (type.startsWith('image/')) {
      return <Image className="w-12 h-12 text-blue-500" />;
    }
    return <File className="w-12 h-12 text-green-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Upload File</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-4">
            <div className="flex justify-center mb-4">{getFileIcon()}</div>

            {selectedFile ? (
              <div>
                <p className="font-medium text-gray-800 mb-1">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Click to select a file</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              onChange={onFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-medium"
            >
              Choose File
            </button>
          </div>

          {uploadMessage && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                uploadMessage.startsWith('✅')
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {uploadMessage}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
    </div>
  );
}
