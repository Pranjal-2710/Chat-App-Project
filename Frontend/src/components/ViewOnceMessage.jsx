import React, { useState, useEffect, useContext } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/Auth';

const ViewOnceMessage = ({ message, onView, isOwnMessage }) => {
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { markViewOnceAsViewed } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);

  // Check if message has been viewed by current user
  useEffect(() => {
    if (message.viewedBy && message.viewedBy.length > 0 && authUser) {
      // Check if current user has viewed this message
      if (message.viewedBy.includes(authUser._id)) {
        setHasBeenViewed(true);
      }
    }
  }, [message.viewedBy, authUser]);

  const handleView = async () => {
    if (!hasBeenViewed && message.viewOnce) {
      // First show the media
      setIsExpanded(true);
      
      // Then mark as viewed in backend after a short delay
      setTimeout(async () => {
        const success = await markViewOnceAsViewed(message._id);
        if (success) {
          setHasBeenViewed(true);
          
          // Call the onView callback if provided
          if (onView) {
            onView(message._id);
          }
        }
      }, 100); // Small delay to ensure media is shown first
    } else {
      setIsExpanded(true);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
  };



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

  // If it's a view-once message that has been viewed, show the deleted message
  if (message.viewOnce && hasBeenViewed) {
    return (
      <div className={`p-2 max-w-[250px] rounded-lg mb-8 bg-violet-500/30 border border-gray-700 ${isOwnMessage ? 'rounded-br-none' : 'rounded-bl-none'}`}>
        <div className="flex items-center space-x-2 text-gray-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span className="text-xs">Cannot view more than one time</span>
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

  // Default case - this component should only be used for view-once messages
  // If we reach here, it means the message doesn't have viewOnce flag
  // This shouldn't happen, but just in case, return null
  console.warn('ViewOnceMessage component used for non-view-once message:', message);
  return null;
};

export default ViewOnceMessage;