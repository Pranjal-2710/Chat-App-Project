import React, { useState, useRef, useEffect } from 'react';

const CameraCapture = ({ onCapture, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  // Effect to handle video stream when it changes
  useEffect(() => {
    if (stream && videoRef.current && isOpen) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error('Video play error:', e));
    }
  }, [stream, isOpen]);

  // Open camera
  const openCamera = async () => {
    try {
      console.log('Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // front camera by default
        }, 
        audio: true 
      });
      
      console.log('Camera access granted, stream:', mediaStream);
      console.log('Video tracks:', mediaStream.getVideoTracks());
      
      setStream(mediaStream);
      setIsOpen(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  // Close camera and cleanup
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsOpen(false);
    setIsRecordingVideo(false);
    setRecordingTime(0);
    setIsVideoReady(false);
    onClose();
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      alert('Camera not ready. Please try again.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check if video is ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      alert('Camera not ready. Please wait a moment and try again.');
      return;
    }
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert('Camera not properly initialized. Please close and reopen camera.');
      return;
    }

    const context = canvas.getContext('2d');

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    
    onCapture({ image: photoData });
    closeCamera();
  };

  // Start video recording
  const startVideoRecording = () => {
    if (!stream) return;

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      
      const chunks = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        
        reader.onloadend = () => {
          onCapture({ video: reader.result });
          closeCamera();
        };
        
        reader.readAsDataURL(videoBlob);
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecordingVideo(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting video recording:', error);
      alert('Could not start video recording.');
    }
  };

  // Stop video recording
  const stopVideoRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecordingVideo(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) {
    return (
      <button
        onClick={openCamera}
        className="p-2 rounded-full bg-green-500 hover:bg-green-600 transition-all duration-200"
        title="Open camera"
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
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-4 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">
            {isRecordingVideo ? 'Recording Video' : 'Camera'}
          </h3>
          <button
            onClick={closeCamera}
            className="text-white hover:text-gray-300"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Video Preview */}
        <div className="relative mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 bg-black rounded-lg object-cover"
            onLoadedMetadata={() => setIsVideoReady(true)}
            onCanPlay={() => console.log('Video can play')}
            onPlaying={() => console.log('Video is playing')}
            onError={(e) => console.error('Video error:', e)}
          />
          
          {/* Recording indicator */}
          {isRecordingVideo && (
            <div className="absolute top-2 left-2 flex items-center space-x-2 bg-red-500 px-2 py-1 rounded">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-mono">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!isRecordingVideo ? (
            <>
              {/* Photo Button */}
              <button
                onClick={capturePhoto}
                disabled={!isVideoReady}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                  isVideoReady 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-500 cursor-not-allowed'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white mb-1">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span className="text-white text-xs">
                  {isVideoReady ? 'Photo' : 'Loading...'}
                </span>
              </button>

              {/* Video Button */}
              <button
                onClick={startVideoRecording}
                disabled={!isVideoReady}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                  isVideoReady 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-gray-500 cursor-not-allowed'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white mb-1">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                <span className="text-white text-xs">
                  {isVideoReady ? 'Video' : 'Loading...'}
                </span>
              </button>
            </>
          ) : (
            /* Stop Recording Button */
            <button
              onClick={stopVideoRecording}
              className="flex flex-col items-center p-3 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white mb-1">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
              <span className="text-white text-xs">Stop</span>
            </button>
          )}
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default CameraCapture;