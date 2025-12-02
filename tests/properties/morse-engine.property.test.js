import { describe, it } from 'vitest';
import fc from 'fast-check';
import { textToMorse, morseToText, morseToTiming } from '../../shared/morse-lib.js';

describe('Morse Engine - Property-Based Tests', () => {
  // Feature: telegraph-ai-agent, Property 1: Morse Engine Round-Trip Preservation
  // Validates: Requirements 4.1, 4.2
  it('Property 1: Round-trip preservation - textToMorse then morseToText should preserve content', () => {
    // Generator for valid ITU characters
    const ituCharGen = fc.constantFrom(
      ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?\'!/()&:;=+-_"$@ '.split('')
    );
    
    const ituStringGen = fc.array(ituCharGen, { minLength: 0, maxLength: 50 }).map(arr => arr.join(''));
    
    fc.assert(
      fc.property(ituStringGen, (text) => {
        const morse = textToMorse(text);
        const decoded = morseToText(morse);
        const expected = text.toUpperCase();
        
        return decoded === expected;
      }),
      { numRuns: 100 }
    );
  });
});


  // Feature: telegraph-ai-agent, Property 9: ITU Character Coverage
  // Validates: Requirements 4.4
  it('Property 9: ITU character coverage - all ITU characters should have valid bidirectional mappings', () => {
    // All ITU standard characters
    const ituCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?\'!/()&:;=+-_"$@ '.split('');
    
    fc.assert(
      fc.property(fc.constantFrom(...ituCharacters), (char) => {
        // Test text to morse
        const morse = textToMorse(char);
        const hasTextToMorseMapping = morse !== '';
        
        // Test morse to text (if we got a morse code)
        if (morse && morse !== '/') {
          const decoded = morseToText(morse);
          const hasMorseToTextMapping = decoded !== '' && decoded !== '�';
          
          // Round trip should work
          const roundTrip = decoded === char;
          
          return hasTextToMorseMapping && hasMorseToTextMapping && roundTrip;
        }
        
        // Space character maps to '/' which is valid
        return char === ' ' && morse === '/';
      }),
      { numRuns: 100 }
    );
  });


  // Feature: telegraph-ai-agent, Property 7: Invalid Sequence Handling
  // Validates: Requirements 4.3
  it('Property 7: Invalid sequence handling - system should handle errors gracefully without crashing', () => {
    // Generator for invalid morse sequences (random combinations of dots, dashes, and spaces)
    const invalidMorseGen = fc.array(
      fc.constantFrom('.', '-', ' ', '..', '--', '...', '---', '....', '-----', '.-.-.-.'),
      { minLength: 1, maxLength: 20 }
    ).map(arr => arr.join(' '));
    
    fc.assert(
      fc.property(invalidMorseGen, (morse) => {
        try {
          // Should not crash
          const result = morseToText(morse);
          
          // Result should be a string (even if it contains error markers)
          const isString = typeof result === 'string';
          
          // Should not throw an error
          return isString;
        } catch (error) {
          // If it throws, the test fails
          return false;
        }
      }),
      { numRuns: 100 }
    );
  });
