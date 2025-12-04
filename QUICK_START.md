# Quick Start - Telegraph AI Agent

## 🚀 Get Running in 5 Minutes

### 1. Install Everything
```bash
npm run install:all
```

### 2. Get FREE API Key (Optional but Recommended)

Go to: **https://makersuite.google.com/app/apikey**

Click "Create API Key" and copy it.

### 3. Add API Key

Create `server/.env`:
```bash
GEMINI_API_KEY=your_key_here
```

### 4. Start Servers

**Terminal 1:**
```bash
cd server
npm start
```

**Terminal 2:**
```bash
cd client
npm run dev
```

### 5. Open Browser

Go to: **http://localhost:5173**

## 📡 How to Use

1. **Click and hold** the telegraph key button
2. **Quick tap** (under 200ms) = dot
3. **Long hold** (200ms+) = dash  
4. **Pause 1 second** between letters
5. **Click "Send Transmission"**

## 🎯 Try These

**Easy:**
- "HI" = `.... ..`
- "SOS" = `... --- ...`

**Fun (Test AI):**
- "EMAIL ME" - AI gets confused!
- "CALL ME" - AI doesn't know phones!

## 📚 Documentation

- **SETUP_GUIDE.md** - Detailed setup instructions
- **MCP_INTEGRATION_GUIDE.md** - How to use MCP with Kiro
- **DEMO_MCP_USAGE.md** - How to demo MCP to judges
- **HACKATHON_SUBMISSION.md** - Full project overview
- **README.md** - Complete documentation

## 🏆 For Hackathon Judges

This project demonstrates:
- ✅ 10+ Kiro features integrated
- ✅ Custom MCP tool implementation
- ✅ 18 property-based tests
- ✅ Unique concept (first AI telegraph)
- ✅ Production-ready code

See **HACKATHON_SUBMISSION.md** for full details.

## ❓ Need Help?

- Check **SETUP_GUIDE.md** for troubleshooting
- Run `npm test` to verify everything works
- Check server terminal for errors
- Make sure both servers are running

Enjoy! 📡✨
