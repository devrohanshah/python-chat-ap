from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room, rooms
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime
import json
from pathlib import Path

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
CORS(app)

# Initialize Socket.IO
socketio = SocketIO(app, cors_allowed_origins="*")

# Database configuration
DB_DIR = Path('.render')
DB_DIR.mkdir(exist_ok=True)
DB_PATH = DB_DIR / 'chat.db'

# Track active users in rooms: {room: {username: sid}}
active_users = {}

def get_db_connection():
    """Create and return database connection"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room TEXT NOT NULL,
            username TEXT NOT NULL,
            message TEXT,
            type TEXT,
            content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def dict_from_row(row):
    """Convert sqlite3.Row to dictionary"""
    return dict(row) if row else None

def get_room_users(room):
    """Get list of active users in a room"""
    return list(active_users.get(room, {}).keys())

# Initialize database on startup
init_db()

@app.route('/')
def index():
    """Serve the main index page"""
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f'Client connected: {request.sid}')
    emit('connection_response', {'data': 'Connected to server'})

@socketio.on('join room')
def handle_join_room(data):
    """Handle user joining a room"""
    username = data.get('username')
    room = data.get('room')
    
    if not username or not room:
        emit('error', {'message': 'Username and room are required'})
        return
    
    # Check if username already exists in this room
    if room in active_users and username in active_users[room]:
        emit('error', {'message': f'Username "{username}" is already in use in this room. Please choose another name.'})
        return
    
    # Initialize room if it doesn't exist
    if room not in active_users:
        active_users[room] = {}
    
    # Add user to active users
    active_users[room][username] = request.sid
    
    # Join the Socket.IO room
    join_room(room)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Insert user into database (if not exists)
    cursor.execute(
        'INSERT OR IGNORE INTO users (username) VALUES (?)',
        (username,)
    )
    conn.commit()
    
    # Retrieve old messages from database
    cursor.execute(
        '''SELECT id, username, message, type, content, timestamp 
           FROM messages WHERE room = ? ORDER BY timestamp''',
        (room,)
    )
    old_messages = [dict_from_row(row) for row in cursor.fetchall()]
    conn.close()
    
    # Send old messages to the joined user
    emit('old messages', old_messages)
    
    # Get updated list of users in room
    room_users = get_room_users(room)
    
    # Notify all users in the room (including the new user) about the join
    emit('chat message', {
        'username': 'System',
        'message': f'👤 {username} has joined the room',
        'type': 'system',
        'timestamp': datetime.now().isoformat()
    }, to=room)
    
    # Broadcast updated user list to all users in room
    emit('update room users', {
        'users': room_users,
        'count': len(room_users)
    }, to=room)
    
    print(f'{username} joined room {room}. Active users: {room_users}')

@socketio.on('chat message')
def handle_message(data):
    """Handle incoming chat message"""
    room = data.get('room')
    username = data.get('username')
    message = data.get('message', '')
    msg_type = data.get('type', 'text')
    content = data.get('content', '')
    
    if not room or not username:
        emit('error', {'message': 'Room and username are required'})
        return
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Insert message into database
    cursor.execute(
        '''INSERT INTO messages (room, username, message, type, content)
           VALUES (?, ?, ?, ?, ?)''',
        (room, username, message, msg_type, content)
    )
    conn.commit()
    
    message_id = cursor.lastrowid
    conn.close()
    
    # Broadcast message to the room
    emit('chat message', {
        'id': message_id,
        'username': username,
        'message': message,
        'type': msg_type,
        'content': content,
        'timestamp': datetime.now().isoformat()
    }, to=room)
    
    print(f'Message from {username} in {room}: {message}')

@socketio.on('delete message')
def handle_delete_message(data):
    """Handle message deletion"""
    message_id = data.get('message_id')
    room = data.get('room')
    username = data.get('username')
    
    if not message_id or not room or not username:
        emit('error', {'message': 'Invalid delete request'})
        return
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get message details
    cursor.execute(
        'SELECT username FROM messages WHERE id = ?',
        (message_id,)
    )
    row = cursor.fetchone()
    
    if row and row['username'] == username:
        # Delete the message
        cursor.execute('DELETE FROM messages WHERE id = ?', (message_id,))
        conn.commit()
        conn.close()
        
        # Notify room about deletion
        emit('message deleted', {'message_id': message_id}, to=room)
        print(f'Message {message_id} deleted by {username}')
    else:
        conn.close()
        emit('error', {'message': 'Unauthorized deletion'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    # Find which room and user disconnected
    for room in list(active_users.keys()):
        for username, sid in list(active_users[room].items()):
            if sid == request.sid:
                # Remove user from active users
                del active_users[room][username]
                
                # Notify room about the disconnect
                emit('chat message', {
                    'username': 'System',
                    'message': f'👤 {username} has left the room',
                    'type': 'system',
                    'timestamp': datetime.now().isoformat()
                }, to=room)
                
                # Get updated list of users
                room_users = get_room_users(room)
                
                # Broadcast updated user list
                emit('update room users', {
                    'users': room_users,
                    'count': len(room_users)
                }, to=room)
                
                # Clean up empty rooms
                if not active_users[room]:
                    del active_users[room]
                
                print(f'{username} left room {room}. Active users: {room_users}')
                return
    
    print(f'Client disconnected: {request.sid}')

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
