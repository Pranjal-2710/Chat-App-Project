import mongoose from "mongoose";

const messageSchema=new mongoose.Schema({
    senderId:{type:mongoose.Schema.Types.ObjectId, ref:"User",required:true},
    receiverId:{type:mongoose.Schema.Types.ObjectId, ref:"User",required:true},
    text:{type:String},
    image:{type:String},
    imagePublicId:{type:String},
    voice:{type:String},
    voicePublicId:{type:String},
    video:{type:String},
    videoPublicId:{type:String},
    seen:{type:Boolean, default:false},
    // Soft delete for everyone (tombstone)
    deletedForEveryoneAt:{type:Date},
    // Per-user soft delete list (delete for me)
    deletedFor:[{type:mongoose.Schema.Types.ObjectId, ref:"User"}]

},{timestamps:true})

const Message=mongoose.model("Message",messageSchema)

export default Message;