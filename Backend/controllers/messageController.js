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
        const messages= await Message.find({
            $or:[
                {senderId:myId, receiverId:selectedUserId},
                {senderId:selectedUserId,receiverId:myId}
            ]
        })

        await Message.updateMany({senderId:selectedUserId, receiverId:myId},{seen:true})

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

//api to mark view-once message as viewed
export const markViewOnceAsViewed= async(req,res)=>{
    try {
        const {id}= req.params
        const userId= req.user._id
        
        const message= await Message.findById(id)
        
        if(!message){
            return res.json({
                success:false,
                message:"Message not found"
            })
        }
        
        if(!message.viewOnce){
            return res.json({
                success:false,
                message:"Message is not a view-once message"
            })
        }
        
        // Check if user has already viewed this message
        if(message.viewedBy.includes(userId)){
            return res.json({
                success:false,
                message:"Message already viewed"
            })
        }
        
        // Add user to viewedBy array
        await Message.findByIdAndUpdate(id,{
            $push:{viewedBy:userId}
        })
        
        res.json({
            success:true,
            message:"Message marked as viewed"
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
        const {text,image,voice,video,viewOnce}=req.body
        const receiverId= req.params.id;
        const senderId= req.user._id;
        let imageUrl;
        let voiceUrl;
        let videoUrl;
        
        if(image){
            const uploadResponse= await cloudinary.uploader.upload(image);
            imageUrl=uploadResponse.secure_url;
        }

        if(voice){
            try {
                const uploadResponse= await cloudinary.uploader.upload(voice, {
                    resource_type: "video", // Cloudinary uses "video" resource type for audio files
                    format: "mp3" // Convert to mp3 for better compatibility
                });
                voiceUrl=uploadResponse.secure_url;
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
            voice: voiceUrl,
            video: videoUrl,
            viewOnce: viewOnce || false
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