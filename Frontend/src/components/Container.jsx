import React, { useContext, useEffect, useRef, useState } from 'react'
import profile_alison from '../assets/profile_alison.png'
import help_icon from '../assets/help_icon.png'
import icon from '../assets/icon.png'
import arrow_icon from '../assets/arrow_icon.png'
import avatar from '../assets/avatarr.png'
import { messagesDummyData } from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import gallery_icon from '../assets/gallery_icon.svg'
import send_button from '../assets/send_button.svg'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/Auth'
import toast from 'react-hot-toast'
import VoiceRecorder from './VoiceRecorder'
import CameraCapture from './CameraCapture'
import MediaPreview from './MediaPreview'
const Container = () => {

  const {messages,selectedUser,setSelectedUser,sendMessage, getMessages, deleteForMe, deleteForEveryone}= useContext(ChatContext)
  const {authUser, onlineUsers}= useContext(AuthContext)

  const scrollEnd=useRef()

  const [input,setInput]= useState('')
  const [mediaPreview, setMediaPreview] = useState(null)
  const [selectedMessageId, setSelectedMessageId] = useState(null)
  const [showDeleteBar, setShowDeleteBar] = useState(false)
  const longPressTimerRef = useRef(null)

  const handleLongPressStart = (message)=>{
    if(longPressTimerRef.current) clearTimeout(longPressTimerRef.current)
    longPressTimerRef.current = setTimeout(()=>{
      setSelectedMessageId(message._id)
      setShowDeleteBar(true)
    }, 500)
  }

  const handleLongPressEnd = ()=>{
    if(longPressTimerRef.current){
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleClearSelection = ()=>{
    setSelectedMessageId(null)
    setShowDeleteBar(false)
  }

  const handleDeleteForMe = async()=>{
    if(!selectedMessageId) return
    await deleteForMe(selectedMessageId)
    handleClearSelection()
  }

  const handleDeleteForEveryone = async()=>{
    if(!selectedMessageId) return
    await deleteForEveryone(selectedMessageId)
    handleClearSelection()
  }

  const handleSendMessage= async (e)=>{
    e.preventDefault()
    if(input.trim()=="") return null;
    await sendMessage({text:input.trim()})
    setInput("")

  }

  const handleSendImage = async(e)=>{
    const file=e.target.files[0]
    if(!file||!file.type.startsWith("image/")){
      toast.error("Select an image file")
      return
    }

    const reader= new FileReader();
    reader.onloadend= async()=>{
      await sendMessage({image:reader.result})
      e.target.value=""
    }
    reader.readAsDataURL(file)

  }

  const handleSendVoice = async(voiceData) => {
    await sendMessage(voiceData)
  }

  const handleCameraCapture = async(captureData) => {
    if (captureData.showPreview) {
      // Show preview instead of sending directly
      setMediaPreview(captureData)
    } else {
      // Direct send (for backward compatibility)
      await sendMessage(captureData)
    }
  }

  const handleMediaSend = async(mediaData) => {
    console.log('Sending media with data:', mediaData);
    await sendMessage(mediaData)
    setMediaPreview(null)
  }

  const handleMediaCancel = () => {
    setMediaPreview(null)
  }



  useEffect(()=>{
    if(selectedUser){
      getMessages(selectedUser._id)
    }
  },[selectedUser])
  
  useEffect(()=>{
    if(scrollEnd.current && messages){
      scrollEnd.current.scrollIntoView({behavior:"smooth"})
    }   
  },[messages])

  return selectedUser? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
      {mediaPreview && (
        <MediaPreview
          mediaData={mediaPreview}
          onSend={handleMediaSend}
          onCancel={handleMediaCancel}
        />
      )}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser.profilePic || avatar} alt='' className='w-8 rounded-full' />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (<span className='w-2 h-2 rounded-full bg-green-500'>

          </span>)}
        </p>
        {showDeleteBar && selectedMessageId && (
          <div className='flex items-center gap-2'>
            <button onClick={handleDeleteForMe} className='text-xs bg-white/10 text-white px-3 py-1 rounded-full border border-white/20'>Delete for me</button>
            {(()=>{ const msg = messages.find(m=>m._id===selectedMessageId); return msg && msg.senderId===authUser._id })() && (
              <button onClick={handleDeleteForEveryone} className='text-xs bg-red-500/80 text-white px-3 py-1 rounded-full'>Delete for everyone</button>
            )}
            <button onClick={handleClearSelection} className='text-xs text-white/70 px-2'>Cancel</button>
          </div>
        )}
        <img onClick={()=>setSelectedUser(null)} src={arrow_icon} alt="" className='md:hidden max-w-7'/>
        <img src={help_icon} alt="" className='max-md:hidden max-w-5' />
      </div>

      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {messages.map((msg,index)=>(
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${msg.senderId!== authUser._id && 'flex-row-reverse'} ${selectedMessageId===msg._id ? 'bg-white/5 rounded-md' : ''}`}
            onMouseDown={()=>handleLongPressStart(msg)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onTouchStart={()=>handleLongPressStart(msg)}
            onTouchEnd={handleLongPressEnd}
          >
            {msg.image ? (
              <div className="relative">
                <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8'/>
              </div>
            ) : msg.voice ? (
              <div className={`p-2 max-w-[250px] rounded-lg mb-8 bg-violet-500/30 border border-gray-700 ${msg.senderId=== authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                <audio 
                  controls 
                  className="w-full h-8"
                  style={{filter: 'invert(1)'}}
                  preload="metadata"
                  src={msg.voice}
                >
                  Your browser does not support the audio element.
                </audio>
                <p className="text-xs text-gray-400 mt-1">Voice Message</p>
              </div>
            ) : msg.video ? (
              <div className={`p-2 max-w-[300px] rounded-lg mb-8 bg-violet-500/30 border border-gray-700 ${msg.senderId=== authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                <div className="relative">
                  <video 
                    controls 
                    className="w-full max-h-64 rounded-lg"
                    preload="metadata"
                    src={msg.video}
                  >
                    Your browser does not support the video element.
                  </video>
                </div>
                <p className="text-xs text-gray-400 mt-1">Video Message</p>
              </div>
            ) : msg.isDeletedForEveryone ? (
              <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-gray-600/40 text-gray-300 italic ${msg.senderId=== authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                This message was deleted
              </p>
            ) : (
              <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${msg.senderId=== authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                {msg.text}
              </p>
            )}
            <div className='text-center text-xs'>
              <img src={msg.senderId=== authUser._id ? authUser?.profilePic || avatar : selectedUser?.profilePic || avatar } alt="" className='w-8 rounded-full' />

              <p className='text-gray-700'>{formatMessageTime(msg.createdAt)}</p>

            </div>
          </div>
        ))}
        <div ref={scrollEnd}>

        </div>
        
      </div>

      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full '>
          <CameraCapture onCapture={handleCameraCapture} onClose={() => {}} />
          <input onChange={(e)=>setInput(e.target.value)} value={input}
          onKeyDown={(e)=>e.key==="Enter" ? handleSendMessage(e):null}
           type="text" placeholder='Send a message....' className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-white' />
          <input onChange={handleSendImage} type="file" id='image' accept="image/png , image/jpeg" hidden />
          <label htmlFor='image'>
            <img src={gallery_icon} alt="" className='w-5 mr-2 cursor-pointer' />
          </label>
        </div>

        <VoiceRecorder onSendVoice={handleSendVoice} />

        <img onClick={handleSendMessage} src={send_button} alt="" className='w-7 cursor-pointer' />

      </div>
        
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
      <img src={icon} className='max-w-16' alt="" />
      <p className='text-lg font-medium text-white '>No Distance, Just Conversations</p>
    </div>
  )
}

export default Container