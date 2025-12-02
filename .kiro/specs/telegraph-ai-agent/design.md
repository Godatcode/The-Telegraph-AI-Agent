# Design Document

## Overview

The Telegraph AI Agent is a full-stack web application that resurrects 1844-era Morse code telegraphy as a modern AI interface. The system consists of a React frontend with Web Audio API integration, a Node.js/Express backend, and Kiro MCP tooling to enable AI communication through the telegraph protocol. The architecture simulates authentic telegraph operation including timing-based input detection, audio feedback, and a period-accurate AI operator persona that optimizes responses for "bandwidth" constraints.

## Architecture

### System Components

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

### Technology Stack

- **Frontend**: React 18+ with Vite for fast development and HMR
- **Audio**: Web Audio API (OscillatorNode for sine wave generation)
- **Backend**: Node.js with Express for REST API
- **Shared Logic**: ES modules for Morse translation (isomorphic code)
- **AI Integration**: Kiro MCP for tool-based AI communication
- **Development**: Kiro Hooks for code validation, Kiro Steering for persona enforcement

## Components and Interfaces

### Frontend Components

#### TelegraphKey Component

The primary input interface that captures user interactions and converts them to Morse code.

**Props Interface:**
```typescript
interface TelegraphKeyProps {
  onDotDash: (symbol: '.' | '-') => void;
  onCharacterBreak: () => void;
  onTransmissionComplete: (morse: string) => void;
}
```

**State Management:**
- `isPressed`: boolean tracking key state
- `pressStartTime`: timestamp for duration calculation
- `currentSequence`: accumulated dots and dashes
- `lastInputTime`: timestamp for detecting character breaks

**Key Methods:**
- `handleMouseDown()`: Starts timer and audio tone
- `handleMouseUp()`: Calculates duration, determines dot/dash, stops audio
- `checkForBreaks()`: Monitors timing to detect character boundaries
- `sendTransmission()`: Packages complete message for backend

#### AudioEngine Component

Manages Web Audio API for generating telegraph tones.

**Interface:**
```typescript
interface AudioEngine {
  startTone(frequency: number): void;
  stopTone(): void;
  playMorseSequence(timing: number[]): Promise<void>;
}
```

**Implementation Details:**
- Uses `AudioContext` with `OscillatorNode`
- Frequency: 600Hz sine wave (authentic telegraph tone)
- Timing array format: `[duration_ms, silence_ms, ...]`
- Dot duration: 100ms (standard unit)
- Dash duration: 300ms (3x dot)
- Inter-element gap: 100ms
- Character gap: 300ms (3x dot)
- Word gap: 700ms (7x dot)

#### DisplayManager Component

Renders the period-accurate UI with real-time feedback.

