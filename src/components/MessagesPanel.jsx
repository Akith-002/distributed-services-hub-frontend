function MessageBubble({ message, currentUsername }) {
  const isOwnMessage = message.payload?.username === currentUsername;
  const isSystem = message.type === 'SYSTEM';

  return (
    <div
      className={`flex ${
        isSystem
          ? 'justify-center'
          : isOwnMessage
          ? 'justify-end'
          : 'justify-start'
      }`}
    >
      <div
        className={`max-w-md ${
          isSystem
            ? 'bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm'
            : isOwnMessage
            ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2'
            : 'bg-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm'
        }`}
      >
        {!isSystem && !isOwnMessage && (
          <div className="text-xs font-semibold text-blue-600 mb-1">
            {message.payload?.username}
          </div>
        )}
        <div
          className={`text-sm ${
            isSystem ? '' : isOwnMessage ? 'text-white' : 'text-gray-800'
          }`}
        >
          {message.payload?.text}
        </div>
        {message.timestamp && (
          <div
            className={`text-xs mt-1 ${
              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {message.timestamp}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator({ typingUsers }) {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 ml-2">
      <span>
        {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'}{' '}
        typing
      </span>
      <span className="flex gap-1">
        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
          .
        </span>
        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
          .
        </span>
        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>
          .
        </span>
      </span>
    </div>
  );
}

export default function MessagesPanel({
  messages,
  typingUsers,
  currentUsername,
  messagesEndRef,
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          message={msg}
          currentUsername={currentUsername}
        />
      ))}
      <TypingIndicator typingUsers={typingUsers} />
      <div ref={messagesEndRef} />
    </div>
  );
}
