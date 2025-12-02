# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Create client (React + Vite) and server (Node.js + Express) directories
  - Initialize package.json files with required dependencies
  - Configure Vite for React with fast refresh
  - Set up shared directory for isomorphic Morse Engine code
  - Install Vitest and fast-check for testing
  - _Requirements: All_

- [x] 2. Implement Morse Engine translation library
  - Create shared/morse-lib.js with ITU character mappings
  - Implement textToMorse() function for text-to-Morse conversion
  - Implement morseToText() function for Morse-to-text conversion
  - Implement morseToTiming() function for generating audio timing arrays
  - Add error handling for invalid characters and sequences
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2.1 Write property test for Morse round-trip
  - **Property 1: Morse Engine Round-Trip Preservation**
  - **Validates: Requirements 4.1, 4.2**

- [x] 2.2 Write property test for ITU character coverage
  - **Property 9: ITU Character Coverage**
  - **Validates: Requirements 4.4**

- [x] 2.3 Write property test for invalid sequence handling
  - **Property 7: Invalid Sequence Handling**
  - **Validates: Requirements 4.3**

- [x] 2.4 Write unit tests for Morse Engine
  - Test specific examples: "HELLO", "SOS", "123"
  - Test edge cases: empty string, single character, punctuation
  - Test error cases: null, undefined, unsupported characters
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3. Build Audio Engine with Web Audio API
  - Create client/src/AudioEngine.js class
  - Implement startTone() method with 600Hz oscillator
  - Implement stopTone() method to halt audio
  - Implement playMorseSequence() method to play timing arrays
  - Handle AudioContext initialization and user interaction requirement
  - Add error handling for unsupported browsers
  - _Requirements: 1.4, 1.5, 6.1, 6.2, 6.3, 6.4_

- [x] 3.1 Write property test for audio state synchronization
  - **Property 4: Audio State Synchronization**
  - **Validates: Requirements 1.4, 1.5**

- [x] 3.2 Write property test for timing array correctness
  - **Property 11: Morse Timing Array Correctness**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [x] 3.3 Write unit tests for Audio Engine
  - Test oscillator creation and frequency
  - Test tone start/stop behavior
  - Test timing array playback sequence
  - _Requirements: 1.4, 1.5, 6.2, 6.3, 6.4_

- [ ] 4. Create Telegraph Key input component
  - Create client/src/TelegraphKey.jsx component
  - Implement mouse down/up event handlers
  - Add timing logic to distinguish dots (< 200ms) from dashes (>= 200ms)
  - Implement character break detection (> 800ms pause)
  - Integrate Audio Engine for key press feedback
  - Add visual feedback for key press state
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 4.1 Write property test for timing threshold accuracy
  - **Property 2: Timing Threshold Accuracy**
  - **Validates: Requirements 1.1, 1.2**

- [ ] 4.2 Write property test for character break detection
  - **Property 3: Character Break Detection**
  - **Validates: Requirements 1.3**

- [ ] 4.3 Write unit tests for Telegraph Key
  - Test specific press durations: 100ms, 199ms, 200ms, 300ms
  - Test character break timing
  - Test audio integration
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 5. Build Display Manager for UI rendering
  - Create client/src/DisplayManager.jsx component
  - Implement real-time Morse sequence display
  - Add character decoding display on character breaks
  - Show transmission history
  - Display AI response playback status
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 5.1 Write property test for input display immediacy
  - **Property 5: Input Display Immediacy**
  - **Validates: Requirements 2.1**

- [ ] 5.2 Write property test for valid Morse decoding
  - **Property 6: Valid Morse Decoding**
  - **Validates: Requirements 2.2**

- [ ] 5.3 Write property test for transmission buffer reset
  - **Property 8: Transmission Buffer Reset**
  - **Validates: Requirements 2.4**

- [ ] 5.4 Write unit tests for Display Manager
  - Test display updates for dots and dashes
  - Test character decoding display
  - Test error state indication
  - Test buffer clearing
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6. Apply period-accurate styling
  - Create client/src/styles/telegraph.css with sepia color scheme
  - Add typewriter font imports (Courier Prime or Special Elite)
  - Implement paper texture background
  - Style Telegraph Key button with vintage appearance
  - Apply consistent styling to all text elements
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 6.1 Write property test for typewriter font application
  - **Property 18: Typewriter Font Application**
  - **Validates: Requirements 3.2**

- [ ] 7. Implement backend API server
  - Create server/index.js with Express setup
  - Implement POST /api/send-telegram endpoint
  - Add request validation for morse_sequence field
  - Integrate Morse Engine for decoding incoming transmissions
  - Add error handling and appropriate HTTP status codes
  - Implement rate limiting (10 requests per minute)
  - _Requirements: 5.1, 5.2, 5.5_

