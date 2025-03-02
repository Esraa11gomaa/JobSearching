import joi from 'joi'
import { generalFields } from "../../middleware/validation.middlware.js"

export const getChatHistory = joi.object({
    userId: generalFields.id.required()
})

export const startChat = joi.object({
    receiverId: generalFields.id.required()
})