import React, { useEffect, useRef } from 'react'

const CallModal = ({ type = 'audio', incomingCall, onAccept, onDecline, inCall, localStream, remoteStream, onEnd }) => {
  const localVideoRef = useRef()
  const remoteVideoRef = useRef()
  const localAudioRef = useRef()
  const remoteAudioRef = useRef()

  // Attach local stream to the local preview (video or audio as appropriate)
  useEffect(() => {
    if (!localStream) return

    // if there is video track, set video ref, else set local audio (muted)
    const hasVideo = localStream.getVideoTracks().length > 0
    if (hasVideo && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream
      // local preview must be muted to avoid echo
      localVideoRef.current.muted = true
      localVideoRef.current.play?.().catch(() => {})
    } else if (localAudioRef.current) {
      localAudioRef.current.srcObject = localStream
      localAudioRef.current.muted = true
      localAudioRef.current.play?.().catch(() => {})
    }
  }, [localStream])

  // Attach remote stream to the remote preview (video or audio)
  useEffect(() => {
    if (!remoteStream) return

    const hasVideo = remoteStream.getVideoTracks().length > 0
    if (hasVideo && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream
      remoteVideoRef.current.play?.().catch(() => {})
    } else if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream
      // try to play — should be allowed because user gesture already happened (you answered/initiated)
      remoteAudioRef.current.play?.().catch(() => {})
    }
  }, [remoteStream])

  if (incomingCall && !inCall) {
    // caller is incoming
    const caller = incomingCall.from // user id, you might map to name externally
    return (
      <div className="absolute top-5 right-5 bg-gray-900/70 backdrop-blur p-4 rounded-lg z-50 w-80">
        <p className="text-white font-medium">Incoming {incomingCall.callType} call</p>
        <div className="mt-2 flex gap-2">
          <button onClick={() => onAccept()} className="flex-1 bg-green-600 px-3 py-2 rounded text-white">Accept</button>
          <button onClick={() => onDecline()} className="flex-1 bg-red-600 px-3 py-2 rounded text-white">Decline</button>
        </div>
      </div>
    )
  }

  if (inCall) {
    // Show remote larger preview (video or placeholder) and a local preview if video
    const showVideo = (incomingCall?.callType === 'video') || (type === 'video')

    return (
      <div className="absolute bottom-20 right-4 z-50 flex flex-col items-end gap-2">
        {/* remote in larger */}
        {showVideo ? (
          <div className="rounded-lg overflow-hidden shadow-lg w-64 h-40 bg-black">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="rounded-lg p-3 bg-gray-800 text-white">
            {/* Remote audio indicator */}
            <p className="text-sm">In call — {type === 'video' ? 'Video' : 'Audio'}</p>
            {/* invisible audio element to play remote audio */}
            <audio ref={remoteAudioRef} autoPlay controls={false} className="hidden" />
          </div>
        )}

        {/* local small preview (video only) */}
        { showVideo && (
          <div className="rounded-lg overflow-hidden w-28 h-20 bg-black">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          </div>
        )}

        {/* For audio-only local preview keep an (muted) audio element */}
        { !showVideo && localStream && (
          <audio ref={localAudioRef} autoPlay controls={false} className="hidden" />
        )}

        <div className="flex gap-2 mt-1">
          <button onClick={() => onEnd()} className="bg-red-600 px-3 py-1 rounded text-white">End</button>
        </div>
      </div>
    )
  }

  return null
}

export default CallModal
