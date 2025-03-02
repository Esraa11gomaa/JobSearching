import * as dbService from '../../../DB/dbService.js'
import { successResponse } from './../../../utils/response/success.response.js'
import chatModel from "../../../DB/model/Chat.model.js"
import userModel from "../../../DB/model/User.model.js"
import { AsyncHandeler } from "../../../utils/response/error.response.js"


//  GET Chat History with a Specific User
export const getChatHistory = AsyncHandeler(async (req, res, next) => {
    const { userId } = req.params
    const currentUserId = req.user._id

    const chat =await dbService.findOne({
        model: chatModel,
        filter:{participants: { $all: [currentUserId, userId] }}
    }).populate("messages.senderId", "firstname lastname email")
   
    if (!chat) {
        return next(new Error("No chat history found." ,{cause:404})) 
    }

    return successResponse({res, status: 200 ,message:"Chat history fetched.", data:{chat}})
  
})

//Only HR or Company Owner Can Start a Conversation
export const startChat = AsyncHandeler(async (req, res, next) => {

    const { receiverId } = req.body
    const senderId = req.user._id

    const sender = await dbService.findById({model: userModel, id:senderId})
    const receiver = await dbService.findById({model: userModel, id:receiverId})

    if (!sender || !receiver) {
        return next(new Error("User not found." , {cause: 404}))
    }

    // Check if sender is HR or Company Owner
    if (!sender.role.includes("HR") && !sender.role.includes("CompanyOwner")) {
        return next(new Error("Only HR or Company Owner can start a conversation." , {cause: 403}))
    }

    let chat = await dbService.findOne({
        model: chatModel,
        filter:{participants: { $all: [senderId, receiverId]}}
    })

    if (!chat) {
        chat = new chatModel({ participants: [senderId, receiverId], messages: [] })
        await chat.save()
    }

    return successResponse({res, message:"Chat started." , data: {chat}})
})
