import React, { useState } from 'react';
import { ReactMediaRecorder } from 'react-media-recorder';

const VoiceRecorder = ({ onSendVoice }) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleSendVoice = (blobUrl, blob) => {
    if (blob) {
      console.log('Voice blob received:', blob);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Voice data converted to base64');
        onSendVoice({ voice: reader.result });
      };
      reader.readAsDataURL(blob);
    } else {
      console.error('No blob received');
    }
  };

  return (
    <ReactMediaRecorder
      audio
      onStop={(blobUrl, blob) => {
        console.log('Recording stopped, status:', status, 'blob:', blob);
        setIsRecording(false);
        if (blob) {
          handleSendVoice(blobUrl, blob);
        }
      }}
      render={({ status, startRecording, stopRecording, clearBlobUrl }) => (
        <div className="flex items-center">
          {status === "idle" && (
            <button
              onMouseDown={() => {
                console.log('Starting recording...');
                setIsRecording(true);
                startRecording();
              }}
              onMouseUp={() => {
                console.log('Stopping recording...');
                stopRecording();
              }}
              onMouseLeave={() => {
                // Handle case where user drags mouse away while recording
                if (isRecording) {
                  console.log('Mouse left while recording, stopping...');
                  stopRecording();
                }
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                console.log('Starting recording (touch)...');
                setIsRecording(true);
                startRecording();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                console.log('Stopping recording (touch)...');
                stopRecording();
              }}
              className={`p-2 rounded-full transition-all duration-200 ${
                status === "recording" || isRecording
                  ? 'bg-red-500 scale-110' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              title="Hold to record voice message"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className="text-white"
              >
                <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          )}
          
          {status === "recording" && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm">Recording...</span>
              <button
                onClick={() => {
                  setIsRecording(false);
                  stopRecording();
                }}
                className="p-1 bg-red-500 rounded-full"
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  className="text-white"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
              </button>
            </div>
          )}
          
          {(status === "stopped" || status === "acquiring_media") && (
            <div className="text-white text-sm">
              {status === "acquiring_media" ? "Getting microphone..." : "Processing..."}
            </div>
          )}
        </div>
      )}
    />
  );
};

export default VoiceRecorder;