function MessageBubble({ message, currentUsername }) {
  const isOwnMessage = message.payload?.username === currentUsername;
  const isSystem = message.type === 'SYSTEM';
  const isFile = message.type === 'FILE_UPLOAD';

  function formatTime(timestamp) {
    if (!timestamp) return '';
    const [hour, minute] = timestamp.split(':');
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  const baseClasses = 'max-w-md px-4 rounded-2xl';
  const systemStyles = 'bg-gray-200 py-1 text-gray-700 text-sm rounded-lg';
  const ownMessageStyles = 'bg-blue-600 py-2 text-white rounded-br-sm';
  const otherMessageStyles =
    'bg-white py-2 text-gray-800 rounded-bl-sm shadow-sm';

  let bubbleClasses = '';
  let alignmentClasses = '';

  if (isSystem) {
    bubbleClasses = `${baseClasses} ${systemStyles}`;
    alignmentClasses = 'justify-center';
  } else if (isOwnMessage) {
    bubbleClasses = `${baseClasses} ${ownMessageStyles}`;
    alignmentClasses = 'justify-end';
  } else {
    bubbleClasses = `${baseClasses} ${otherMessageStyles}`;
    alignmentClasses = 'justify-start';
  }

  return (
    <div className={`flex ${alignmentClasses}`}>
      <div className={bubbleClasses}>
        {/* Display username only for other users */}
        {!isSystem && !isOwnMessage && (
          <div className="text-xs font-semibold text-blue-600 mb-1">
            {message.payload?.username}
          </div>
        )}

        {/* File message display */}
        {isFile ? (
          <div className="text-sm">
            <a
              href={message.payload?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline break-all"
            >
              {message.payload?.filename}
            </a>
          </div>
        ) : (
          <div className="text-sm">{message.payload?.text}</div>
        )}

        {!isSystem && message.timestamp && (
          <div
            className={`text-xs mt-1 ${
              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {formatTime(message.timestamp)}
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
