import express from 'express'
import { protectRoute } from '../middleware/auth.js'
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage, deleteMessageForMe, deleteMessageForEveryone } from '../controllers/messageController.js'
const messageRouter= express.Router()

messageRouter.get("/users",protectRoute,getUsersForSidebar)
messageRouter.get("/:id",protectRoute,getMessages)
messageRouter.put("/mark/:id",protectRoute,markMessageAsSeen)
messageRouter.post("/send/:id",protectRoute,sendMessage)
messageRouter.delete("/delete/me/:id",protectRoute,deleteMessageForMe)
messageRouter.delete("/delete/everyone/:id",protectRoute,deleteMessageForEveryone)

export default messageRouter;