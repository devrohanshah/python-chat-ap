# ChatHub Architecture & Technical Documentation

## 🏗️ System Architecture Diagram

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│                    (Client Side)                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              BROWSER (index.html)                    │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ HTML Structure  │  CSS Styling  │  JavaScript │  │  │
│  │  │ - Forms         │  - Gradients  │  - Events   │  │  │
│  │  │ - Messages      │  - Animations │  - Listeners│  │  │
│  │  │ - Emoji Picker  │  - Responsive │  - Handlers │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │              Socket.IO Client Library               │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓↑                                  │
│                    WebSocket (TCP)                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
              ┌─────────────────────────────────────┐
              │  NETWORK LAYER (HTTP/WebSocket)    │
              └─────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                         │
│                    (Server Side)                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           FLASK APPLICATION (app.py)                │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  Route Handlers                              │   │  │
│  │  │  - GET /                                     │   │  │
│  │  │  - POST /api/...                            │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  Socket.IO Event Handlers                    │   │  │
│  │  │  - @socketio.on('join room')                │   │  │
│  │  │  - @socketio.on('chat message')             │   │  │
│  │  │  - @socketio.on('delete message')           │   │  │
│  │  │  - @socketio.on('disconnect')               │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  Business Logic Layer                        │   │  │
│  │  │  - Room Management                           │   │  │
│  │  │  - Message Broadcasting                      │   │  │
│  │  │  - User Validation                           │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  Database Access Layer                       │   │  │
│  │  │  - get_db_connection()                       │   │  │
│  │  │  - SQL Queries                               │   │  │
│  │  │  - Transaction Management                    │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
              ┌─────────────────────────────────────┐
              │   SQL Queries (TCP Port 3306)      │
              └─────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                               │
│                  (SQLite Database)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              TABLES & RELATIONSHIPS                 │  │
│  │  ┌────────────────────┐  ┌──────────────────────┐  │  │
│  │  │  USERS TABLE       │  │  MESSAGES TABLE      │  │  │
│  │  ├────────────────────┤  ├──────────────────────┤  │  │
│  │  │ username (PK)      │  │ id (PK)              │  │  │
│  │  │ created_at         │  │ room                 │  │  │
│  │  │                    │  │ username (FK)        │  │  │
│  │  │                    │  │ message              │  │  │
│  │  │                    │  │ type                 │  │  │
│  │  │                    │  │ content              │  │  │
│  │  │                    │  │ timestamp            │  │  │
│  │  └────────────────────┘  └──────────────────────┘  │  │
│  │           ↑                                         │  │
│  │      One-to-Many Relationship                      │  │
│  │    (One user has many messages)                    │  │
│  │                                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Database File: .render/chat.db (SQLite3)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Message Flow Diagram

### User Sends Message

```
┌─────────────┐
│  User A     │
│  (Browser)  │
└─────┬───────┘
      │
      │ 1. Type message & click Send
      │
      ▼
┌──────────────────────────────────────────┐
│  Client JavaScript (client.js)           │
│  ✓ Validate message                      │
│  ✓ Emit Socket Event: 'chat message'    │
└────────┬─────────────────────────────────┘
         │
         │ 2. WebSocket Event
         │ {room, username, message}
         │
         ▼
┌──────────────────────────────────────────┐
│  Server (app.py)                         │
│  ✓ Handle Socket Event                  │
│  ✓ Validate Data                        │
└────────┬─────────────────────────────────┘
         │
         │ 3. Insert into Database
         │
         ▼
┌──────────────────────────────────────────┐
│  SQLite Database                         │
│  INSERT INTO messages (...)              │
│  VALUES (room, username, message, ...)  │
└────────┬─────────────────────────────────┘
         │
         │ 4. Message ID returned
         │
         ▼
┌──────────────────────────────────────────┐
│  Server (app.py)                         │
│  ✓ Broadcast to room                    │
│  emit('chat message', data, to=room)    │
└────────┬─────────────────────────────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
    ┌─────────────┐                    ┌──────────────┐
    │  User A     │                    │  User B      │
    │  (Browser)  │ ← WebSocket Event │  (Browser)   │
    │  Receive    │  'chat message'   │  Receive     │
    │  Message    │◄───────────────────│  Message     │
    └─────────────┘                    └──────────────┘
         │                                     │
         ▼                                     ▼
    Display on Right              Display on Left
    (Own Message)                 (Other's Message)
```

