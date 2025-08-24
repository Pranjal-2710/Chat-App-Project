import React, { useState } from 'react';

const MediaPreview = ({ mediaData, onSend, onCancel }) => {
  const [isViewOnce, setIsViewOnce] = useState(false);

  const handleSend = () => {
    // Add view-once flag to the media data
    const dataToSend = {
      ...mediaData,
      viewOnce: isViewOnce
    };
    onSend(dataToSend);
  };

  const formatFileSize = (base64String) => {
    const stringLength = base64String.length;
    const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.75;
    const sizeInKB = sizeInBytes / 1024;
    const sizeInMB = sizeInKB / 1024;
    
    if (sizeInMB > 1) {
      return `${sizeInMB.toFixed(1)} MB`;
    } else {
      return `${sizeInKB.toFixed(1)} KB`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-4 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">
            Preview {mediaData.image ? 'Photo' : 'Video'}
          </h3>
          <button
            onClick={onCancel}
            className="text-white hover:text-gray-300"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Media Preview */}
        <div className="relative mb-4">
          {mediaData.image ? (
            <img
              src={mediaData.image}
              alt="Preview"
              className="w-full h-64 bg-black rounded-lg object-cover"
            />
          ) : (
            <video
              src={mediaData.video}
              controls
              className="w-full h-64 bg-black rounded-lg object-cover"
              preload="metadata"
            >
              Your browser does not support the video element.
            </video>
          )}
          
          {/* File size indicator */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-xs">
            {formatFileSize(mediaData.image || mediaData.video)}
          </div>
        </div>

        {/* View Once Toggle */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span className="text-white text-sm">View once</span>
          </div>
          <button
            onClick={() => setIsViewOnce(!isViewOnce)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isViewOnce ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isViewOnce ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22,2 15,22 11,13 2,9 22,2"/>
            </svg>
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaPreview;