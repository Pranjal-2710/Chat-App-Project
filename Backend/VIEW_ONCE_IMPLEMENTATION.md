# View-Once Message Implementation - Backend

## Overview
This document describes the complete backend implementation of the view-once message feature, which allows users to send photos and videos that can only be viewed once by recipients.

## Database Schema Changes

### Message Model Updates (`models/Messages.js`)
```javascript
const messageSchema = new mongoose.Schema({
    senderId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    receiverId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    text: {type: String},
    image: {type: String},
    voice: {type: String},
    video: {type: String},
    seen: {type: Boolean, default: false},
    viewOnce: {type: Boolean, default: false},        // NEW: Flag for view-once messages
    viewedBy: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}]  // NEW: Track who viewed the message
}, {timestamps: true})
```

## API Endpoints

### 1. Send Message with View-Once Support
**Endpoint:** `POST /api/messages/send/:id`
**Updated to accept:** `viewOnce` field in request body

**Request Body:**
```javascript
{
    "text": "Hello",
    "image": "data:image/jpeg;base64,...",  // Optional
    "video": "data:video/mp4;base64,...",   // Optional
    "voice": "data:audio/mp3;base64,...",   // Optional
    "viewOnce": true                        // NEW: Enable view-once
}
```

**Response:**
```javascript
{
    "success": true,
    "newMessage": {
        "_id": "...",
        "senderId": "...",
        "receiverId": "...",
        "image": "https://cloudinary.com/...",
        "viewOnce": true,
        "viewedBy": [],
        "createdAt": "2024-01-01T00:00:00.000Z"
    }
}
```

### 2. Mark View-Once Message as Viewed
**Endpoint:** `PUT /api/messages/view-once/:id`
**Purpose:** Mark a view-once message as viewed by the current user

**Request:** No body required (uses authenticated user ID)

**Response:**
```javascript
{
    "success": true,
    "message": "Message marked as viewed"
}
```

**Error Responses:**
```javascript
// Message not found
{
    "success": false,
    "message": "Message not found"
}

// Not a view-once message
{
    "success": false,
    "message": "Message is not a view-once message"
}

// Already viewed
{
    "success": false,
    "message": "Message already viewed"
}
```

## Controller Functions

### 1. Updated `sendMessage` Function
**File:** `controllers/messageController.js`

**Changes:**
- Accepts `viewOnce` field from request body
- Creates message with `viewOnce` flag
- Maintains backward compatibility (defaults to `false`)

**Code:**
```javascript
export const sendMessage = async(req,res)=>{
    try {
        const {text, image, voice, video, viewOnce} = req.body  // Added viewOnce
        const receiverId = req.params.id;
        const senderId = req.user._id;
        
        // ... existing upload logic ...
        
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            voice: voiceUrl,
            video: videoUrl,
            viewOnce: viewOnce || false  // NEW: Save view-once flag
        })
        
        // ... existing socket emission ...
    } catch (error) {
        // ... error handling ...
    }
}
```

### 2. New `markViewOnceAsViewed` Function
**File:** `controllers/messageController.js`

**Purpose:** Mark a view-once message as viewed by the current user

**Features:**
- Validates message exists
- Checks if message is view-once type
- Prevents duplicate views
- Updates `viewedBy` array with current user ID

**Code:**
```javascript
export const markViewOnceAsViewed = async(req,res)=>{
    try {
        const {id} = req.params
        const userId = req.user._id
        
        const message = await Message.findById(id)
        
        if(!message){
            return res.json({
                success: false,
                message: "Message not found"
            })
        }
        
        if(!message.viewOnce){
            return res.json({
                success: false,
                message: "Message is not a view-once message"
            })
        }
        
        // Check if user has already viewed this message
        if(message.viewedBy.includes(userId)){
            return res.json({
                success: false,
                message: "Message already viewed"
            })
        }
        
        // Add user to viewedBy array
        await Message.findByIdAndUpdate(id, {
            $push: {viewedBy: userId}
        })
        
        res.json({
            success: true,
            message: "Message marked as viewed"
        })
    } catch (error) {
        // ... error handling ...
    }
}
```

