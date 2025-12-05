# Telegraph AI Agent

A web-based application that resurrects the 1844 Morse code protocol as a modern interface for communicating with AI language models. Users interact with an AI agent that assumes the persona of a 19th-century telegraph operator, communicating exclusively through Morse code with authentic audio feedback.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Morse Code Reference](#morse-code-reference)
- [How to Use](#how-to-use)
- [Example Transmissions](#example-transmissions)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Kiro Integration](#kiro-integration)
- [Technology Stack](#technology-stack)

## 🌟 Unique Value Proposition

### Educational & Historical Preservation
- **Learn Morse Code Interactively**: Hands-on learning with real-time feedback
- **Preserve Telegraph History**: Experience authentic 1865 communication protocols
- **Accessible to All**: No prior Morse code knowledge required
- **Gamified Learning**: Progress from simple letters (E, T) to complex messages

### Technical Innovation
- **AI + Historical Tech**: First-of-its-kind fusion of 1865 telegraph with modern AI
- **Authentic Audio**: Real 600Hz telegraph tones using Web Audio API
- **Timing-Based Input**: Natural interaction - tap rhythm creates Morse code
- **Property-Based Correctness**: 18 mathematical properties ensure accuracy

### Extensibility & Scalability
- **Educational Platform**: Can be extended for schools and museums
- **API-First Design**: RESTful backend enables mobile apps, IoT devices
- **MCP Integration**: Other AI agents can communicate via telegraph
- **Multi-Language Support**: Morse code is universal - easy to internationalize

### Market Differentiation
- **No Competition**: No other AI telegraph simulators exist
- **Niche Appeal**: Ham radio operators, history enthusiasts, educators
- **Viral Potential**: Unique concept perfect for social media demos
- **Museum Integration**: Ready for interactive exhibits

## Features

- **Telegraph Key Interface**: Tap out Morse code using timing-based input detection (< 200ms = dot, ≥ 200ms = dash)
- **Audio Feedback**: Authentic 600Hz telegraph tones using Web Audio API
- **Real-Time Display**: See your dots and dashes appear instantly, with automatic character decoding
- **AI Operator Persona**: Communicate with an AI that responds as a 19th-century Western Union telegraph operator (powered by Google Gemini)
- **Period-Accurate Styling**: Sepia tones, typewriter fonts, and paper textures for historical immersion
- **Morse Audio Playback**: Hear AI responses transmitted back in authentic Morse code
- **Kiro MCP Integration**: AI communication through the Telegraph Line tool
- **Property-Based Testing**: Comprehensive correctness validation using fast-check (18 properties)
- **Transmission History**: Log of all messages sent and received
- **Error Handling**: Period-appropriate error messages ("TELEGRAPH LINE DOWN STOP")

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with Web Audio API support
- Google Gemini API key (optional but recommended - FREE at https://makersuite.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd telegraph-ai-agent

# Install all dependencies (root, client, and server)
npm run install:all
```

### Configuration

**Optional: Enable Real AI Responses**

Create a `.env` file in the `server/` directory:

```bash
# server/.env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your FREE Gemini API key at: https://makersuite.google.com/app/apikey

Without an API key, the operator will echo your messages. With an API key, you get intelligent contextual responses in character!

### Running the Application

```bash
# Terminal 1 - Start the backend server
npm run dev:server

# Terminal 2 - Start the frontend client
npm run dev:client
```

The application will be available at `http://localhost:5173` (client) with the API server running on `http://localhost:3001`.

**Note**: The AI operator works in two modes:
- **With Gemini API key**: Intelligent, contextual responses in character (FREE!)
- **Without API key**: Simple echo responses (still demonstrates all features)

## Morse Code Reference

### ITU International Morse Code

#### Letters
```
A  .-      B  -...    C  -.-.    D  -..     E  .       F  ..-.
G  --.     H  ....    I  ..      J  .---    K  -.-     L  .-..
M  --      N  -.      O  ---     P  .--.    Q  --.-    R  .-.
S  ...     T  -       U  ..-     V  ...-    W  .--     X  -..-
Y  -.--    Z  --..
```

#### Numbers
```
0  -----   1  .----   2  ..---   3  ...--   4  ....-
5  .....   6  -....   7  --...   8  ---..   9  ----.
```

#### Punctuation
```
.  .-.-.-  (period)      ,  --..--  (comma)
?  ..--..  (question)    '  .----.  (apostrophe)
!  -.-.--  (exclamation) /  -..-.   (slash)
(  -.--.   (open paren)  )  -.--.-  (close paren)
&  .-...   (ampersand)   :  ---...  (colon)
;  -.-.-.  (semicolon)   =  -...-   (equals)
+  .-.-.   (plus)        -  -....-  (hyphen)
_  ..--.-  (underscore)  "  .-..-.  (quote)
$  ...-..- (dollar)      @  .--.-.  (at sign)
```

### Timing Rules

- **Dot**: 1 unit (100ms)
- **Dash**: 3 units (300ms)
- **Gap between dots/dashes**: 1 unit (100ms)
- **Gap between characters**: 3 units (300ms)
- **Gap between words**: 7 units (700ms)

### Input Timing

- **Press < 200ms**: Registers as a dot (.)
- **Press ≥ 200ms**: Registers as a dash (-)
- **Pause > 800ms**: Triggers character break and decoding

## How to Use

### Sending a Message

1. **Click and hold** the Telegraph Key button to start transmitting
2. **Release quickly** (< 200ms) for a dot
3. **Hold longer** (≥ 200ms) for a dash
4. **Pause** (> 800ms) to complete a character
5. Watch your dots/dashes appear in real-time
6. See decoded characters appear after each character break
7. Click **"Send Transmission"** when your message is complete

### Receiving a Response

1. The AI operator processes your message
2. The response plays back as Morse code audio
3. Watch the dots and dashes appear during playback
4. The decoded text appears after playback completes

### Tips for Beginners

- Start with simple letters: **E** (.), **T** (-), **S** (...), **O** (---)
- Practice the timing: tap quickly for dots, hold for dashes
- Don't worry about mistakes - you can clear and start over
- The AI operator is patient and will respond to any valid transmission

## Example Transmissions

### Example 1: Simple Greeting

**Your Input**: `HELLO`
```
Morse: .... . .-.. .-.. ---
Timing: Tap-tap-tap-tap (pause) tap (pause) tap-hold-tap-tap (pause) tap-hold-tap-tap (pause) hold-hold-hold
```

**AI Response**: `HELLO STOP OPERATOR STANDING BY STOP`
```
Morse: .... . .-.. .-.. --- STOP --- .--. . .-. .- - --- .-. STOP ...
```

### Example 2: Question

**Your Input**: `WHAT TIME`
```
Morse: .-- .... .- - / - .. -- .
W: hold-tap-hold
H: tap-tap-tap-tap
A: tap-hold
T: hold
(space)
T: hold
I: tap-tap
M: hold-hold
E: tap
```

**AI Response**: `TIME IS 1430 HOURS STOP`

### Example 3: SOS (Emergency)

**Your Input**: `SOS`
```
Morse: ... --- ...
S: tap-tap-tap
O: hold-hold-hold
S: tap-tap-tap
```

**AI Response**: `SOS RECEIVED STOP HELP DISPATCHED STOP`

### Example 4: Testing Modern Concepts

**Your Input**: `EMAIL ME`

**AI Response**: `WHAT IN TARNATION IS EMAIL STOP SEND TELEGRAM STOP`

The operator stays in character and expresses confusion about anachronistic terms!

## Project Structure

```
telegraph-ai-agent/
├── client/                      # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx             # Main application component
│   │   ├── TelegraphKey.jsx    # Input component for Morse code
│   │   ├── DisplayManager.jsx  # UI rendering and display
│   │   ├── AudioEngine.js      # Web Audio API integration
│   │   ├── styles/
│   │   │   └── telegraph.css   # Period-accurate styling
│   │   ├── main.jsx            # React entry point
│   │   └── test-setup.js       # Test configuration
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                      # Node.js + Express backend
│   ├── index.js                # API server and routes
│   ├── mcp-telegraph-tool.js   # MCP tool implementation
│   ├── operator-persona.js     # AI persona logic
│   └── package.json
├── shared/                      # Isomorphic code
│   └── morse-lib.js            # Morse Engine (text ↔ Morse ↔ timing)
├── tests/
│   ├── properties/             # Property-based tests (fast-check)
│   │   ├── morse-engine.property.test.js
│   │   ├── telegraph-key.property.test.js
│   │   ├── audio-engine.property.test.js
│   │   ├── display-manager.property.test.js
│   │   ├── backend-api.property.test.js
│   │   ├── mcp-telegraph-tool.property.test.js
│   │   ├── operator-persona.property.test.js
│   │   └── response-playback.property.test.js
│   └── integration/            # Integration tests
│       ├── user-flow.test.js
│       └── ai-flow.test.js
├── .kiro/
│   ├── specs/                  # Feature specifications
│   │   └── telegraph-ai-agent/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   ├── steering/               # AI steering rules
│   │   └── operator-persona.md
│   └── hooks/                  # Development hooks
│       └── validate-transmission.yaml
├── package.json                # Root package.json
└── vitest.config.js           # Vitest configuration
```

## Development

### Running in Development Mode

```bash
# Install dependencies
npm run install:all

# Terminal 1 - Backend server with hot reload
npm run dev:server

# Terminal 2 - Frontend with Vite HMR
npm run dev:client
```

### Available Scripts

```bash
# Install all dependencies
npm run install:all

# Development
npm run dev:client          # Start frontend dev server
npm run dev:server          # Start backend dev server

# Testing
npm test                    # Run all tests once
npm run test:watch          # Run tests in watch mode
npm run test:properties     # Run only property-based tests
npm run test:integration    # Run only integration tests

# Building
npm run build:client        # Build frontend for production
```

## Testing

The Telegraph AI Agent uses a comprehensive testing strategy combining unit tests, property-based tests, and integration tests.

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run only property-based tests
npm run test:properties

# Run only integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

### Property-Based Testing

The project includes 18 correctness properties validated using **fast-check**:

1. **Morse Engine Round-Trip Preservation**: Text → Morse → Text preserves content
2. **Timing Threshold Accuracy**: < 200ms = dot, ≥ 200ms = dash
3. **Character Break Detection**: > 800ms pause triggers character decoding
4. **Audio State Synchronization**: Audio plays only when key is pressed
5. **Input Display Immediacy**: Dots/dashes appear instantly
6. **Valid Morse Decoding**: Valid sequences decode to correct characters
7. **Invalid Sequence Handling**: Invalid sequences handled gracefully
8. **Transmission Buffer Reset**: Buffer clears after sending
9. **ITU Character Coverage**: All ITU characters supported
10. **Backend Response Completeness**: Responses include both Morse and text
11. **Morse Timing Array Correctness**: Timing follows ITU rules (1:3:7 ratios)
12. **Playback Completion Display**: Text displays after audio completes
13. **Response Uppercase Enforcement**: All AI responses are uppercase
14. **Response Brevity Optimization**: Responses ≤ 20 words
15. **Period Replacement**: Periods replaced with "STOP"
16. **MCP Tool Text Acceptance**: Tool accepts all text input
17. **MCP Timing Array Format**: Valid timing arrays generated
18. **Typewriter Font Application**: UI uses typewriter fonts

Each property test runs 100+ iterations with randomly generated inputs.

### Test Organization

- **Unit Tests**: Co-located with source files (`*.test.js`, `*.test.jsx`)
- **Property Tests**: `tests/properties/*.property.test.js`
- **Integration Tests**: `tests/integration/*.test.js`

## 🏆 Kiroween Hackathon - Resurrection Category

This project demonstrates the **resurrection of 1865 telegraph technology** through modern AI, showcasing deep integration with Kiro's development platform. Built entirely using Kiro's features for the Kiroween Hackathon.

### Why "Resurrection"?

We've brought back the lost art of Morse code telegraph communication and merged it with cutting-edge AI technology. Users experience authentic 1865 telegraph operation while communicating with an AI that maintains historical accuracy and period-appropriate responses.

## Kiro Integration

The Telegraph AI Agent showcases **extensive Kiro feature usage** across the entire development lifecycle:

### MCP Telegraph Line Tool

The project includes a custom MCP tool that enables AI agents to transmit messages through the telegraph system.

**Configuration**: `.kiro/mcp/telegraph.json`

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

**Tool Usage**: The AI can invoke `transmit_telegram` with text, and receive back:
- Morse code representation
- Timing array for audio playback
- Formatted response ready for transmission

### Operator Persona Steering

The AI automatically adopts a 19th-century telegraph operator persona through steering rules.

**File**: `.kiro/steering/operator-persona.md`

**Key Behaviors**:
- **Uppercase only**: All responses in capital letters
- **Word economy**: Maximum 20 words per response
- **STOP for periods**: Authentic telegram protocol
- **Historical accuracy**: Confusion about modern concepts
- **Professional tone**: Formal 1860s business communication

**Example Transformations**:
- "Hello, how are you?" → "HELLO STOP HOW ARE YOU STOP"
- "I received your message." → "MESSAGE RECEIVED STOP"
- "Can you email me?" → "WHAT IS EMAIL STOP SEND TELEGRAM STOP"

### Development Hooks

**File**: `.kiro/hooks/validate-transmission.yaml`

Automatically validates code for period-accurate terminology on file save:
- Detects `console.log`, `alert`, `debugger`
- Warns about anachronistic terms
- Maintains historical immersion

### Kiro Features Demonstrated

This project showcases **10+ Kiro capabilities** used throughout development:

#### 1. **Spec-Driven Development** 
- Complete feature specification in `.kiro/specs/telegraph-ai-agent/`
- EARS-compliant requirements with acceptance criteria
- Detailed design document with 18 correctness properties
- Task breakdown with property-based test requirements

#### 2. **AI Steering Rules**
- Custom operator persona in `.kiro/steering/operator-persona.md`
- Automatically applied to all AI interactions
- Enforces 1865 telegraph operator character
- Maintains historical accuracy and brevity

#### 3. **MCP (Model Context Protocol) Integration**
- Custom MCP server: `server/mcp-telegraph-tool.js`
- Telegraph Line tool for AI-to-Morse translation
- Configuration in `.kiro/mcp/telegraph.json`
- Enables AI agents to transmit via Morse code

#### 4. **Development Hooks**
- Automatic validation on file save
- Code quality checks for period-accurate terminology
- Prevents anachronistic terms in codebase
- Configuration in `.kiro/hooks/validate-transmission.yaml`

#### 5. **Property-Based Testing Strategy**
- 18 correctness properties using fast-check
- Validates Morse encoding/decoding round-trips
- Tests timing thresholds and audio synchronization
- Ensures ITU Morse code standard compliance

#### 6. **AI-Assisted Development**
- Used Kiro AI for component generation
- Iterative refinement with AI feedback
- Test generation and debugging assistance
- Documentation writing support

#### 7. **Integrated Testing Workflow**
- Vitest integration with Kiro test runner
- Real-time test feedback during development
- Property tests + unit tests + integration tests
- Coverage reporting

#### 8. **Code Organization & Structure**
- Monorepo structure (client/server/shared)
- ES modules throughout
- Isomorphic Morse engine
- Clean separation of concerns

#### 9. **Development Experience**
- Hot module replacement (HMR) with Vite
- Fast feedback loops
- Integrated terminal for server/client
- Seamless debugging

#### 10. **Documentation-Driven Development**
- Comprehensive README with examples
- API documentation
- Demo scripts for presentations
- AI demo automation guide

### Using with Kiro

1. **Open the project** in Kiro
2. **Specs** guide feature development with AI assistance
3. **Steering rules** automatically apply operator persona
4. **MCP tool** enables AI-to-telegraph communication
5. **Hooks** validate code quality on save
6. **Tests** run automatically with property-based validation
7. **AI chat** helps debug and extend features

## Technology Stack

### Frontend
- **React 18**: Component-based UI
- **Vite**: Fast development and HMR
- **Web Audio API**: Authentic telegraph tones (600Hz sine wave)
- **CSS3**: Period-accurate styling with sepia tones and typewriter fonts

### Backend
- **Node.js**: JavaScript runtime
- **Express**: REST API server
- **MCP Protocol**: AI tool integration

### Shared
- **ES Modules**: Isomorphic Morse Engine used by both client and server

### Testing
- **Vitest**: Fast unit test runner
- **fast-check**: Property-based testing library
- **@testing-library/react**: React component testing

### Development Tools
- **Kiro MCP**: AI tool integration
- **Kiro Steering**: AI persona enforcement
- **Kiro Hooks**: Code validation automation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React + Vite)                    │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Telegraph Key  │  │ Audio Engine │  │ Display Manager │ │
│  │   Component    │  │ (Web Audio)  │  │   (Sepia UI)    │ │
│  └────────┬───────┘  └──────┬───────┘  └────────┬────────┘ │
│           │                  │                    │          │
│           └──────────────────┴────────────────────┘          │
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
                               │ HTTP/REST
┌──────────────────────────────┼───────────────────────────────┐
│                              │                               │
│                    Server (Node.js/Express)                  │
│  ┌────────────────┐  ┌──────┴───────┐  ┌─────────────────┐ │
│  │  Morse Engine  │  │  API Routes  │  │  MCP Telegraph  │ │
│  │  (Translator)  │  │   Handler    │  │   Line Tool     │ │
│  └────────┬───────┘  └──────┬───────┘  └────────┬────────┘ │
│           │                  │                    │          │
│           └──────────────────┴────────────────────┘          │
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
                               │ MCP Protocol
                               │
                    ┌──────────▼──────────┐
                    │   AI Agent (LLM)    │
                    │  + Operator Persona │
                    │  + Steering Rules   │
                    └─────────────────────┘
```

## Contributing

This project was built using spec-driven development with Kiro. The complete specification is available in `.kiro/specs/telegraph-ai-agent/`:

- `requirements.md`: EARS-compliant requirements with acceptance criteria
- `design.md`: Detailed design with 18 correctness properties
- `tasks.md`: Implementation plan with property-based test tasks

## License

MIT

## Acknowledgments

- ITU Morse Code standard
- Western Union telegraph operators of the 1860s
- Web Audio API specification
- fast-check property-based testing library