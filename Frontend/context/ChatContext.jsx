import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./Auth";
import toast from "react-hot-toast";
export const ChatContext= createContext()


export const ChatProvider=({children})=>{
    const [messages,setMessages]=useState([])
    const [users,setUsers]=useState([])
    const [selectedUser,setSelectedUser]=useState(null)
    const [unseenMessages,setUnseenMessages]=useState({})

    const{socket,axios,authUser}=useContext(AuthContext)

    //function to get all users for sidebar
    const getUsers= async()=>{
        try {
           const {data}= await axios.get("/api/messages/users")
           if(data.success){
            setUsers(data.users)
            setUnseenMessages(data.unseenMessages)

           }

        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to get messages for selected user
    const getMessages= async(userId)=>{
        try {
            const {data}= await axios.get(`/api/messages/${userId}`)
            if(data.success){
                setMessages(data.messages)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to send message to selected user
    const sendMessage= async(messageData)=>{
        try {
            const {data}=await axios.post(`/api/messages/send/${selectedUser._id}`,messageData)
            if(data.success){
                setMessages((previousMessages)=> [...previousMessages,data.newMessage])
            }
            else{
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.message)
        }
    }

    // delete for me
    const deleteForMe = async(messageId)=>{
        try{
            const {data} = await axios.delete(`/api/messages/delete/me/${messageId}`)
            if(data.success){
                setMessages((prev)=> prev.filter((m)=> m._id !== messageId))
            }else{
                toast.error(data.message)
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    // delete for everyone
    const deleteForEveryone = async(messageId)=>{
        try{
            const {data} = await axios.delete(`/api/messages/delete/everyone/${messageId}`)
            if(data.success){
                setMessages((prev)=> prev.map((m)=> m._id===messageId ? { ...m, text:null, image:null, voice:null, video:null, isDeletedForEveryone:true } : m))
            }else{
                toast.error(data.message)
            }
        }catch(error){
            toast.error(error.message)
        }
    }



    //function to subscribe to messages for selected user
    const subscribeToMessages =async()=>{
        if(!socket) return;
        socket.on("newMessage",(newMessage)=>{
            if(selectedUser && newMessage.senderId===selectedUser._id){
                newMessage.seen=true;
                setMessages((prevMessages)=>[...prevMessages,newMessage])
                axios.put(`/api/messages/mark/${newMessage._id }`)
            }
            else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages,[newMessage.senderId] : 
                    prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId]+1 : 1
                }))
            }
        })

        socket.on("messageDeletedForEveryone", ({messageId})=>{
            setMessages((prev)=> prev.map((m)=> m._id===messageId ? { ...m, text:null, image:null, voice:null, video:null, isDeletedForEveryone:true } : m))
        })
    }

    //function to unsubscribe from messages

    const unsubscribeFromMessages=()=>{
        if(socket){
            socket.off("newMessage")
            socket.off("messageDeletedForEveryone")
        }
    }

    useEffect(()=>{
        subscribeToMessages();
        return ()=> unsubscribeFromMessages()
    },[socket,selectedUser])

    const value={
        messages,
        users,
        selectedUser,
        getUsers,
        getMessages,
        sendMessage,
        deleteForMe,
        deleteForEveryone,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages
    }
    return(
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}