# Camera Features Documentation

## New Features Added

### 1. Media Preview Component
- **File**: `src/components/MediaPreview.jsx`
- **Purpose**: Shows a preview of captured photos/videos before sending
- **Features**:
  - Displays captured photo or video in a modal
  - Shows file size information
  - Toggle for "View Once" feature
  - Send and Cancel buttons
  - Modern UI with dark theme

### 2. View Once Message Component
- **File**: `src/components/ViewOnceMessage.jsx`
- **Purpose**: Handles view-once media messages
- **Features**:
  - Shows "View" button for unviewed view-once messages
  - Displays "This message was deleted" for viewed messages
  - Tracks viewed messages using localStorage (can be extended to backend)
  - Special indicators for view-once content

### 3. Updated Camera Capture
- **File**: `src/components/CameraCapture.jsx`
- **Changes**:
  - Modified to show preview instead of direct sending
  - Added `showPreview` flag to capture data
  - Maintains backward compatibility

### 4. Updated Container Component
- **File**: `src/components/Container.jsx`
- **Changes**:
  - Integrated MediaPreview component
  - Added view-once message handling
  - Updated message rendering to support view-once messages
  - Added view-once indicators on regular media messages

## How It Works

### Camera Flow
1. User clicks camera icon
2. Camera opens with photo/video capture options
3. User captures photo or video
4. **NEW**: MediaPreview modal appears showing the captured content
5. User can toggle "View Once" option
6. User clicks "Send" to send the message or "Cancel" to discard

### View Once Flow
1. Sender enables "View Once" when sending media
2. Recipient sees a special message with "View" button
3. When recipient clicks "View", the media is displayed
4. After viewing, the message shows "This message was deleted"
5. The media is marked as viewed (currently in localStorage)

## Technical Details

### State Management
- `mediaPreview` state in Container component manages preview modal
- View-once status tracked in localStorage (can be moved to backend)
- Message rendering logic updated to handle view-once messages

### Backend Integration
The view-once feature currently uses localStorage for demo purposes. For production:

1. Add `viewOnce` field to message schema
2. Add `viewedBy` array to track who has viewed the message
3. Implement API endpoints to mark messages as viewed
4. Update ViewOnceMessage component to use backend instead of localStorage

### File Structure
```
src/components/
├── CameraCapture.jsx      # Camera capture functionality
├── MediaPreview.jsx       # Preview modal for captured media
├── ViewOnceMessage.jsx    # View-once message display
└── Container.jsx          # Main chat container (updated)
```

## Usage

### For Users
1. Click the camera icon to open camera
2. Capture photo or video
3. Review the preview
4. Toggle "View Once" if desired
5. Click "Send" to send or "Cancel" to discard

### For View Once Messages
1. Messages with view-once enabled show a special indicator
2. Click "View" to see the content
3. After viewing, the message is marked as deleted
4. The content cannot be viewed again

## Future Enhancements
- Backend integration for view-once tracking
- Screenshot detection for view-once messages
- Auto-delete after viewing
- View-once for text messages
- Message expiration timers