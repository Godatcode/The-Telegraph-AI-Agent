import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fc from 'fast-check';
import { textToMorse, morseToText } from '../../shared/morse-lib.js';

let app;
let server;

beforeAll(async () => {
  // Set test environment to disable rate limiting
  process.env.NODE_ENV = 'test';
  
  // Import the Express app
  const serverModule = await import('../../server/index.js');
  app = serverModule.default;
  
  // Start server on a test port
  const PORT = 3002;
  server = app.listen(PORT);
});

afterAll(() => {
  if (server) {
    server.close();
  }
});

describe('Backend API - Property-Based Tests', () => {
  // Feature: telegraph-ai-agent, Property 10: Backend Response Completeness
  // Validates: Requirements 5.5
  it('Property 10: Backend response completeness - all responses should have morse and text fields that are equivalent', async () => {
    // Generator for valid ITU characters
    const ituCharGen = fc.constantFrom(
      ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?\'!/()&:;=+-_"$@ '.split('')
    );
    
    const ituStringGen = fc.array(ituCharGen, { minLength: 1, maxLength: 50 }).map(arr => arr.join(''));
    
    await fc.assert(
      fc.asyncProperty(ituStringGen, async (text) => {
        // Convert text to morse for the request
        const morseSequence = textToMorse(text);
        
        // Skip empty morse sequences
        if (!morseSequence || morseSequence.trim() === '') {
          return true;
        }
        
        // Make request to the API
        const response = await fetch('http://localhost:3002/api/send-telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ morse_sequence: morseSequence }),
        });
        
        // Should get a successful response
        if (!response.ok) {
          return false;
        }
        
        const data = await response.json();
        
        // Check that both fields exist
        const hasMorseField = typeof data.reply_morse === 'string';
        const hasTextField = typeof data.reply_text === 'string';
        
        if (!hasMorseField || !hasTextField) {
          return false;
        }
        
        // Check that morse and text are equivalent when decoded/encoded
        const decodedMorse = morseToText(data.reply_morse);
        const encodedText = textToMorse(data.reply_text);
        
        const morseMatchesText = decodedMorse === data.reply_text;
        const textMatchesMorse = encodedText === data.reply_morse;
        
        return morseMatchesText && textMatchesMorse;
      }),
      { numRuns: 100 }
    );
  });
});
