import express from 'express'
const userRouter= express.Router()
import { checkAuth, signup, updateProfile } from '../controllers/userController.js'
import { login } from '../controllers/userController.js'
import { protectRoute } from '../middleware/auth.js'

userRouter.post("/signup",signup)
userRouter.post("/login",login)
userRouter.put("/update-profile",protectRoute,updateProfile)
userRouter.get("/check",protectRoute,checkAuth)

export default userRouter;