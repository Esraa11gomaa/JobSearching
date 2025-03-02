import { Router } from "express"
import { authentication } from './../../middleware/auth.middlware.js'
import * as chatService from './service/chat.service.js'
import * as validators from './chat.validation.js'
import { validation } from "../../middleware/validation.middlware.js"

const router = Router()

router.get("/:userId", validation(validators.getChatHistory) ,authentication, chatService.getChatHistory)
router.post("/start", validation(validators.startChat) ,authentication, chatService.startChat)


export default router
