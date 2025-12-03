/**
 * End-to-End User Flow Integration Tests
 * Tests complete user flow: tap → send → receive → playback
 * 
 * Requirements: All
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../../server/index.js';
import { morseToText, textToMorse, morseToTiming } from '../../shared/morse-lib.js';

describe('Complete User Flow Integration Tests', () => {
  describe('Tap → Send → Receive → Playback Flow', () => {
    it('should handle complete flow from user input to AI response', async () => {
      // Step 1: User taps out "HI" in Morse
      const userMorse = '.... ..';
      
      // Step 2: Send transmission to backend
      const response = await request(app)
        .post('/api/send-telegram')
        .send({ morse_sequence: userMorse })
        .expect(200);
      
      // Step 3: Verify response structure
      expect(response.body).toHaveProperty('reply_morse');
      expect(response.body).toHaveProperty('reply_text');
      expect(response.body).toHaveProperty('timing_array');
      
      // Step 4: Verify response data types
      expect(typeof response.body.reply_morse).toBe('string');
      expect(typeof response.body.reply_text).toBe('string');
      expect(Array.isArray(response.body.timing_array)).toBe(true);
      
      // Step 5: Verify morse and text are equivalent
      const decodedMorse = morseToText(response.body.reply_morse);
      expect(decodedMorse).toBe(response.body.reply_text);
      
      // Step 6: Verify timing array is valid for playback
      expect(response.body.timing_array.length).toBeGreaterThan(0);
      response.body.timing_array.forEach(duration => {
        expect(typeof duration).toBe('number');
        expect(duration).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle multi-word transmissions', async () => {
      // User sends "HELLO WORLD"
      const userMorse = textToMorse('HELLO WORLD');
      
      const response = await request(app)
        .post('/api/send-telegram')
        .send({ morse_sequence: userMorse })
        .expect(200);
      
      // Verify complete response package
      expect(response.body.reply_morse).toBeDefined();
      expect(response.body.reply_text).toBeDefined();
      expect(response.body.timing_array).toBeDefined();
      
      // Verify response is uppercase (operator persona)
      expect(response.body.reply_text).toBe(response.body.reply_text.toUpperCase());
    });

    it('should handle transmissions with punctuation', async () => {
      // User sends "SOS!"
      const userMorse = textToMorse('SOS!');
      
      const response = await request(app)
        .post('/api/send-telegram')
        .send({ morse_sequence: userMorse })
        .expect(200);
      
      // Verify response can be decoded
      const decoded = morseToText(response.body.reply_morse);
      expect(decoded).toBe(response.body.reply_text);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network failure gracefully - missing morse_sequence', async () => {
      const response = await request(app)
        .post('/api/send-telegram')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('MORSE SEQUENCE REQUIRED');
    });

    it('should handle invalid input - non-string morse_sequence', async () => {
      const response = await request(app)
        .post('/api/send-telegram')
        .send({ morse_sequence: 12345 })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('MUST BE TEXT');
    });

    it('should handle invalid input - empty morse_sequence', async () => {
      const response = await request(app)
        .post('/api/send-telegram')
        .send({ morse_sequence: '' })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid input - transmission too long', async () => {
      // Create a very long morse sequence (> 500 characters)
      const longMorse = '.... '.repeat(200);
      
      const response = await request(app)
        .post('/api/send-telegram')
        .send({ morse_sequence: longMorse })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('TOO LONG');
    });

    it('should handle invalid morse patterns', async () => {
      // Send invalid morse sequence
      const invalidMorse = '........ -------- ........';
      
      const response = await request(app)
        .post('/api/send-telegram')
        .send({ morse_sequence: invalidMorse })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('INVALID MORSE SEQUENCE');
    });

    it('should provide period-appropriate error messages', async () => {
      const response = await request(app)
        .post('/api/send-telegram')
        .send({ morse_sequence: null })
        .expect(400);
      
      // Error message should be in telegraph style
      expect(response.body.error).toMatch(/STOP/);
      expect(response.body.error).toBe(response.body.error.toUpperCase());
    });
  });

  describe('Audio Fallback Mode', () => {
    it('should provide timing array even for minimal responses', async () => {
      const userMorse = '.';
      
      const response = await request(app)
        .post('/api/send-telegram')
        .send({ morse_sequence: userMorse })
        .expect(200);
      
      // Even minimal responses should have timing arrays
      expect(response.body.timing_array).toBeDefined();
      expect(Array.isArray(response.body.timing_array)).toBe(true);
      expect(response.body.timing_array.length).toBeGreaterThan(0);
    });

    it('should handle responses with STOP correctly in timing', async () => {
      const userMorse = textToMorse('TEST');
      
      const response = await request(app)
        .post('/api/send-telegram')
        .send({ morse_sequence: userMorse })
        .expect(200);
      
      // If response contains STOP, timing should be valid
      if (response.body.reply_text.includes('STOP')) {
        const timing = response.body.timing_array;
        expect(timing.length).toBeGreaterThan(0);
        
        // Verify timing array can be used for playback
        timing.forEach(duration => {
          expect(duration).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(duration)).toBe(true);
        });
      }
    });
  });

  describe('Response Playback Validation', () => {
    it('should generate timing arrays that follow ITU standards', async () => {
      const userMorse = textToMorse('A');
      
      const response = await request(app)
        .post('/api/send-telegram')
        .send({ morse_sequence: userMorse })
        .expect(200);
      
      const timing = response.body.timing_array;
      
      // Timing array should contain valid durations
      // Values should be non-negative integers (0 is valid for word gaps)
      timing.forEach(duration => {
        expect(duration).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(duration)).toBe(true);
      });
      
      // Should have at least some positive values (actual tones)
      const hasPositiveValues = timing.some(d => d > 0);
      expect(hasPositiveValues).toBe(true);
    });

    it('should provide text that matches morse when decoded', async () => {
      const userMorse = textToMorse('HELLO');
      
      const response = await request(app)
        .post('/api/send-telegram')
        .send({ morse_sequence: userMorse })
        .expect(200);
      
      // Decode the morse and compare to text
      const decodedFromMorse = morseToText(response.body.reply_morse);
      expect(decodedFromMorse).toBe(response.body.reply_text);
      
      // Re-encode the text and verify it matches
      const reEncodedMorse = textToMorse(response.body.reply_text);
      expect(reEncodedMorse).toBe(response.body.reply_morse);
    });
  });

  describe('Operator Persona Integration', () => {
    it('should apply persona constraints to all responses', async () => {
      const userMorse = textToMorse('HELLO');
      
      const response = await request(app)
        .post('/api/send-telegram')
        .send({ morse_sequence: userMorse })
        .expect(200);
      
      const replyText = response.body.reply_text;
      
      // Check uppercase enforcement
      expect(replyText).toBe(replyText.toUpperCase());
      
      // Check word count (should be <= 20 words)
      const words = replyText.trim().split(/\s+/).filter(w => w.length > 0);
      expect(words.length).toBeLessThanOrEqual(20);
      
      // Should not contain periods (replaced with STOP)
      const periodsOutsideStop = replyText.replace(/STOP/g, '').includes('.');
      expect(periodsOutsideStop).toBe(false);
    });

    it('should maintain character consistency across multiple transmissions', async () => {
      // Send multiple transmissions
      const transmissions = ['HI', 'HELLO', 'TEST'];
      
      for (const text of transmissions) {
        const morse = textToMorse(text);
        const response = await request(app)
          .post('/api/send-telegram')
          .send({ morse_sequence: morse })
          .expect(200);
        
        // Each response should follow persona rules
        expect(response.body.reply_text).toBe(response.body.reply_text.toUpperCase());
        
        const words = response.body.reply_text.trim().split(/\s+/);
        expect(words.length).toBeLessThanOrEqual(20);
      }
    });
  });

  describe('Health Check', () => {
    it('should respond to health check endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });
  });
});
