import React, { useState, useEffect } from 'react';

const ViewOnceMessage = ({ message, onView, isOwnMessage }) => {
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if message has been viewed (you might want to store this in your backend)
  useEffect(() => {
    // For demo purposes, we'll use localStorage to track viewed messages
    // In a real app, this should be handled by your backend
    const viewedMessages = JSON.parse(localStorage.getItem('viewedMessages') || '[]');
    if (viewedMessages.includes(message._id)) {
      setHasBeenViewed(true);
    }
  }, [message._id]);

  const handleView = () => {
    if (!hasBeenViewed && message.viewOnce) {
      // Mark as viewed
      const viewedMessages = JSON.parse(localStorage.getItem('viewedMessages') || '[]');
      viewedMessages.push(message._id);
      localStorage.setItem('viewedMessages', JSON.stringify(viewedMessages));
      setHasBeenViewed(true);
      
      // Call the onView callback to handle backend logic
      if (onView) {
        onView(message._id);
      }
    }
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  // If it's a view-once message that has been viewed, show a placeholder
  if (hasBeenViewed && message.viewOnce) {
    return (
      <div className={`p-2 max-w-[250px] rounded-lg mb-8 bg-violet-500/30 border border-gray-700 ${isOwnMessage ? 'rounded-br-none' : 'rounded-bl-none'}`}>
        <div className="flex items-center space-x-2 text-gray-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span className="text-xs">This message was deleted</span>
        </div>
      </div>
    );
  }

  // If it's a view-once message that hasn't been viewed, show the view button
  if (message.viewOnce && !hasBeenViewed) {
    return (
      <div className={`p-2 max-w-[250px] rounded-lg mb-8 bg-violet-500/30 border border-gray-700 ${isOwnMessage ? 'rounded-br-none' : 'rounded-bl-none'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span className="text-xs text-blue-400">View once</span>
          </div>
          <button
            onClick={handleView}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-full transition-colors"
          >
            View
          </button>
        </div>
      </div>
    );
  }

  // If it's expanded, show the media
  if (isExpanded) {
    return (
      <div className={`p-2 max-w-[300px] rounded-lg mb-8 bg-violet-500/30 border border-gray-700 ${isOwnMessage ? 'rounded-br-none' : 'rounded-bl-none'}`}>
        {message.image ? (
          <div className="relative">
            <img
              src={message.image}
              alt=""
              className="max-w-full border border-gray-700 rounded-lg overflow-hidden"
            />
            {message.viewOnce && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-xs flex items-center space-x-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>View once</span>
              </div>
            )}
          </div>
        ) : message.video ? (
          <div className="relative">
            <video
              controls
              className="w-full max-h-64 rounded-lg"
              preload="metadata"
              src={message.video}
            >
              Your browser does not support the video element.
            </video>
            {message.viewOnce && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-xs flex items-center space-x-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>View once</span>
              </div>
            )}
          </div>
        ) : null}
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">
            {message.image ? 'Photo' : 'Video'} Message
          </p>
          {message.viewOnce && (
            <button
              onClick={handleClose}
              className="text-xs text-gray-400 hover:text-white"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default case - show regular media (non-view-once)
  // This component should only be used for view-once messages
  // Regular messages are handled by the parent component
  return null;
};

export default ViewOnceMessage;