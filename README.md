# Telegraph AI Agent

A web-based application that resurrects the 1844 Morse code protocol as a modern interface for communicating with AI language models.

## Project Structure

```
telegraph-ai-agent/
├── client/              # React + Vite frontend
│   ├── src/
│   │   ├── main.jsx    # React entry point
│   │   ├── App.jsx     # Main app component
│   │   └── test-setup.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/              # Node.js + Express backend
│   ├── index.js        # Server entry point
│   └── package.json
├── shared/              # Isomorphic code (used by both client and server)
│   └── morse-lib.js    # Morse Engine translation library
├── tests/
│   ├── properties/     # Property-based tests
│   └── integration/    # Integration tests
├── package.json        # Root package.json
└── vitest.config.js    # Vitest configuration
```

## Installation

```bash
npm run install:all
```

This will install dependencies for the root project, client, and server.

## Development

Run the client and server in separate terminals:

```bash
# Terminal 1 - Client (React + Vite)
npm run dev:client

# Terminal 2 - Server (Node.js + Express)
npm run dev:server
```

The client will be available at `http://localhost:3000` and the server at `http://localhost:3001`.

## Testing

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## Features

- **Telegraph Key Interface**: Tap out Morse code using timing-based input detection
- **Audio Feedback**: Authentic 600Hz telegraph tones using Web Audio API
- **AI Operator Persona**: Communicate with an AI that responds as a 19th-century telegraph operator
- **Period-Accurate Styling**: Sepia tones, typewriter fonts, and paper textures
- **Kiro MCP Integration**: AI communication through the Telegraph Line tool
- **Property-Based Testing**: Comprehensive correctness validation using fast-check

## Technology Stack

- **Frontend**: React 18, Vite, Web Audio API
- **Backend**: Node.js, Express
- **Testing**: Vitest, fast-check
- **AI Integration**: Kiro MCP