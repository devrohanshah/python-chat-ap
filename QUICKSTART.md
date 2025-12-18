# Quick Start Guide - ChatHub

## ⚡ Get Running in 2 Minutes

### Windows Users

```bash
# 1. Open Command Prompt and navigate to project
cd Desktop\chat-app

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the app
python app.py
```

### macOS/Linux Users

```bash
# 1. Open Terminal and navigate to project
cd ~/Desktop/chat-app

# 2. Create virtual environment
python3 -m venv venv

# 3. Activate virtual environment
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the app
python app.py
```

---

## 🌐 Access the App

Once you see: `* Running on http://0.0.0.0:5000`

Open your browser and go to:
```
http://localhost:5000
```

---

## 🎯 First Test

1. **Open Browser Tab 1**: Enter username "Alice", room "testroom"
2. **Open Browser Tab 2**: Enter username "Bob", room "testroom"
3. **Tab 1**: Send message "Hello Bob!"
4. **Tab 2**: Message appears immediately
5. ✅ Success! Real-time chat works!

---

## 🛑 Stop the Server

Press `Ctrl+C` in the terminal

---

## ❓ Issues?

**"pip not found"**
- Try: `pip3 install -r requirements.txt`

**"Port 5000 already in use"**
- Change in app.py: `socketio.run(app, port=5001)`

**"Module not found"**
- Verify venv is activated (should see `(venv)` in terminal)
- Reinstall: `pip install -r requirements.txt --force-reinstall`

---

## 📝 Project Files Overview

```
app.py                    ← Main Python backend
requirements.txt          ← Install dependencies
README.md                 ← Full documentation
PRESENTATION.md           ← Presentation guide
QUICKSTART.md            ← This file

templates/
  └── index.html         ← Main page

static/
  ├── client.js          ← Frontend logic
  ├── style.css          ← Styling
  └── favicon.png        ← App icon

.render/
  └── chat.db            ← Auto-created database
```

---

## 🚀 You're Ready!

Enjoy your chat app! 🎉
