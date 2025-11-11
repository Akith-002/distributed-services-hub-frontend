import React from 'react';
import './LinkPreview.css';

/**
 * Link Preview Component
 * Displays a preview card for URLs shared in chat
 * 
 * @author Member 5 - Frontend Integration
 */
const LinkPreview = ({ url, title, sender, timestamp }) => {
  return (
    <div className="link-preview">
      <div className="preview-icon">🔗</div>
      <div className="preview-content">
        <div className="preview-sender">
          <strong>{sender}</strong> shared a link {timestamp && `at ${timestamp}`}
        </div>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="preview-title"
          title={title}
        >
          {title}
        </a>
        <div className="preview-url">{url}</div>
      </div>
    </div>
  );
};

export default LinkPreview;