---

## 🔄 Real-time Communication Flow

### WebSocket Connection Lifecycle

```
CLIENT                          SERVER
  │                               │
  │──────────┐                    │
  │ Connect  │                    │
  │──────────┘                    │
  │                               │
  │───────────── WebSocket ───────────────►
  │              Connection       │
  │                               │
  │◄────────── Connected ─────────
  │            Response           │
  │                               │
  │─ emit('join room') ──────────►
  │  {username, room}             │
  │                               ├─ join_room()
  │                               ├─ Load old messages
  │◄────── old messages ──────────┤
  │  (history)                    ├─ Emit to room
  │                               │
  │◄────── system message ────────┤
  │  "User joined"                │
  │                               │
  │─ emit('chat message') ───────►
  │  {message, room, ...}         │
  │                               ├─ Insert to DB
  │                               ├─ Broadcast
  │◄────── chat message ──────────┤
  │  (to all in room)             │
  │                               │
  │─ emit('delete message') ──────►
  │  {message_id}                 │
  │                               ├─ Validate owner
  │                               ├─ Delete from DB
  │                               ├─ Broadcast delete
  │◄────── message deleted ───────┤
  │                               │
  │ ... continuous connection ... │
  │                               │
  │────── Disconnect ─────────────►
  │                               ├─ Clean up
  │ (or network error)            │
  │                               │
```

---

## 🔗 Component Interaction Diagram

```
┌────────────────────────────────────────────────────────────┐
│                  FRONTEND COMPONENTS                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ JOIN SECTION                                        │  │
│  │ - Username Input                                    │  │
│  │ - Room Input                                        │  │
│  │ - Join Button → emit 'join room'                   │  │
│  └─────────────────┬──────────────────────────────────┘  │
│                    │                                      │
│                    ▼                                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ CHAT SECTION                                        │  │
│  │                                                     │  │
│  │ ┌──────────────────────────────────────────────┐   │  │
│  │ │ HEADER                                       │   │  │
│  │ │ - Room Name                                  │   │  │
│  │ │ - User Badge                                 │   │  │
│  │ │ - Leave Button                               │   │  │
│  │ └──────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  │ ┌──────────────────────────────────────────────┐   │  │
│  │ │ MESSAGE CONTAINER                            │   │  │
│  │ │ - Displays all messages                       │   │  │
│  │ │ - Own messages (right, blue)                 │   │  │
│  │ │ - Other's messages (left, white)             │   │  │
│  │ │ - System messages (center, gray)             │   │  │
│  │ │ - Media messages (images/videos)             │   │  │
│  │ │ - Delete buttons on hover                    │   │  │
│  │ └──────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  │ ┌──────────────────────────────────────────────┐   │  │
│  │ │ INPUT AREA                                   │   │  │
│  │ │ - Message Input                              │   │  │
│  │ │ - File Upload (📎)                           │   │  │
│  │ │ - Emoji Toggle (😊)                          │   │  │
│  │ │ - Send Button                                │   │  │
│  │ └──────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  │ ┌──────────────────────────────────────────────┐   │  │
│  │ │ EMOJI PICKER (Hidden until toggled)          │   │  │
│  │ │ - Grid of 10 emojis                          │   │  │
│  │ │ - Click to insert                            │   │  │
│  │ └──────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
                           ▲
                           │ Socket Events
                           │
┌────────────────────────────────────────────────────────────┐
│                   BACKEND COMPONENTS                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ SOCKET.IO SERVER                                     │ │
│  │                                                      │ │
│  │ ┌────────────────────────────────────────────────┐  │ │
│  │ │ Event: connect                                │  │ │
│  │ │ → Log connection                              │  │ │
│  │ └────────────────────────────────────────────────┘  │ │
│  │                                                      │ │
│  │ ┌────────────────────────────────────────────────┐  │ │
│  │ │ Event: join room                              │  │ │
│  │ │ → join_room(room)                             │  │ │
│  │ │ → Save user to DB                             │  │ │
│  │ │ → Fetch old messages                          │  │ │
│  │ │ → Emit old messages                           │  │ │
│  │ │ → Notify room                                 │  │ │
│  │ └────────────────────────────────────────────────┘  │ │
│  │                                                      │ │
│  │ ┌────────────────────────────────────────────────┐  │ │
│  │ │ Event: chat message                           │  │ │
│  │ │ → Validate data                               │  │ │
│  │ │ → Insert to DB                                │  │ │
│  │ │ → Get message ID                              │  │ │
│  │ │ → Broadcast to room                           │  │ │
│  │ └────────────────────────────────────────────────┘  │ │
│  │                                                      │ │
│  │ ┌────────────────────────────────────────────────┐  │ │
│  │ │ Event: delete message                         │  │ │
│  │ │ → Validate owner                              │  │ │
│  │ │ → Delete from DB                              │  │ │
│  │ │ → Broadcast deletion                          │  │ │
│  │ └────────────────────────────────────────────────┘  │ │
│  │                                                      │ │
│  │ ┌────────────────────────────────────────────────┐  │ │
│  │ │ Event: disconnect                             │  │ │
│  │ │ → Log disconnection                           │  │ │
│  │ └────────────────────────────────────────────────┘  │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                           ▲                               │
│                           │ SQL Queries                   │
│                           │                               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ DATABASE ACCESS LAYER                               │ │
│  │ - get_db_connection()                               │ │
│  │ - init_db()                                         │ │
│  │ - dict_from_row()                                   │ │
│  └──────────────────────────────────────────────────────┘ │
│                           ▲                               │
│                           │                               │
└───────────────────────────┼───────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │    SQLite Database                │
        │  (.render/chat.db)                │
        │                                   │
        │  - MESSAGES TABLE                 │
        │  - USERS TABLE                    │
        └───────────────────────────────────┘
```

---

## 🔐 Data Flow Security

### Message Validation Pipeline

```
Client Input
    │
    ▼
┌─────────────────────────────────────┐
│ CLIENT-SIDE VALIDATION              │
│ ✓ Check if message is empty         │
│ ✓ Validate file type (image/video)  │
│ ✓ Check file size (< 50MB)          │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ EMIT SOCKET EVENT                   │
│ {room, username, message, ...}      │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ SERVER-SIDE VALIDATION              │
│ ✓ Check required fields exist       │
│ ✓ Validate room code format         │
│ ✓ Validate username length          │
│ ✓ Check message type                │
│ ✓ Parameterized SQL queries         │
│   (prevents SQL injection)          │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ DATABASE INSERT                     │
│ INSERT INTO messages (...)          │
│ VALUES (?, ?, ?, ?, ?)             │
│ Parameterized to prevent injection  │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ BROADCAST TO ROOM                   │
│ emit('chat message', data, to=room) │
│ Only to room members, not all users │
└─────────────────────────────────────┘
```

---

## 📈 Scalability Architecture (Future)

### Current vs. Production Setup

#### Current (First Semester)
```
┌────────────┐
│  Client 1  │
└──────┬─────┘
       │
       ▼
┌─────────────────┐
│  Flask Server   │
│  (Single)       │
└────────┬────────┘
         │
         ▼
┌──────────────┐
│  SQLite DB   │
└──────────────┘
```

#### Production (Phase 4)
```
┌────────┐  ┌────────┐  ┌────────┐
│Client 1│  │Client 2│  │Client 3│
└───┬────┘  └───┬────┘  └───┬────┘
    │          │          │
    └──────────┼──────────┘
               │
        ┌──────▼─────────┐
        │ Load Balancer  │
        │ (Nginx)        │
        └──────┬─────────┘
               │
        ┌──────┴──────┐
        │             │
   ┌────▼────┐  ┌────▼────┐
   │ Flask 1 │  │ Flask 2 │ ← Multiple servers
   └────┬────┘  └────┬────┘
        │             │
        └──────┬──────┘
               │
        ┌──────▼─────────┐
        │ Redis Cache    │
        │ (Session)      │
        └──────┬─────────┘
               │
        ┌──────▼─────────┐
        │ PostgreSQL DB  │
        │ (Cluster)      │
        └────────────────┘
```

---

## 🧮 Database Query Examples

### 1. Insert Message
```python
cursor.execute('''
    INSERT INTO messages (room, username, message, type, content)
    VALUES (?, ?, ?, ?, ?)
''', (room, username, message, type, content))
# Uses parameterized query to prevent SQL injection
```

### 2. Fetch Old Messages
```python
cursor.execute('''
    SELECT id, username, message, type, content, timestamp
    FROM messages
    WHERE room = ?
    ORDER BY timestamp
''', (room,))
old_messages = [dict(row) for row in cursor.fetchall()]
```

### 3. Validate Message Owner
```python
cursor.execute(
    'SELECT username FROM messages WHERE id = ?',
    (message_id,)
)
row = cursor.fetchone()
if row and row['username'] == username:
    # User is owner, allow deletion
```

### 4. Delete Message
```python
cursor.execute(
    'DELETE FROM messages WHERE id = ?',
    (message_id,)
)
```

---

## 🎯 Socket.IO Event Lifecycle

### Complete Event Flow Example

**Scenario: User A sends "Hello!" to room1**

```
TIME    CLIENT (User A)         NETWORK         SERVER              DATABASE
────────────────────────────────────────────────────────────────────────────

T0      Type "Hello!"
        Click Send

T1      ✓ Validate
        ✓ Emit event
                            ──► emit event ──►
                                             ✓ Receive event
                                             ✓ Validate data

T2                                           ✓ Get connection
                                             ✓ Insert to DB
                                                                   INSERT INTO
                                                                  messages (...)

T3                                           ✓ Get message ID
                                             ✓ Broadcast to room

T4      ◄─── broadcast ◄──────────────────────
        ✓ Receive
        ✓ Display right

T5      (Other users in room1)
        ◄─── broadcast ◄──────────────────────
        ✓ Receive
        ✓ Display left

T6      All messages synced in room1
```

---

## 🔄 State Management Flow

### Client State

```
Application State (client.js)
├── username (string)
│   └── Set when: User joins room
│   └── Used for: Message author, ownership validation
│
├── room (string)
│   └── Set when: User joins room
│   └── Used for: Sending to correct room, room identification
│
└── DOM Elements (cached)
    ├── joinSection (element)
    ├── chatSection (element)
    ├── messageInput (element)
    ├── messages (list)
    └── emojiPicker (element)
```

### Server State

```
Socket.IO Server State (app.py)
├── Active Connections
│   └── socket.sid → Client metadata
│
├── Rooms
│   ├── room1
│   │   ├── socket1 (User A)
│   │   └── socket2 (User B)
│   │
│   └── room2
│       └── socket3 (User C)
│
└── Database State
    ├── users: {username, created_at}
    └── messages: {id, room, username, message, ...}
```

---

## 📝 Code Flow Example: Sending a Message

### Client Side (JavaScript)

