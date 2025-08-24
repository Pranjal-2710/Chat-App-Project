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
const Container = () => {

  const {messages,selectedUser,setSelectedUser,sendMessage, getMessages}= useContext(ChatContext)
  const {authUser, onlineUsers}= useContext(AuthContext)

  const scrollEnd=useRef()

  const [input,setInput]= useState('')

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
    console.log('Sending voice message:', voiceData);
    await sendMessage(voiceData)
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
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser.profilePic || avatar} alt='' className='w-8 rounded-full' />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (<span className='w-2 h-2 rounded-full bg-green-500'>

          </span>)}
        </p>
        <img onClick={()=>setSelectedUser(null)} src={arrow_icon} alt="" className='md:hidden max-w-7'/>
        <img src={help_icon} alt="" className='max-md:hidden max-w-5' />
      </div>

      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {messages.map((msg,index)=>(
          <div key={index} className={`flex items-end gap-2 justify-end ${msg.senderId!== authUser._id && 'flex-row-reverse'}`}>
            {msg.image ? (
              <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8
              '/>
            ) : msg.voice ? (
              <div className={`p-2 max-w-[250px] rounded-lg mb-8 bg-violet-500/30 border border-gray-700 ${msg.senderId=== authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                {console.log('Rendering voice message with URL:', msg.voice?.slice(0, 100) + '...')}
                {console.log('Voice message exists:', !!msg.voice)}
                {console.log('Voice URL type:', typeof msg.voice)}
                <audio 
                  controls 
                  className="w-full h-8"
                  style={{filter: 'invert(1)'}}
                  preload="metadata"
                  src={msg.voice}
                  onError={(e) => {
                    console.error('Audio error:', e);
                    console.error('Audio src:', e.target.src);
                  }}
                  onLoadStart={() => console.log('Audio loading started')}
                  onCanPlay={() => console.log('Audio can play')}
                >
                  Your browser does not support the audio element.
                </audio>
                <p className="text-xs text-gray-400 mt-1">Voice Message ({Math.round((msg.voice?.length || 0) / 1024)}KB)</p>
              </div>
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