**Visual Specifications:**
- Color scheme: Sepia tones (#704214, #F4E8D0, #8B7355)
- Typography: "Courier Prime" or "Special Elite" (typewriter fonts)
- Background: Paper texture with subtle grain
- Layout: Centered telegraph key, message display above, response area below

**State Display:**
- Current Morse sequence (dots and dashes)
- Decoded characters as they complete
- Transmission history
- AI response playback status

### Backend Components

#### API Routes

**POST /api/send-telegram**

Request:
```json
{
  "morse_sequence": ".... . .-.. .-.. ---"
}
```

Response:
```json
{
  "reply_morse": ".... .. STOP",
  "reply_text": "HI STOP",
  "timing_array": [100, 100, 100, 100, 100, 300, ...]
}
```

Error Handling:
- 400: Invalid Morse sequence
- 500: AI service unavailable
- 503: MCP tool failure

#### Morse Engine

The core translation library shared between client and server.

**API:**
```javascript
// Text to Morse
textToMorse(text: string): string
// Returns: ".... . .-.. .-.. ---"

// Morse to Text
morseToText(morse: string): string
// Returns: "HELLO"

// Morse to Timing Array
morseToTiming(morse: string): number[]
// Returns: [100, 100, 100, 100, 100, 300, ...]
```

**Character Mapping:**
- Supports A-Z, 0-9, and punctuation (. , ? ' ! / ( ) & : ; = + - _ " $ @)
- Uses standard ITU Morse code mappings
- Case-insensitive input, uppercase output
- Space character maps to word gap (7 units)

**Error Handling:**
- Unknown characters: Replace with error marker or skip
- Malformed sequences: Return partial decode with error flag
- Empty input: Return empty string

## Data Models

### Transmission Model

```typescript
interface Transmission {
  id: string;
  timestamp: number;
  morse: string;
  text: string;
  sender: 'user' | 'operator';
  timingArray?: number[];
}
```

### MorseCharacter Model

```typescript
interface MorseCharacter {
  char: string;
  morse: string;
  timing: number[];
}
```

### AudioTiming Model

```typescript
interface AudioTiming {
  type: 'tone' | 'silence';
  duration: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Morse Engine Round-Trip Preservation

*For any* valid text string containing ITU-supported characters, converting to Morse code and then back to text should produce an equivalent uppercase version of the original string.

**Validates: Requirements 4.1, 4.2, 5.2, 5.4**

### Property 2: Timing Threshold Accuracy

*For any* key press duration, durations less than 200ms should register as dots and durations of 200ms or greater should register as dashes.

**Validates: Requirements 1.1, 1.2**

### Property 3: Character Break Detection

*For any* pause duration greater than 800ms following Morse input, the system should interpret it as a character break and trigger character decoding.

**Validates: Requirements 1.3**

### Property 4: Audio State Synchronization

*For any* key press event, the audio tone should be active if and only if the key is currently pressed.

**Validates: Requirements 1.4, 1.5**

### Property 5: Input Display Immediacy

*For any* dot or dash input, the symbol should appear in the display buffer before the next input can be registered.

**Validates: Requirements 2.1**

### Property 6: Valid Morse Decoding

*For any* valid Morse character sequence, when a character break occurs, the decoded character should match the ITU standard mapping.

**Validates: Requirements 2.2**

### Property 7: Invalid Sequence Handling

*For any* Morse sequence that does not map to a valid ITU character, the system should indicate an error state without crashing.

**Validates: Requirements 2.3, 4.3**

### Property 8: Transmission Buffer Reset

*For any* transmission sent to the backend, the input buffer should be empty immediately after the send operation completes.

**Validates: Requirements 2.4**

### Property 9: ITU Character Coverage

*For any* character in the ITU Morse code standard (A-Z, 0-9, and standard punctuation), the Morse Engine should have a valid mapping in both directions.

**Validates: Requirements 4.4**

### Property 10: Backend Response Completeness

*For any* AI response, the backend should return both a morse_sequence field and a reply_text field, and they should be equivalent when decoded/encoded.

**Validates: Requirements 5.5**

### Property 11: Morse Timing Array Correctness

*For any* Morse code sequence, the generated timing array should follow ITU timing rules: dots are 1 unit (100ms), dashes are 3 units (300ms), inter-element gaps are 1 unit, character gaps are 3 units, and word gaps are 7 units.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

### Property 12: Playback Completion Display

*For any* Morse response playback, the decoded text should be displayed only after the audio sequence completes.

**Validates: Requirements 6.5**

### Property 13: Response Uppercase Enforcement

*For any* AI-generated response text, all alphabetic characters should be uppercase.

**Validates: Requirements 7.1**

### Property 14: Response Brevity Optimization

*For any* AI response, the word count should not exceed a reasonable telegram length threshold (e.g., 20 words for standard queries).

**Validates: Requirements 7.2, 10.3**

### Property 15: Period Replacement

*For any* AI response containing sentence-ending punctuation, periods should be replaced with the word "STOP".

**Validates: Requirements 7.3**

### Property 16: MCP Tool Text Acceptance

*For any* text input provided to the Telegraph Line MCP tool, the tool should successfully process it without errors.

**Validates: Requirements 8.1**

### Property 17: MCP Timing Array Format

*For any* timing array generated by the Telegraph Line MCP tool, it should be a valid array of positive integers representing millisecond durations.

**Validates: Requirements 8.3, 8.4**

### Property 18: Typewriter Font Application

*For any* text element rendered in the UI, the computed font-family should include a typewriter-style font.

**Validates: Requirements 3.2**

## Error Handling

### Input Validation Errors

**Invalid Morse Sequences:**
- Detection: Sequences that don't match any ITU character after character break
- Handling: Display error indicator, preserve partial input, allow user to continue or clear
- User Feedback: Visual highlight of problematic sequence

**Timing Anomalies:**
- Detection: Extremely short presses (< 10ms) or system lag causing timing drift
- Handling: Ignore sub-threshold inputs, apply timing correction algorithms
- User Feedback: No feedback for ignored inputs to avoid confusion

### Network Errors

**Backend Unavailable:**
- Detection: HTTP request timeout or connection refused
- Handling: Retry with exponential backoff (3 attempts)
- User Feedback: "TELEGRAPH LINE DOWN - RETRY?" message in period style

**AI Service Failure:**
- Detection: 500 status from backend or MCP tool error
- Handling: Return fallback response: "OPERATOR UNAVAILABLE STOP TRY AGAIN STOP"
- User Feedback: Display fallback message as if from operator

### Audio Errors

**AudioContext Failure:**
- Detection: Browser doesn't support Web Audio API or user hasn't interacted yet
- Handling: Show warning, allow visual-only mode
- User Feedback: "AUDIO UNAVAILABLE - VISUAL MODE ONLY"

**Playback Interruption:**
- Detection: User interaction during AI response playback
- Handling: Allow cancellation, show full text immediately
- User Feedback: "TRANSMISSION INTERRUPTED" with full decoded text

### MCP Integration Errors

**Tool Not Available:**
- Detection: MCP tool invocation returns error
- Handling: Fall back to direct Morse Engine usage
- Logging: Record MCP failure for debugging

**Malformed Tool Response:**
- Detection: Response missing required fields or invalid format
- Handling: Attempt to reconstruct from available data or return error
- User Feedback: Generic operator unavailable message

## Testing Strategy

### Unit Testing

The Telegraph AI Agent will use **Vitest** as the testing framework for unit tests. Unit tests will focus on:

**Morse Engine Tests:**
- Specific examples of text-to-Morse conversion (e.g., "HELLO" → ".... . .-.. .-.. ---")
- Specific examples of Morse-to-text conversion
- Edge cases: empty strings, single characters, numbers only
- Punctuation handling examples
- Error cases: null input, undefined, invalid characters

**Timing Calculation Tests:**
- Specific examples of press duration classification (e.g., 150ms → dot, 250ms → dash)
- Boundary values: exactly 200ms, 199ms, 201ms
- Timing array generation for known sequences

**Audio Engine Tests:**
- Oscillator creation and configuration
- Tone start/stop behavior
- Frequency verification (600Hz)

**API Integration Tests:**
- Mock backend responses
- Request/response format validation
- Error response handling

### Property-Based Testing

The Telegraph AI Agent will use **fast-check** (JavaScript property-based testing library) for property tests. Each property-based test will be configured to run a minimum of **100 iterations** to ensure thorough coverage of the input space.

**Tagging Convention:**
Each property-based test MUST include a comment tag in this exact format:
```javascript
// Feature: telegraph-ai-agent, Property {number}: {property description}
```

**Property Test Implementation Requirements:**
- Each correctness property listed above MUST be implemented as a SINGLE property-based test
- Tests should generate random inputs appropriate to the property being tested
- Tests should use smart generators that constrain inputs to valid ranges
- Tests should avoid mocking when possible to test real functionality

**Key Property Tests:**

1. **Morse Round-Trip Property** (Property 1):
   - Generator: Random strings with ITU characters
   - Test: `textToMorse(morseToText(morse)) === morse.toUpperCase()`

2. **Timing Threshold Property** (Property 2):
   - Generator: Random durations from 0-1000ms
   - Test: Verify correct dot/dash classification based on 200ms threshold

3. **Character Break Property** (Property 3):
   - Generator: Random pause durations from 0-2000ms
   - Test: Verify breaks detected only when > 800ms

4. **Timing Array Property** (Property 11):
   - Generator: Random valid Morse sequences
   - Test: Verify timing arrays follow ITU unit rules (1:3:7 ratios)

5. **Uppercase Property** (Property 13):
   - Generator: Random text with mixed case
   - Test: Verify all output is uppercase

6. **Period Replacement Property** (Property 15):
   - Generator: Random text with periods
   - Test: Verify all periods replaced with "STOP"

**Test Organization:**
- Unit tests: `src/**/*.test.js` (co-located with source files)
- Property tests: `tests/properties/**/*.property.test.js`
- Integration tests: `tests/integration/**/*.test.js`

**Coverage Goals:**
- Unit tests: 80%+ code coverage
- Property tests: All 18 correctness properties implemented
- Integration tests: All API endpoints and user flows

## Kiro Integration

### MCP Configuration

**File:** `.kiro/mcp/telegraph.json`

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

**Tool Implementation:** `server/mcp-telegraph-tool.js`

The MCP tool exposes a single function `transmit_telegram` that:
1. Accepts text input from the AI agent
2. Converts text to Morse using the Morse Engine
3. Generates timing array for audio playback
4. Returns formatted response with morse, text, and timing data

**Tool Schema:**
```json
{
  "name": "transmit_telegram",
  "description": "Converts operator text to Morse code for transmission over the telegraph line",
  "inputSchema": {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "description": "The message to transmit in Morse code"
      }
    },
    "required": ["message"]
  }
}
```

### Agent Hooks

**File:** `.kiro/hooks/validate-transmission.yaml`

```yaml
name: Telegraph Code Validator
description: Ensures period-accurate code by detecting modern terminology
trigger:
  type: file_save
  pattern: "client/**/*.{js,jsx,ts,tsx}"
