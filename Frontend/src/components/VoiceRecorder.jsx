import React, { useState, useRef } from 'react';

const VoiceRecorder = ({ onSendVoice }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (event) => {
        console.log('Audio data available:', event.data.size);
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        console.log('Recording stopped, processing...');
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        console.log('Audio blob created:', audioBlob.size, 'bytes');
        console.log('Audio blob type:', audioBlob.type);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('Converting to base64...');
          console.log('Base64 data length:', reader.result.length);
          console.log('Base64 data starts with:', reader.result.slice(0, 100));
          
          // Test if the audio can play locally
          const testAudio = new Audio(reader.result);
          testAudio.oncanplay = () => console.log('✅ Local audio test: CAN PLAY');
          testAudio.onerror = (e) => console.error('❌ Local audio test: ERROR', e);
          
          onSendVoice({ voice: reader.result });
          setIsRecording(false);
          
          // Clean up
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        };
        reader.readAsDataURL(audioBlob);
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      console.log('Recording started');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log('Stopping recording...');
      mediaRecorder.stop();
    }
  };

  return (
    <div className="flex items-center">
      {!isRecording ? (
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={(e) => {
            startRecording();
          }}
          onTouchEnd={(e) => {
            stopRecording();
          }}
          className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-200"
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
      ) : (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white text-sm">Recording...</span>
          <button
            onClick={stopRecording}
            className="p-1 bg-red-500 rounded-full hover:bg-red-600"
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
    </div>
  );
};

export default VoiceRecorder;