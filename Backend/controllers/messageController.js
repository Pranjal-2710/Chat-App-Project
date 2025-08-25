import Message from "../models/Messages.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../server.js";
import { userSocketMap } from "../server.js";
import User from "../models/User.js";
// Get all users except logged in user
export const getUsersForSidebar= async(req,res)=>{
    try{
        const userId= req.user._id;
        const filteredUsers= await User.find({_id:{$ne:userId}}).select("-password")

        //Count number of unseen messages , current user is the receiver id because he is receiving messages 
        const unseenMessages={}
        const promises= filteredUsers.map(async (user)=>{
            const messages= await Message.find({senderId:user._id, receiverId:userId, seen:false})
            if(messages.length>0){
                unseenMessages[user._id]=messages.length
            }
        })

        await Promise.all(promises)
        res.json({
            success:true,
            users:filteredUsers,
            unseenMessages
        })
        
    }
    catch(error){
        console.log(error.message)
        res.json({
            success:false,
            message:error.message
        })
    }
}

//Get all messages for selected user

export const getMessages= async(req,res)=>{
    try{
        const {id:selectedUserId}= req.params
        const myId= req.user._id;
        let messages= await Message.find({
            $or:[
                {senderId:myId, receiverId:selectedUserId},
                {senderId:selectedUserId,receiverId:myId}
            ]
        })

        await Message.updateMany({senderId:selectedUserId, receiverId:myId},{seen:true})

        // Filter out messages deleted for me
        messages = messages.filter((msg)=>{
            const deletedForMe = Array.isArray(msg.deletedFor) && msg.deletedFor.find((u)=> String(u)===String(myId))
            return !deletedForMe
        })

        // Transform messages to tombstone if flagged or is tombstone
        messages = messages.map((msg)=>{
            if(msg.isTombstone || msg.deletedForEveryoneAt){
                return {
                    ...msg.toObject(),
                    text: null,
                    image: null,
                    voice: null,
                    video: null,
                    isDeletedForEveryone: true
                }
            }
            return msg
        })

        res.json({
            success:true,
            messages
        })
    }
    catch(error){
        console.log(error.message)
        res.json({
            success:false,
            message:error.message
        })
    }
}

//api to mark message a seen using message id

export const markMessageAsSeen= async(req,res)=>{
    try {
        const {id}= req.params
        await Message.findByIdAndUpdate(id,{seen:true})
        res.json({
            success:true
        })
    } catch (error) {
        console.log(error.message)
        res.json({
            success:false,
            message:error.message
        })
    }
}



// Send message to selected user

export const sendMessage = async(req,res)=>{
    try {
        const {text,image,voice,video}=req.body
        const receiverId= req.params.id;
        const senderId= req.user._id;
        let imageUrl;
        let imagePublicId;
        let voiceUrl;
        let voicePublicId;
        let videoUrl;
        let videoPublicId;
        
        if(image){
            const uploadResponse= await cloudinary.uploader.upload(image);
            imageUrl=uploadResponse.secure_url;
            imagePublicId=uploadResponse.public_id;
        }

        if(voice){
            try {
                const uploadResponse= await cloudinary.uploader.upload(voice, {
                    resource_type: "video", // Cloudinary uses "video" resource type for audio files
                    format: "mp3" // Convert to mp3 for better compatibility
                });
                voiceUrl=uploadResponse.secure_url;
                voicePublicId=uploadResponse.public_id;
            } catch (cloudinaryError) {
                console.error('Cloudinary upload error:', cloudinaryError);
                throw new Error('Failed to upload voice message');
            }
        }

        if(video){
            try {
                const uploadResponse= await cloudinary.uploader.upload(video, {
                    resource_type: "video", // Video resource type
                    format: "mp4" // Convert to mp4 for better compatibility
                });
                videoUrl=uploadResponse.secure_url;
                videoPublicId=uploadResponse.public_id;
            } catch (cloudinaryError) {
                console.error('Cloudinary video upload error:', cloudinaryError);
                throw new Error('Failed to upload video message');
            }
        }

        const newMessage= await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            imagePublicId,
            voice: voiceUrl,
            voicePublicId,
            video: videoUrl,
            videoPublicId
        })

        //Emit new message to the receiver's socket
        const receiverSocketId= userSocketMap[receiverId]
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.json({
            success:true,
            newMessage
        })


    } catch (error) {
        console.log(error.message)
        res.json({
            success:false,
            message:error.message
        })
    }
}

// Delete for me (soft delete for the requesting user)
export const deleteMessageForMe = async(req,res)=>{
    try{
        const {id:messageId} = req.params
        const myId = req.user._id
        const message = await Message.findById(messageId)
        if(!message){
            return res.json({success:false, message:"Message not found"})
        }
        // Only participants can delete for me
        if(String(message.senderId)!==String(myId) && String(message.receiverId)!==String(myId)){
            return res.json({success:false, message:"Not allowed"})
        }
        const updated = await Message.findByIdAndUpdate(messageId, { $addToSet: { deletedFor: myId } }, { new: true })
        return res.json({success:true, message:"Deleted for me"})
    }catch(error){
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// Delete for everyone (tombstone + Cloudinary cleanup)
export const deleteMessageForEveryone = async(req,res)=>{
    try{
        const {id:messageId} = req.params
        const myId = req.user._id
        const message = await Message.findById(messageId)
        if(!message){
            return res.json({success:false, message:"Message not found"})
        }
        // Only sender can delete for everyone
        if(String(message.senderId)!==String(myId)){
            return res.json({success:false, message:"Only sender can delete for everyone"})
        }

        // Perform Cloudinary deletions if present
        const deletions = []
        if(message.imagePublicId){
            deletions.push(cloudinary.uploader.destroy(message.imagePublicId, { resource_type: "image" }))
        }
        if(message.voicePublicId){
            deletions.push(cloudinary.uploader.destroy(message.voicePublicId, { resource_type: "video" }))
        }
        if(message.videoPublicId){
            deletions.push(cloudinary.uploader.destroy(message.videoPublicId, { resource_type: "video" }))
        }
        if(deletions.length){
            try{ await Promise.all(deletions) }catch(e){ console.error("Cloudinary delete error", e) }
        }

        // Create lightweight tombstone message
        const tombstone = await Message.create({
            senderId: message.senderId,
            receiverId: message.receiverId,
            isTombstone: true,
            originalMessageId: message._id,
            deletedForEveryoneAt: new Date()
        })

        // Remove original message permanently
        await Message.findByIdAndDelete(messageId)

        // Notify receiver if online
        const receiverId = String(message.receiverId)
        const receiverSocketId= userSocketMap[receiverId]
        if(receiverSocketId){
            io.to(receiverSocketId).emit("messageDeletedForEveryone", { messageId, tombstone })
        }
        // Also notify sender's other sessions
        const senderSocketId = userSocketMap[String(myId)]
        if(senderSocketId){
            io.to(senderSocketId).emit("messageDeletedForEveryone", { messageId, tombstone })
        }

        return res.json({success:true, message:"Deleted for everyone", tombstoneId: tombstone._id})
    }catch(error){
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}