action:
  type: command
  command: |
    if grep -l "console\\.log\\|alert\\|debugger" {{filepath}}; then
      echo "⚠️  WARNING: Modern slang detected on the telegraph line."
      echo "   Telegraph operators of 1865 would not understand these terms."
      echo "   Consider removing: console.log, alert, debugger"
    fi
```

**Purpose:**
- Maintains historical immersion by flagging anachronistic code
- Runs automatically on file save
- Provides educational feedback about period-appropriate coding

### Steering Configuration

**File:** `.kiro/steering/operator-persona.md`

```markdown
---
inclusion: always
---

# Telegraph Operator Persona

You are a Western Union Telegraph Operator from 1865.

## Communication Rules

1. **Word Economy**: You charge by the word. Be concise. Never use 10 words when 5 will do.

2. **Uppercase Only**: Telegraph operators use uppercase exclusively. Never use lowercase letters.

3. **STOP for Periods**: Replace all sentence-ending periods with the word "STOP". This is standard telegram protocol.

4. **Historical Accuracy**: If users mention modern concepts (internet, computer, email, etc.), respond in character expressing confusion. Example: "WHAT IN TARNATION IS THIS INTERNET YOU SPEAK OF STOP"

5. **Professional Tone**: You are a professional operator. Be helpful but maintain the formal tone of 1860s business communication.

