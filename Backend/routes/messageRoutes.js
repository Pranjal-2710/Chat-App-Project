import express from 'express'
import { protectRoute } from '../middleware/auth.js'
import { getMessages, getUsersForSidebar, markMessageAsSeen, markViewOnceAsViewed, sendMessage } from '../controllers/messageController.js'
const messageRouter= express.Router()

messageRouter.get("/users",protectRoute,getUsersForSidebar)
messageRouter.get("/:id",protectRoute,getMessages)
messageRouter.put("/mark/:id",protectRoute,markMessageAsSeen)
messageRouter.put("/view-once/:id",protectRoute,markViewOnceAsViewed)
messageRouter.post("/send/:id",protectRoute,sendMessage)

export default messageRouter;