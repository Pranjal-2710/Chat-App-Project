import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import { connectDB } from './lib/db.js'
import userRouter from './routes/userRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)

// Initialize socket.io server
export const io = new Server(server, {
  cors: { origin: "*" },
})

// Store online users
export const userSocketMap = {}

// helper to get socket id by userId
const getSocketId = (userId) => userSocketMap[userId]

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId
  console.log("User connected", userId)

  if (userId) {
    userSocketMap[userId] = socket.id
  }

  // Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap))

  // Forward call offer
  socket.on("call-offer", ({ to, offer, from, callType }) => {
    const targetSocketId = getSocketId(to)
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-offer", { from, offer, callType })
    }
  })

  // Forward call answer
  socket.on("call-answer", ({ to, answer }) => {
    const targetSocketId = getSocketId(to)
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-answer", { answer })
    }
  })

  // Forward ICE candidate
  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocketId = getSocketId(to)
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", { candidate })
    }
  })

  socket.on("call-declined", ({ to }) => {
    const targetSocketId = getSocketId(to)
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-declined", {})
    }
  })

  socket.on("call-ended", ({ to }) => {
    const targetSocketId = getSocketId(to)
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-ended", {})
    }
  })

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId)
    if (userId) delete userSocketMap[userId]
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
  })
})

app.use(express.json({ limit: '4mb' }))
app.use(cors())

app.use('/api/status', (req, res) => {
  res.send("Server is live")
})

app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

await connectDB()

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log("Server is running on Port: " + PORT)
})
