import { describe, it, expect } from 'vitest';
import { textToMorse, morseToText, morseToTiming } from './morse-lib.js';

describe('Morse Engine - Unit Tests', () => {
  describe('textToMorse', () => {
    it('should convert "HELLO" to Morse code', () => {
      expect(textToMorse('HELLO')).toBe('.... . .-.. .-.. ---');
    });

    it('should convert "SOS" to Morse code', () => {
      expect(textToMorse('SOS')).toBe('... --- ...');
    });

    it('should convert "123" to Morse code', () => {
      expect(textToMorse('123')).toBe('.---- ..--- ...--');
    });

    it('should handle empty string', () => {
      expect(textToMorse('')).toBe('');
    });

    it('should handle single character', () => {
      expect(textToMorse('A')).toBe('.-');
    });

    it('should handle punctuation', () => {
      expect(textToMorse('HELLO.')).toBe('.... . .-.. .-.. --- .-.-.-');
    });

    it('should handle null input', () => {
      expect(textToMorse(null)).toBe('');
    });

    it('should handle undefined input', () => {
      expect(textToMorse(undefined)).toBe('');
    });

    it('should skip unsupported characters', () => {
      expect(textToMorse('A#B')).toBe('.- -...');
    });

    it('should be case-insensitive', () => {
      expect(textToMorse('hello')).toBe('.... . .-.. .-.. ---');
      expect(textToMorse('HeLLo')).toBe('.... . .-.. .-.. ---');
    });
  });

  describe('morseToText', () => {
    it('should convert Morse code to "HELLO"', () => {
      expect(morseToText('.... . .-.. .-.. ---')).toBe('HELLO');
    });

    it('should convert Morse code to "SOS"', () => {
      expect(morseToText('... --- ...')).toBe('SOS');
    });

    it('should convert Morse code to "123"', () => {
      expect(morseToText('.---- ..--- ...--')).toBe('123');
    });


    it('should handle empty string', () => {
      expect(morseToText('')).toBe('');
    });

    it('should handle single character', () => {
      expect(morseToText('.-')).toBe('A');
    });

    it('should handle punctuation', () => {
      expect(morseToText('.-.-.-')).toBe('.');
    });

    it('should handle null input', () => {
      expect(morseToText(null)).toBe('');
    });

    it('should handle undefined input', () => {
      expect(morseToText(undefined)).toBe('');
    });

    it('should handle invalid Morse sequences with error marker', () => {
      const result = morseToText('.- ........ -...');
      expect(result).toContain('�');
    });
  });

  describe('morseToTiming', () => {
    it('should generate timing array for a dot', () => {
      const timing = morseToTiming('.');
      expect(timing).toEqual([100]);
    });

    it('should generate timing array for a dash', () => {
      const timing = morseToTiming('-');
      expect(timing).toEqual([300]);
    });

    it('should generate timing array with inter-element gaps', () => {
      const timing = morseToTiming('.-');
      expect(timing).toEqual([100, 100, 300]);
    });

    it('should generate timing array with character gaps', () => {
      const timing = morseToTiming('.- -...');
      // .- = [100, 100, 300], char gap [300], -... = [300, 100, 100, 100, 100, 100, 100]
      expect(timing).toEqual([100, 100, 300, 300, 300, 100, 100, 100, 100, 100, 100]);
    });

    it('should handle empty string', () => {
      expect(morseToTiming('')).toEqual([]);
    });

    it('should handle null input', () => {
      expect(morseToTiming(null)).toEqual([]);
    });

    it('should handle undefined input', () => {
      expect(morseToTiming(undefined)).toEqual([]);
    });

    it('should handle word separator with word gap', () => {
      const timing = morseToTiming('.- / -...');
      // .- = [100, 100, 300], word gap [0, 700], -... = [300, 100, 100, 100, 100, 100, 100]
      expect(timing).toEqual([100, 100, 300, 0, 700, 300, 100, 100, 100, 100, 100, 100]);
    });
  });
});
