import { Paperclip, SendHorizontal } from 'lucide-react';

export default function MessageInput({
  text,
  onTextChange,
  onSend,
  onKeyDown,
  onBlur,
  onUploadClick,
}) {
  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onUploadClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-blue-600"
          title="Upload file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={onTextChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none"
        />

        <button
          onClick={onSend}
          disabled={!text.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-3 rounded-full font-medium transition-colors"
        >
          <SendHorizontal />
        </button>
      </div>
    </div>
  );
}
