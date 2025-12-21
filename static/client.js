const socket = io();

// DOM Elements
const joinSection = document.getElementById('join-section');
const joinForm = document.getElementById('join-form');
const chatSection = document.getElementById('chat-section');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');
const messageContainer = document.getElementById('message-container');
const emojiPicker = document.getElementById('emoji-picker');
const emojiToggle = document.querySelector('.emoji-toggle');
const roomNameElement = document.getElementById('room-name');
const userInfoElement = document.getElementById('user-info');
const leaveBtn = document.getElementById('leave-btn');
const usersList = document.getElementById('users-list');
const userCountElement = document.getElementById('user-count');

// State
let username = '';
let room = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  joinSection.classList.add('active');
  chatSection.classList.remove('active');
});

// Join Room Handler
joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  username = document.getElementById('username').value.trim();
  room = document.getElementById('room').value.trim();
  
  if (!username || !room) {
    showError('Please enter both name and room code');
    return;
  }
  
  // Emit join room event
  socket.emit('join room', { username, room });
  
  // Update UI
  joinSection.classList.remove('active');
  chatSection.classList.add('active');
  roomNameElement.textContent = `Room: ${room}`;
  userInfoElement.textContent = `👤 ${username}`;
  messageInput.focus();
});

// Leave Room Handler
leaveBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to leave the room?')) {
    location.reload();
  }
});

// Send Message Handler
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const message = messageInput.value.trim();
  
  if (!message) {
    showError('Please enter a message');
    return;
  }
  
  socket.emit('chat message', {
    room,
    username,
    message,
    type: 'text',
  });
  
  messageInput.value = '';
  messageInput.focus();
});

// Socket Events - Receive Messages
socket.on('old messages', (msgs) => {
  msgs.forEach((msg) => {
    displayMessage(msg);
  });
  scrollToBottom();
});

socket.on('chat message', (msg) => {
  displayMessage(msg);
  scrollToBottom();
});

socket.on('message deleted', (data) => {
  const messageElement = document.querySelector(`[data-message-id="${data.message_id}"]`);
  if (messageElement) {
    messageElement.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => messageElement.remove(), 300);
  }
});

socket.on('error', (data) => {
  showError(data.message);
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  showError('Connection lost. Attempting to reconnect...');
});

// Socket Events - Update Room Users
socket.on('update room users', (data) => {
  updateUsersList(data.users);
  userCountElement.textContent = data.count;
});

function updateUsersList(users) {
  // Clear the list
  usersList.innerHTML = '';
  
  // Add each user to the list
  users.forEach((user) => {
    const li = document.createElement('li');
    li.textContent = `👤 ${user}`;
    
    // Highlight current user
    if (user === username) {
      li.classList.add('own');
      li.textContent = `👤 ${user} (You)`;
    }
    
    usersList.appendChild(li);
  });
}

// Display Message Function
function displayMessage(msg) {
  const li = document.createElement('li');
  li.setAttribute('data-message-id', msg.id || msg.rowid);
  li.classList.add('message');
  
  // Determine message class
  if (msg.type === 'system') {
    li.classList.add('system');
  } else if (msg.username === username) {
    li.classList.add('own');
  }
  
  // Create message content container
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('message-content');
  
  // Add username (except for own messages and system messages)
  if (msg.username !== username && msg.type !== 'system') {
    const usernameDiv = document.createElement('div');
    usernameDiv.classList.add('message-username');
    usernameDiv.textContent = msg.username;
    contentDiv.appendChild(usernameDiv);
  }
  
  // Create message bubble
  const bubbleDiv = document.createElement('div');
  bubbleDiv.classList.add('message-bubble');
  bubbleDiv.textContent = msg.message || msg.type;
  
  contentDiv.appendChild(bubbleDiv);
  
  // Add delete button for own messages
  if (msg.username === username && msg.type !== 'system') {
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('message-actions');
    
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn-delete');
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.addEventListener('click', () => {
      if (confirm('Delete this message?')) {
        socket.emit('delete message', {
          message_id: msg.id || msg.rowid,
          room,
          username,
        });
      }
    });
    
    actionsDiv.appendChild(deleteBtn);
    contentDiv.appendChild(actionsDiv);
  }
  
  li.appendChild(contentDiv);
  messages.appendChild(li);
  
  // Auto-remove system messages after animation completes (3.5 seconds)
  if (msg.type === 'system') {
    setTimeout(() => {
      if (li.parentNode) {
        li.remove();
      }
    }, 3500);
  }
}

// Emoji Picker
emojiToggle.addEventListener('click', (e) => {
  e.preventDefault();
  emojiPicker.classList.toggle('active');
});

// Emoji Selection
document.querySelectorAll('.emoji-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const emoji = btn.getAttribute('data-emoji');
    addEmojiToInput(emoji);
    emojiPicker.classList.remove('active');
  });
});

function addEmojiToInput(emoji) {
  const start = messageInput.selectionStart;
  const end = messageInput.selectionEnd;
  const before = messageInput.value.substring(0, start);
  const after = messageInput.value.substring(end);
  
  messageInput.value = before + emoji + after;
  messageInput.selectionStart = messageInput.selectionEnd = start + emoji.length;
  messageInput.focus();
}

// Close emoji picker when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.chat-input-area')) {
    emojiPicker.classList.remove('active');
  }
});

// Utility Functions
function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.classList.add('error-message');
  errorDiv.textContent = '❌ ' + message;
  
  messageContainer.insertBefore(errorDiv, messages);
  
  setTimeout(() => {
    errorDiv.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => errorDiv.remove(), 300);
  }, 4000);
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.classList.add('success-message');
  successDiv.textContent = '✅ ' + message;
  
  messageContainer.insertBefore(successDiv, messages);
  
  setTimeout(() => {
    successDiv.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => successDiv.remove(), 300);
  }, 3000);
}

// Add fade out animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
`;
document.head.appendChild(style);