- [ ] 7.1 Write property test for backend response completeness
  - **Property 10: Backend Response Completeness**
  - **Validates: Requirements 5.5**

- [ ] 7.2 Write unit tests for API endpoints
  - Test valid transmission handling
  - Test invalid Morse sequence errors
  - Test rate limiting
  - Test error responses
  - _Requirements: 5.1, 5.2, 5.5_

- [ ] 8. Create MCP Telegraph Line tool
  - Create server/mcp-telegraph-tool.js
  - Implement transmit_telegram tool function
  - Accept text input and convert to Morse using Morse Engine
  - Generate timing arrays for audio playback
  - Return formatted response with morse, text, and timing fields
  - Add error handling for tool invocation failures
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 8.1 Write property test for MCP tool text acceptance
  - **Property 16: MCP Tool Text Acceptance**
  - **Validates: Requirements 8.1**

- [ ] 8.2 Write property test for MCP timing array format
  - **Property 17: MCP Timing Array Format**
  - **Validates: Requirements 8.3, 8.4**

- [ ] 8.3 Write unit tests for MCP tool
  - Test tool invocation with various text inputs
  - Test response format validation
  - Test error handling
  - _Requirements: 8.1, 8.3, 8.4_

- [ ] 9. Configure MCP integration
  - Create .kiro/mcp/telegraph.json configuration file
  - Configure telegraph-line server with node command
  - Set autoApprove for transmit_telegram tool
  - Test MCP tool connectivity
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 10. Implement AI operator persona with steering
  - Create .kiro/steering/operator-persona.md
  - Define communication rules: uppercase only, word economy, STOP for periods
  - Add historical accuracy guidelines for anachronistic terms
  - Specify brevity constraints (20 word maximum)
  - Include character consistency instructions
  - _Requirements: 7.1, 7.2, 7.3, 10.1_

- [ ] 10.1 Write property test for response uppercase enforcement
  - **Property 13: Response Uppercase Enforcement**
  - **Validates: Requirements 7.1**

- [ ] 10.2 Write property test for response brevity optimization
  - **Property 14: Response Brevity Optimization**
  - **Validates: Requirements 7.2**

- [ ] 10.3 Write property test for period replacement
  - **Property 15: Period Replacement**
  - **Validates: Requirements 7.3**

- [ ] 11. Integrate AI response handling in backend
  - Connect backend to MCP Telegraph Line tool
  - Implement AI invocation with decoded user message
  - Apply operator persona constraints to responses
  - Encode AI response to Morse using Morse Engine
  - Generate timing array for response playback
  - Return complete response package to client
  - _Requirements: 5.3, 5.4, 5.5, 7.1, 7.2, 7.3_

- [ ] 11.1 Write integration tests for AI flow
  - Test end-to-end: user Morse → AI → response Morse
  - Test persona application in responses
  - Test error handling when AI unavailable
  - _Requirements: 5.3, 5.4, 5.5, 7.1, 7.2, 7.3_

- [ ] 12. Implement response playback in frontend
  - Add response handling in main App component
  - Integrate Audio Engine for Morse playback
  - Implement playback controls (play, pause, cancel)
  - Display decoded text after playback completes
  - Add visual indicators for playback progress
  - _Requirements: 6.1, 6.5_

- [ ] 12.1 Write property test for playback completion display
  - **Property 12: Playback Completion Display**
  - **Validates: Requirements 6.5**

- [ ] 12.2 Write unit tests for response playback
  - Test timing array playback
  - Test text display after completion
  - Test playback interruption handling
  - _Requirements: 6.1, 6.5_

- [ ] 13. Create validation hook for period-accurate code
  - Create .kiro/hooks/validate-transmission.yaml
  - Configure file_save trigger for client JavaScript files
  - Implement grep command to detect console.log, alert, debugger
  - Add warning message about anachronistic terms
  - Test hook execution on file save
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 14. Wire up complete user flow
  - Connect Telegraph Key to Display Manager
  - Connect Display Manager to backend API
  - Connect backend response to Audio Engine playback
  - Implement transmission send button
  - Add loading states during AI processing
  - Handle all error states with period-appropriate messages
  - _Requirements: All_

- [ ] 14.1 Write end-to-end integration tests
  - Test complete user flow: tap → send → receive → playback
  - Test error scenarios: network failure, invalid input
  - Test audio fallback mode
  - _Requirements: All_

- [ ] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Add documentation and examples
  - Create README.md with project overview
  - Document Morse code reference chart
  - Add setup and installation instructions
  - Include example transmissions and responses
  - Document Kiro integration features
  - _Requirements: All_
