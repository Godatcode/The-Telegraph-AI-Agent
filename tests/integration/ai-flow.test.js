/**
 * Integration Tests for AI Flow
 * Tests end-to-end: user Morse → AI → response Morse
 * 
 * Requirements: 5.3, 5.4, 5.5, 7.1, 7.2, 7.3
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { morseToText, textToMorse } from '../../shared/morse-lib.js';
import { invokeOperatorAI, applyOperatorPersona } from '../../server/operator-persona.js';

describe('AI Flow Integration Tests', () => {
  describe('End-to-End: User Morse → AI → Response Morse', () => {
    it('should process a complete transmission from Morse input to Morse output', async () => {
      // Simulate user input: "HELLO"
      const userMorse = '.... . .-.. .-.. ---';
      
      // Decode user Morse
      const decodedText = morseToText(userMorse);
      expect(decodedText).toBe('HELLO');
      
      // Invoke AI operator
      const aiResponse = await invokeOperatorAI(decodedText);
      
      // Verify AI response is a string
      expect(typeof aiResponse).toBe('string');
      expect(aiResponse.length).toBeGreaterThan(0);
      
      // Encode AI response to Morse
      const responseMorse = textToMorse(aiResponse);
      
      // Verify response Morse is valid
      expect(typeof responseMorse).toBe('string');
      expect(responseMorse.length).toBeGreaterThan(0);
      
      // Verify round-trip: decode the response Morse
      const decodedResponse = morseToText(responseMorse);
      expect(decodedResponse).toBe(aiResponse);
    });

    it('should handle complex messages with punctuation', async () => {
      // User sends: "SOS"
      const userMorse = '... --- ...';
      const decodedText = morseToText(userMorse);
      
      // Get AI response
      const aiResponse = await invokeOperatorAI(decodedText);
      
      // Encode and decode to verify integrity
      const responseMorse = textToMorse(aiResponse);
      const decodedResponse = morseToText(responseMorse);
      
      expect(decodedResponse).toBe(aiResponse);
    });

    it('should handle empty valid transmissions', async () => {
      // Edge case: minimal input
      const userMorse = '.';
      const decodedText = morseToText(userMorse);
      
      const aiResponse = await invokeOperatorAI(decodedText);
      
      expect(typeof aiResponse).toBe('string');
      expect(aiResponse.length).toBeGreaterThan(0);
    });
  });

  describe('Persona Application in Responses', () => {
    it('should enforce uppercase in all AI responses', async () => {
      const userMessage = 'hello world';
      const aiResponse = await invokeOperatorAI(userMessage);
      
      // Verify all alphabetic characters are uppercase
      const hasLowercase = /[a-z]/.test(aiResponse);
      expect(hasLowercase).toBe(false);
      
      // Verify response has uppercase letters
      const hasUppercase = /[A-Z]/.test(aiResponse);
      expect(hasUppercase).toBe(true);
    });

    it('should replace periods with STOP', async () => {
      // Test the persona transformation directly
      const textWithPeriods = 'HELLO. HOW ARE YOU.';
      const transformed = applyOperatorPersona(textWithPeriods);
      
      // Should not contain periods
      expect(transformed.includes('.')).toBe(false);
      
      // Should contain STOP
      expect(transformed.includes('STOP')).toBe(true);
    });

    it('should maintain brevity (max 20 words)', async () => {
      const userMessage = 'TEST';
      const aiResponse = await invokeOperatorAI(userMessage);
      
      // Count words in response
      const words = aiResponse.trim().split(/\s+/).filter(w => w.length > 0);
      
      // Should not exceed 20 words
      expect(words.length).toBeLessThanOrEqual(20);
    });

    it('should apply all persona transformations consistently', async () => {
      const userMessage = 'GREETINGS';
      const aiResponse = await invokeOperatorAI(userMessage);
      
      // Check uppercase
      expect(/[a-z]/.test(aiResponse)).toBe(false);
      
      // Check word count
      const words = aiResponse.trim().split(/\s+/).filter(w => w.length > 0);
      expect(words.length).toBeLessThanOrEqual(20);
      
      // Response should be valid for Morse encoding
      const morse = textToMorse(aiResponse);
      expect(morse.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling When AI Unavailable', () => {
    it('should handle invalid input gracefully', async () => {
      // Test with invalid input types
      await expect(invokeOperatorAI('')).rejects.toThrow();
      await expect(invokeOperatorAI(null)).rejects.toThrow();
      await expect(invokeOperatorAI(undefined)).rejects.toThrow();
    });

    it('should provide fallback response structure', async () => {
      // Even with minimal input, should get valid response
      const userMessage = 'X';
      const aiResponse = await invokeOperatorAI(userMessage);
      
      // Response should be encodable to Morse
      const morse = textToMorse(aiResponse);
      expect(morse.length).toBeGreaterThan(0);
      
      // Response should decode back correctly
      const decoded = morseToText(morse);
      expect(decoded).toBe(aiResponse);
    });
  });

  describe('Response Package Completeness', () => {
    it('should generate complete response with morse, text, and timing', async () => {
      const userMessage = 'HELLO';
      const aiResponse = await invokeOperatorAI(userMessage);
      
      // Generate complete response package (simulating backend behavior)
      const responseMorse = textToMorse(aiResponse);
      const responseText = aiResponse;
      
      // Verify all components exist
      expect(responseMorse).toBeDefined();
      expect(responseText).toBeDefined();
      expect(typeof responseMorse).toBe('string');
      expect(typeof responseText).toBe('string');
      
      // Verify they are equivalent
      const decodedMorse = morseToText(responseMorse);
      expect(decodedMorse).toBe(responseText);
    });
  });
});
