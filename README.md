# ChatHub - Real-time Chat Application

A modern, professional real-time chat application built with **Flask** backend and **HTML/CSS/JavaScript** frontend. This project demonstrates socket-based real-time communication with a beautiful, responsive user interface.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [How to Use](#how-to-use)
- [Database Schema](#database-schema)
- [Project Concepts](#project-concepts)
- [Future Enhancements](#future-enhancements)
- [Troubleshooting](#troubleshooting)
- [Author](#author)

---

## ✨ Features

### Core Functionality
- ✅ **Real-time Chat**: Send and receive messages instantly using WebSockets
- ✅ **Multiple Rooms**: Create and join different chat rooms with custom room codes
- ✅ **User Authentication**: Simple username-based identification
- ✅ **Message Persistence**: All messages are stored in SQLite database
- ✅ **Message History**: View previous messages when joining a room
- ✅ **Delete Messages**: Users can delete their own messages
- ✅ **Media Sharing**: Share images and videos in chat
- ✅ **Emoji Support**: Interactive emoji picker with 10+ emojis
- ✅ **System Messages**: Get notified when users join/leave

### UI/UX Features
- 🎨 **Modern Design**: Beautiful gradient interface with smooth animations
- 📱 **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- ⚡ **Smooth Animations**: Message transitions and UI interactions
- 🎯 **Intuitive Interface**: Easy to understand and use
- 🌙 **Professional Color Scheme**: Purple and blue gradient theme
- ♿ **Accessibility**: Semantic HTML and keyboard navigation support

---

## 🛠 Tech Stack

### Backend
- **Flask** - Lightweight Python web framework
- **Flask-SocketIO** - Real-time bidirectional communication
- **Flask-CORS** - Cross-Origin Resource Sharing
- **SQLite3** - Lightweight database for message storage

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No dependencies, pure JS
- **Socket.IO Client** - Real-time communication library

---

## 📁 Project Structure

```
chat-app/
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── README.md                   # Project documentation
├── PRESENTATION.md             # Presentation guide
├── Procfile                    # Deployment configuration
├── templates/
│   └── index.html             # Main HTML template
├── static/
│   ├── style.css              # CSS styling
│   ├── client.js              # Client-side JavaScript
│   └── favicon.png            # App favicon
├── .render/
│   └── chat.db                # SQLite database (auto-created)
└── public/
    ├── bg.jpg                 # Background image (legacy)
    └── ...                    # Other assets
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Python 3.7 or higher** installed on your system
- **pip** (Python package manager)
- **Git** (optional, for cloning)

### Step 1: Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd chat-app

# Or download and extract the ZIP file
cd chat-app
```

### Step 2: Create a Virtual Environment (Recommended)

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- Flask (web framework)
- Flask-SocketIO (real-time communication)
- Flask-CORS (cross-origin support)
- python-socketio (WebSocket client)
- python-engineio (transport layer)

### Step 4: Verify Installation

```bash
pip list
```

You should see all the packages listed above.

---

## ▶️ Running the Application

### Start the Server

```bash
python app.py
```

You should see output similar to:
```
 * Running on http://0.0.0.0:5000
 * Debugger PIN: 123-456-789
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

Or from another device on the same network:
```
http://<your-machine-ip>:5000
```

### Stop the Server

Press `Ctrl+C` in the terminal.

---

## 📱 How to Use

### Getting Started

1. **Enter Your Name**: Type your username (max 20 characters)
2. **Enter Room Code**: Create or join a room with a custom code
3. **Click "Join Room"**: Enter the chat room

### Sending Messages

1. **Type Message**: Click the input field and type your message
2. **Send**: Click the "Send" button or press `Enter`
3. **View Message**: Your message appears on the right side

### Adding Emojis

1. **Click Emoji Button**: Click the 😊 button in the input area
2. **Select Emoji**: Choose from 10 different emojis
3. **Auto-insert**: Emoji is added to your message

### Sharing Media

1. **Click Paperclip**: Click 📎 to select an image or video
2. **Choose File**: Select from your device (images or videos)
3. **Send**: Message sends automatically with media
4. **View**: Media displays in the chat

### Managing Messages

1. **Delete Own Message**: Hover over your message and click "🗑️ Delete"
2. **Confirmation**: Confirm deletion when prompted
3. **Message Removed**: Message disappears for all users

### Leaving the Room

1. **Click "Leave"**: Click the "Leave" button in the header
2. **Confirm**: Click "OK" in the confirmation dialog
3. **Redirected**: Returns to login screen

---

## 🗄️ Database Schema

### Messages Table

```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room TEXT NOT NULL,
    username TEXT NOT NULL,
    message TEXT,
    type TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Columns:**
- `id`: Unique message identifier
- `room`: Room code where message was sent
- `username`: Sender's username
- `message`: Message text content
- `type`: Message type (text, image/*, video/*)
- `content`: Base64 encoded file content (for media)
- `timestamp`: When message was sent

### Users Table

```sql
CREATE TABLE users (
    username TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Columns:**
- `username`: Unique username
- `created_at`: Account creation timestamp

---

## 📚 Project Concepts

### 1. **WebSocket Communication**

WebSockets allow real-time bidirectional communication between client and server.

```python
# Server listens for events
@socketio.on('chat message')
def handle_message(data):
    # Process message
    emit('chat message', data, to=room)
```

```javascript
// Client sends events
socket.emit('chat message', { room, username, message });

// Client receives events
socket.on('chat message', (msg) => {
    displayMessage(msg);
});
```

### 2. **Room Management**

Users can join different rooms to have separate conversations.

```python
@socketio.on('join room')
def handle_join_room(data):
    join_room(data['room'])
    emit('chat message', {...}, to=room)
```

### 3. **Database Operations**

Messages are persisted using SQLite for durability.

```python
def get_db_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

cursor.execute('INSERT INTO messages (...) VALUES (...)', values)
conn.commit()
```

### 4. **Authentication & Authorization**

Simple username-based identification with message ownership validation.

```python
if row['username'] == username:
    # Allow deletion only if user is the owner
    cursor.execute('DELETE FROM messages WHERE id = ?', (message_id,))
```

### 5. **File Handling**

Images and videos are encoded to Base64 for storage and transmission.

```javascript
const reader = new FileReader();
reader.readAsDataURL(file);  // Converts to Base64
reader.onload = (event) => {
    socket.emit('chat message', {
        content: event.target.result
    });
};
```

---

## 🎯 Learning Outcomes

This project demonstrates:

1. **Backend Development**
   - Building REST APIs with Flask
   - Real-time communication with WebSockets
   - Database operations with SQLite
   - Error handling and validation

2. **Frontend Development**
   - DOM manipulation and event handling
   - Asynchronous programming with callbacks
   - CSS Grid and Flexbox for responsive design
   - Animation and transitions

3. **Full-Stack Integration**
   - Client-server communication
   - State management
   - Event-driven architecture
   - Data persistence

4. **Best Practices**
   - Code organization and structure
   - Error handling and user feedback
   - Security considerations
   - UI/UX design principles

---

## 🚀 Future Enhancements

### Phase 1 (Easy)
- [ ] User typing indicator ("User is typing...")
- [ ] Online user list per room
- [ ] Message timestamps display
- [ ] Dark mode toggle
- [ ] Sound notifications

### Phase 2 (Medium)
- [ ] User authentication with passwords
- [ ] Private direct messaging
- [ ] Message search functionality
- [ ] User profiles with avatars
- [ ] Message reactions/reactions

### Phase 3 (Hard)
- [ ] End-to-end encryption
- [ ] File upload to cloud storage
- [ ] Voice/video calling
- [ ] Message threading/replies
- [ ] Admin moderation tools

### Phase 4 (Deployment)
- [ ] Docker containerization
- [ ] Deploy to Heroku/Railway
- [ ] Database migration to PostgreSQL
- [ ] CDN for static files
- [ ] Redis for message caching

---

## 🐛 Troubleshooting

### Issue: "Module not found" error

**Solution:**
```bash
# Make sure virtual environment is activated
pip install -r requirements.txt
```

### Issue: Port 5000 already in use

**Solution:**
```python
# Change port in app.py
socketio.run(app, port=5001)  # Use different port
```

### Issue: Database is locked

**Solution:**
```bash
# Delete the database and restart
rm .render/chat.db
python app.py
```

### Issue: Messages not appearing

**Solution:**
1. Check browser console for JavaScript errors (F12)
2. Verify Flask server is running
3. Check that room codes match exactly
4. Try refreshing the page

### Issue: Connection lost frequently

**Solution:**
1. Check network connection
2. Reduce file size if uploading media
3. Check browser console for errors
4. Try a different browser

---

## 📖 Additional Resources

### Flask Documentation
- [Flask Official Docs](https://flask.palletsprojects.com/)
- [Flask-SocketIO Guide](https://flask-socketio.readthedocs.io/)

### JavaScript & DOM
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)

### CSS & Design
- [CSS-Tricks](https://css-tricks.com/)
- [Material Design](https://material.io/design/)

### Socket.IO
- [Socket.IO Documentation](https://socket.io/docs/)
- [Real-time Communication Guide](https://socket.io/get-started/)

---

## 📝 Code Comments Guide

The code is extensively commented to help understand each component:

- **Backend (app.py)**: Comments explain each route and socket event
- **Frontend (client.js)**: Comments describe DOM manipulation and event handling
- **Styles (style.css)**: Comments organize CSS sections by component

---

## 🎓 Assignment Tips for First Semester

1. **Understand the Flow**
   - Study how messages flow from client → server → database → all clients
   - Draw a diagram to visualize the architecture

2. **Modify & Experiment**
   - Try changing colors and styling
   - Add new emojis to the picker
   - Experiment with different room names

3. **Add Features**
   - Implement user typing indicator
   - Add online user counter
   - Create admin delete feature

4. **Test Thoroughly**
   - Test with multiple browser tabs
   - Try on mobile devices
   - Test edge cases (empty messages, large files)

5. **Document Your Work**
   - Keep track of changes made
   - Write comments for modifications
   - Create a changelog

---

## 📄 License

This project is open source and available for educational purposes.

## 👤 Author

**Rohan Shah**  
First Semester Engineering Project  
Created: December 2024

---

## 💡 Tips for Presentation

1. **Start with Demo**: Show the app working first
2. **Explain Architecture**: Use diagrams
3. **Highlight Features**: Focus on best parts
4. **Show Code**: Explain key functions
5. **Discuss Challenges**: How you overcame them
6. **Future Plans**: What you'd add next

---

## ✅ Checklist Before Submission

- [ ] Code is well-commented
- [ ] README is complete and clear
- [ ] All dependencies listed in requirements.txt
- [ ] App runs without errors
- [ ] Features work as expected
- [ ] UI is responsive and professional
- [ ] Database persists messages correctly
- [ ] Error handling is implemented
- [ ] Code follows Python best practices
- [ ] Presentation materials are ready

---

**Happy Coding! 🚀**