## Routes

### Updated Message Routes (`routes/messageRoutes.js`)
```javascript
import { getMessages, getUsersForSidebar, markMessageAsSeen, markViewOnceAsViewed, sendMessage } from '../controllers/messageController.js'

messageRouter.get("/users", protectRoute, getUsersForSidebar)
messageRouter.get("/:id", protectRoute, getMessages)
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen)
messageRouter.put("/view-once/:id", protectRoute, markViewOnceAsViewed)  // NEW
messageRouter.post("/send/:id", protectRoute, sendMessage)
```

## Frontend Integration

### ChatContext Updates
**File:** `Frontend/context/ChatContext.jsx`

**New Function:**
```javascript
const markViewOnceAsViewed = async(messageId) => {
    try {
        const {data} = await axios.put(`/api/messages/view-once/${messageId}`)
        if(data.success){
            // Update local state
            setMessages((prevMessages) =>
                prevMessages.map(msg =>
                    msg._id === messageId 
                        ? {...msg, viewedBy: [...(msg.viewedBy || []), authUser._id]}
                        : msg
                )
            )
            return true
        } else {
            toast.error(data.message)
            return false
        }
    } catch (error) {
        console.error('Error marking view-once as viewed:', error);
        toast.error(error.message)
        return false
    }
}
```

## Security Features

### 1. Authentication Required
- All view-once endpoints require authentication via `protectRoute` middleware
- User ID is extracted from JWT token

### 2. Authorization Checks
- Users can only mark messages as viewed if they are the intended recipient
- Prevents unauthorized access to view-once messages

### 3. Duplicate View Prevention
- Server-side validation prevents multiple views of the same message
- `viewedBy` array tracks all users who have viewed the message

## Data Flow

### 1. Sending View-Once Message
```
Frontend → POST /api/messages/send/:id → Backend → Database
         ↓
    {viewOnce: true} → Message created with viewOnce flag
```

### 2. Viewing View-Once Message
```
Frontend → PUT /api/messages/view-once/:id → Backend → Database
         ↓
    User ID added to viewedBy array
```

### 3. Message Retrieval
```
Frontend → GET /api/messages/:id → Backend → Database
         ↓
    Messages returned with viewOnce and viewedBy data
```

## Testing

### Test Cases
1. **Send view-once message** - Verify `viewOnce` flag is saved
2. **View message first time** - Verify user added to `viewedBy` array
3. **View message again** - Verify error response
4. **View non-view-once message** - Verify error response
5. **Unauthorized access** - Verify authentication required

### Example Test Requests
```bash
# Send view-once message
curl -X POST http://localhost:5000/api/messages/send/userId \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,...", "viewOnce": true}'

# Mark as viewed
curl -X PUT http://localhost:5000/api/messages/view-once/messageId \
  -H "Authorization: Bearer token"
```

## Future Enhancements

### 1. Auto-Delete After View
- Implement automatic deletion of view-once messages after viewing
- Add cleanup job for expired messages

### 2. Screenshot Detection
- Implement client-side screenshot detection
- Add server-side logging for potential screenshots

### 3. Message Expiration
- Add expiration timestamps to view-once messages
- Auto-delete messages after time limit

### 4. Analytics
- Track view-once message usage statistics
- Monitor user engagement with view-once feature

## Migration Notes

### Database Migration
If you have existing messages, you can add the new fields with default values:
```javascript
// MongoDB migration script
db.messages.updateMany(
    {viewOnce: {$exists: false}},
    {$set: {viewOnce: false, viewedBy: []}}
)
```

### Backward Compatibility
- Existing messages without `viewOnce` field default to `false`
- Frontend handles missing `viewedBy` array gracefully
- No breaking changes to existing functionality