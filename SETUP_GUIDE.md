# Quick Setup Guide - Telegraph AI Agent

## Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Install all dependencies (root, client, and server)
npm run install:all
```

### Step 2: Get FREE Google Gemini API Key

Google Gemini is **completely free** and works great for this project!

1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy your API key

### Step 3: Configure the Server

Create a file called `.env` in the `server/` folder:

```bash
# server/.env
GEMINI_API_KEY=paste_your_api_key_here
```

**Example:**
```bash
GEMINI_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 4: Start the Application

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Step 5: Open in Browser

Go to: http://localhost:5173

## Testing the AI Operator

### Without API Key
If you don't add an API key, the operator will simply echo your messages back. This is fine for testing the Morse code functionality!

### With API Key (Recommended)
With a Gemini API key, the AI operator will:
- Respond intelligently to your messages
- Stay in character as an 1865 telegraph operator
- Get confused by modern concepts (try saying "email me"!)
- Use authentic telegram format (UPPERCASE with "STOP")

## How to Use the Telegraph

### Basic Usage

1. **Click and hold** the Telegraph Key button
2. **Release quickly** (under 200ms) for a dot (.)
3. **Hold longer** (200ms+) for a dash (-)
4. **Pause** for 1 second between letters
5. **Click "Send Transmission"** when done

### Try These Messages

**Easy (Beginner):**
- "HI" - Tap-tap-tap-tap (pause) Tap-tap
- "SOS" - Tap-tap-tap (pause) Hold-hold-hold (pause) Tap-tap-tap

**Medium:**
- "HELLO" - Takes about 30 seconds to tap out
- "HELP" - Good practice message

**Fun (Test the AI):**
- "EMAIL ME" - AI gets confused about email!
- "CALL ME" - AI doesn't know what a phone is!
- "GOOGLE IT" - AI has no idea what Google is!

## Morse Code Cheat Sheet

### Common Letters
- **E** = . (one tap)
- **T** = - (one hold)
- **S** = ... (three taps)
- **O** = --- (three holds)
- **A** = .- (tap, hold)
- **I** = .. (two taps)
- **N** = -. (hold, tap)

### Full Alphabet
```
A .-    B -...  C -.-.  D -..   E .     F ..-.
G --.   H ....  I ..    J .---  K -.-   L .-..
M --    N -.    O ---   P .--.  Q --.-  R .-.
S ...   T -     U ..-   V ...-  W .--   X -..-
Y -.--  Z --..
```

## Troubleshooting

### "Telegraph Line Down" Error
- Make sure the backend server is running (Terminal 1)
- Check that it's on port 3001
- Look for errors in the server terminal

### AI Not Responding Intelligently
- Check that you added the GEMINI_API_KEY to `server/.env`
- Restart the server after adding the key
- Check the server terminal for API errors

### Morse Code Not Decoding
- Make sure you pause for 1 second between letters
- The system needs the pause to know when a letter is complete
- Try tapping slower and more deliberately

### Audio Not Playing
- Check your browser's audio permissions
- Make sure your volume is up
- Try clicking the telegraph key - you should hear a beep

## Using MCP with Kiro

If you're using Kiro IDE, you can enable the MCP telegraph tool:

1. Create `.kiro/settings/mcp.json`:
```json
{
  "mcpServers": {
    "telegraph-line": {
      "command": "node",
      "args": ["server/mcp-telegraph-tool.js"],
      "disabled": false,
      "autoApprove": ["transmit_telegram"]
    }
  }
}
```

2. Restart Kiro

3. Now you can ask Kiro's AI: "Use the telegraph tool to send HELLO"

See `MCP_INTEGRATION_GUIDE.md` for detailed MCP usage.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only property-based tests
npm run test:properties
```

## Project Structure

```
telegraph-ai-agent/
├── client/              # React frontend
│   ├── src/
│   │   ├── App.jsx                 # Main app
│   │   ├── TelegraphKey.jsx        # Telegraph input
│   │   ├── DisplayManager.jsx      # UI display
│   │   └── AudioEngine.js          # Audio playback
│   └── package.json
├── server/              # Node.js backend
│   ├── index.js                    # API server
│   ├── operator-persona.js         # AI integration
│   ├── mcp-telegraph-tool.js       # MCP tool
│   └── package.json
├── shared/              # Shared code
│   └── morse-lib.js                # Morse encoder/decoder
└── tests/               # Test suites
    ├── properties/                 # Property-based tests
    └── integration/                # Integration tests
```

## Next Steps

1. **Learn Morse Code**: Start with simple letters (E, T, S, O)
2. **Test the AI**: Try asking about modern technology
3. **Read the Docs**: Check out `MCP_INTEGRATION_GUIDE.md`
4. **Run the Tests**: See the property-based testing in action
5. **Extend It**: Add new features or integrate with other systems

## Need Help?

- Check `README.md` for detailed documentation
- See `MCP_INTEGRATION_GUIDE.md` for MCP usage
- Look at `HACKATHON_SUBMISSION.md` for project overview
- Run `npm test` to verify everything works

## Why This Project is Cool

1. **Historical + Modern**: Combines 1865 telegraph tech with 2024 AI
2. **Educational**: Learn Morse code interactively
3. **Unique**: No other AI telegraph simulators exist
4. **Well-Tested**: 18 property-based tests prove correctness
5. **Extensible**: API-first design, MCP integration, clean architecture

Enjoy communicating like it's 1865! 📡