```javascript
// 1. User submits form
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 2. Get message from input
    const message = messageInput.value.trim();
    
    // 3. Validate
    if (!message && !file) return;
    
    // 4. Emit to server
    socket.emit('chat message', {
        room,
        username,
        message,
        type: 'text'
    });
    
    // 5. Clear input
    messageInput.value = '';
});

// 6. Listen for response
socket.on('chat message', (msg) => {
    // 7. Display message
    displayMessage(msg);
    scrollToBottom();
});
```

### Server Side (Python)

```python
# 1. Receive event
@socketio.on('chat message')
def handle_message(data):
    # 2. Extract data
    room = data.get('room')
    username = data.get('username')
    message = data.get('message', '')
    
    # 3. Validate
    if not room or not username:
        emit('error', {'message': 'Invalid'})
        return
    
    # 4. Get database connection
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 5. Insert to database
    cursor.execute(
        '''INSERT INTO messages (room, username, message, type)
           VALUES (?, ?, ?, ?)''',
        (room, username, message, 'text')
    )
    conn.commit()
    
    # 6. Get message ID
    message_id = cursor.lastrowid
    conn.close()
    
    # 7. Broadcast to room
    emit('chat message', {
        'id': message_id,
        'username': username,
        'message': message,
        'type': 'text',
        'timestamp': datetime.now().isoformat()
    }, to=room)
```

---

## 🎨 CSS Architecture

### Design System Layers

```
Layer 1: CSS Variables (Color System)
├── Primary Colors: #667eea, #764ba2
├── Semantic Colors: Success, Danger, Warning
├── Shadows: sm, md, lg
└── Spacing: 8px scale

Layer 2: Reset & Base Styles
├── * { margin: 0; padding: 0; }
├── html, body { height: 100%; }
└── font-family (system fonts)

Layer 3: Layout Components
├── .app-container (flex layout)
├── .auth-container (centered form)
├── .chat-container (flex column)
├── .message-container (scroll area)
└── .chat-input-area (form layout)

Layer 4: UI Components
├── .btn (base button)
├── .btn-primary (colored button)
├── .message (message bubble)
├── .message-bubble (rounded container)
└── .emoji-picker (dropdown)

Layer 5: Responsive Rules
├── @media (max-width: 768px) - Tablet
└── @media (max-width: 480px) - Mobile
```

---

## 🔄 Testing Scenarios

### Functional Testing

**Scenario 1: Single User Chat**
```
1. User A opens app
2. Enters "Alice" as username, "room1" as room
3. Sees "Alice has joined the room"
4. Types "Hello"
5. Sees message on right (own message)
✓ PASS: Single user message display works
```

**Scenario 2: Multi-User Chat**
```
1. User A opens: username="Alice", room="room1"
2. User B opens new tab: username="Bob", room="room1"
3. User A sends "Hi Bob"
4. User B sees message on left (other's message)
5. User B responds "Hi Alice"
6. User A sees message on left
✓ PASS: Multi-user sync works
```

**Scenario 3: Message Deletion**
```
1. User A sends "Test message"
2. User A hovers over message
3. Clicks "Delete" button
4. Confirms deletion
5. Message disappears for User A and User B
✓ PASS: Delete works for all users
```

**Scenario 4: Media Sharing**
```
1. User A clicks 📎
2. Selects image file
3. Image appears in message bubble
4. User B can see image
✓ PASS: Media sharing works
```

---

## 📱 Responsive Design Breakpoints

### Mobile-First Approach

```
Mobile (< 480px)
├── Width: 95%
├── Padding: 10px
├── Font-size: Smaller
├── Button: Full width
└── Layout: Stack all elements

Tablet (481px - 768px)
├── Width: 90%
├── Padding: 15px
├── Font-size: Normal
├── Button: Auto width
└── Layout: Optimized spacing

Desktop (> 768px)
├── Width: 100%, max 900px
├── Padding: 20-24px
├── Font-size: Normal
├── Button: Auto width
└── Layout: Full design
```

---

This architecture documentation should help you understand and explain the system during your presentation! 🚀