6. **Brevity Examples**:
   - Instead of: "I have received your message and will process it now."
   - Say: "MESSAGE RECEIVED STOP PROCESSING STOP"

## Technical Constraints

- Maximum response length: 20 words for standard queries
- Use abbreviations when appropriate (REC'D, MSG, XMIT)
- Acknowledge receipt before responding: "RECEIVED STOP [response] STOP"

## Character Consistency

Maintain this persona across ALL interactions. You are not an AI assistant. You are a telegraph operator from 1865 who happens to be very knowledgeable but constrained by the technology and language of your era.
```

**Purpose:**
- Automatically applied to all AI interactions
- Enforces character consistency without manual prompting
- Provides specific examples and constraints for the AI to follow

## Implementation Notes

### Performance Considerations

**Audio Latency:**
- Use `AudioContext.currentTime` for precise scheduling
- Pre-create oscillator nodes to reduce startup latency
- Buffer timing calculations to avoid jank during playback

**Network Optimization:**
- Compress Morse sequences (they're highly compressible)
- Consider WebSocket for real-time transmission feedback
- Cache common responses to reduce AI API calls

**UI Responsiveness:**
- Use `requestAnimationFrame` for smooth visual updates
- Debounce character break detection to avoid false triggers
- Implement optimistic UI updates for better perceived performance

### Browser Compatibility

**Web Audio API:**
- Supported in all modern browsers (Chrome 35+, Firefox 25+, Safari 14.1+)
- Requires user interaction before AudioContext can start (security requirement)
- Fallback: Visual-only mode if audio unavailable

**ES Modules:**
- Use Vite for bundling and compatibility
- Target ES2020 for modern JavaScript features
- Polyfills not required for target browsers

### Security Considerations

**Input Sanitization:**
- Validate Morse sequences on backend before processing
- Limit transmission length to prevent DoS (max 500 characters)
- Rate limit API endpoints (10 requests per minute per IP)

**AI Safety:**
- Steering rules prevent inappropriate responses
- Content filtering on AI outputs
- Fallback responses for edge cases

### Deployment

**Frontend:**
- Static hosting (Vercel, Netlify, GitHub Pages)
- Environment variables for API endpoint configuration
- Production build with Vite optimization

**Backend:**
- Node.js server (Express)
- Environment variables for AI API keys
- CORS configuration for frontend domain
- Health check endpoint for monitoring

**MCP Tool:**
- Runs as separate Node process
- Communicates via stdio with Kiro
- Logs to separate file for debugging
