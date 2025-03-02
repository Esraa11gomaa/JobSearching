import mongoose, { model, Schema, Types } from "mongoose";


const chatSchema = new Schema({

    senderId:{
        type:Types.ObjectId,
        ref:"User",
        required: true
    },
    receiverId:{
        type:Types.ObjectId,
        ref:"User",
        required: true
    },
    message:[{
        message:
        {
            type:String,
            required:true
        },
        senderId:{
            type:Types.ObjectId,
            ref:"User",
            required: true
        }
    }]
},{timestamps:true})

const chatModel = mongoose.model.Chat || model(`Chat`,
    chatSchema
) 
export default chatModel