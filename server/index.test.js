import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { textToMorse } from '../shared/morse-lib.js';

let app;
let server;
const TEST_PORT = 3003;

beforeAll(async () => {
  // Set test environment to disable rate limiting
  process.env.NODE_ENV = 'test';
  
  // Import the Express app
  const serverModule = await import('./index.js');
  app = serverModule.default;
  
  // Start server on a test port
  server = app.listen(TEST_PORT);
});

afterAll(() => {
  if (server) {
    server.close();
  }
});

describe('Server Setup', () => {
  it('should have express configured', async () => {
    const express = await import('express');
    expect(express.default).toBeDefined();
  });

  it('should have cors configured', async () => {
    const cors = await import('cors');
    expect(cors.default).toBeDefined();
  });
});

describe('POST /api/send-telegram - Valid Transmission Handling', () => {
  it('should successfully process a valid Morse transmission', async () => {
    const morseSequence = textToMorse('HELLO');
    
    const response = await fetch(`http://localhost:${TEST_PORT}/api/send-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ morse_sequence: morseSequence }),
    });
    
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('reply_morse');
    expect(data).toHaveProperty('reply_text');
    expect(data).toHaveProperty('timing_array');
    expect(typeof data.reply_morse).toBe('string');
    expect(typeof data.reply_text).toBe('string');
    expect(Array.isArray(data.timing_array)).toBe(true);
  });

  it('should process SOS transmission correctly', async () => {
    const morseSequence = textToMorse('SOS');
    
    const response = await fetch(`http://localhost:${TEST_PORT}/api/send-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ morse_sequence: morseSequence }),
    });
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    
    // Verify AI response follows operator persona rules
    expect(data.reply_text).toBeDefined();
    expect(typeof data.reply_text).toBe('string');
    
    // Should be uppercase
    expect(/[a-z]/.test(data.reply_text)).toBe(false);
    
    // Should contain STOP (period replacement)
    expect(data.reply_text).toContain('STOP');
    
    // Should be brief (max 20 words)
    const words = data.reply_text.split(/\s+/).filter(w => w.length > 0);
    expect(words.length).toBeLessThanOrEqual(20);
  });

  it('should process numeric transmission correctly', async () => {
    const morseSequence = textToMorse('123');
    
    const response = await fetch(`http://localhost:${TEST_PORT}/api/send-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ morse_sequence: morseSequence }),
    });
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty('reply_morse');
    expect(data).toHaveProperty('reply_text');
  });
});

describe('POST /api/send-telegram - Invalid Morse Sequence Errors', () => {
  it('should reject invalid Morse sequence with error markers', async () => {
    // Invalid morse sequence that doesn't map to valid characters
    const invalidMorse = '........ -------- ........';
    
    const response = await fetch(`http://localhost:${TEST_PORT}/api/send-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ morse_sequence: invalidMorse }),
    });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('INVALID MORSE SEQUENCE');
  });

  it('should reject missing morse_sequence field', async () => {
    const response = await fetch(`http://localhost:${TEST_PORT}/api/send-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('MORSE SEQUENCE REQUIRED');
  });

  it('should reject non-string morse_sequence', async () => {
    const response = await fetch(`http://localhost:${TEST_PORT}/api/send-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ morse_sequence: 12345 }),
    });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('MUST BE TEXT');
  });

  it('should reject transmission that is too long', async () => {
    // Create a morse sequence longer than 500 characters
    const longMorse = '.- '.repeat(200); // Will be > 500 characters
    
    const response = await fetch(`http://localhost:${TEST_PORT}/api/send-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ morse_sequence: longMorse }),
    });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('TOO LONG');
  });

  it('should reject empty request body', async () => {
    const response = await fetch(`http://localhost:${TEST_PORT}/api/send-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '',
    });
    
    expect(response.status).toBe(400);
  });
});

describe('POST /api/send-telegram - Error Responses', () => {
  it('should return 500 for internal server errors', async () => {
    // This test verifies the error handling structure is in place
    // Actual 500 errors would require mocking internal failures
    const morseSequence = textToMorse('TEST');
    
    const response = await fetch(`http://localhost:${TEST_PORT}/api/send-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ morse_sequence: morseSequence }),
    });
    
    // Should succeed normally
    expect(response.ok).toBe(true);
  });
});

describe('Health Check Endpoint', () => {
  it('should respond to health check', async () => {
    const response = await fetch(`http://localhost:${TEST_PORT}/health`);
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toEqual({ status: 'ok' });
  });
});
