import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { 
  enforceUppercase, 
  replacePeriods, 
  checkBrevity,
  countWords,
  applyOperatorPersona 
} from '../../server/operator-persona.js';

describe('Operator Persona - Property-Based Tests', () => {
  // Feature: telegraph-ai-agent, Property 13: Response Uppercase Enforcement
  // Validates: Requirements 7.1
  it('Property 13: Response uppercase enforcement - all alphabetic characters should be uppercase', () => {
    // Generator for various text inputs with mixed case
    const textGen = fc.oneof(
      fc.string(), // Any string
      fc.lorem(), // Natural language text
      fc.string({ minLength: 1, maxLength: 100 }), // Bounded strings
      fc.constantFrom(
        'hello world',
        'Hello World',
        'HELLO WORLD',
        'HeLLo WoRLd',
        'test123',
        'Test 123',
        'a',
        'A',
        'abc DEF ghi'
      )
    );
    
    fc.assert(
      fc.property(textGen, (text) => {
        const result = enforceUppercase(text);
        
        // All alphabetic characters should be uppercase
        const hasNoLowercase = !/[a-z]/.test(result);
        
        // Result should be a string
        const isString = typeof result === 'string';
        
        // If input had uppercase letters, they should still be there
        const uppercasePreserved = text.toUpperCase() === result;
        
        return isString && hasNoLowercase && uppercasePreserved;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: telegraph-ai-agent, Property 14: Response Brevity Optimization
  // Validates: Requirements 7.2
  it('Property 14: Response brevity optimization - word count should not exceed 20 words', () => {
    // Generator for text with varying word counts
    const wordGen = fc.string({ minLength: 1, maxLength: 10 });
    const textGen = fc.oneof(
      // Short texts (should pass)
      fc.array(wordGen, { minLength: 1, maxLength: 20 }).map(words => words.join(' ')),
      // Exactly 20 words (boundary case)
      fc.array(wordGen, { minLength: 20, maxLength: 20 }).map(words => words.join(' ')),
      // Single word
      wordGen,
      // Empty string
      fc.constant(''),
      // Specific examples
      fc.constantFrom(
        'RECEIVED STOP',
        'MESSAGE RECEIVED STOP PROCESSING STOP',
        'HELLO STOP',
        'A B C D E F G H I J K L M N O P Q R S T' // Exactly 20 words
      )
    );
    
    fc.assert(
      fc.property(textGen, (text) => {
        const wordCount = countWords(text);
        const meetsConstraint = checkBrevity(text);
        
        // If word count is <= 20, checkBrevity should return true
        // If word count is > 20, checkBrevity should return false
        const correctCheck = (wordCount <= 20) === meetsConstraint;
        
        return correctCheck;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: telegraph-ai-agent, Property 15: Period Replacement
  // Validates: Requirements 7.3
  it('Property 15: Period replacement - periods should be replaced with STOP', () => {
    // Generator for realistic text with sentence-ending periods
    // Excludes edge cases like multiple consecutive periods or periods without context
    const wordGen = fc.string({ 
      minLength: 1, 
      maxLength: 15,
      unit: fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
    });
    
    const textGen = fc.oneof(
      // Single sentence with period at end
      fc.array(wordGen, { minLength: 1, maxLength: 10 }).map(words => words.join(' ') + '.'),
      // Multiple sentences
      fc.array(wordGen, { minLength: 1, maxLength: 5 }).chain(words1 =>
        fc.array(wordGen, { minLength: 1, maxLength: 5 }).map(words2 =>
          words1.join(' ') + '. ' + words2.join(' ') + '.'
        )
      ),
      // Specific realistic examples
      fc.constantFrom(
        'HELLO.',
        'MESSAGE RECEIVED.',
        'HELLO. WORLD.',
        'TEST MESSAGE.',
        'FIRST. SECOND. THIRD.',
        'RECEIVED STOP',
        'NO PERIODS HERE'
      )
    );
    
    fc.assert(
      fc.property(textGen, (text) => {
        const result = replacePeriods(text);
        
        // Result should not contain sentence-ending periods (period-space or trailing period)
        const noPeriodSpace = !result.includes('. ');
        const noTrailingPeriod = !result.endsWith('.');
        
        // If input had sentence-ending periods (. followed by space or at end), result should contain STOP
        const hadSentenceEndingPeriods = text.includes('. ') || text.endsWith('.');
        const hasStop = result.includes('STOP');
        
        // If input had sentence-ending periods, output should have STOP
        const correctReplacement = !hadSentenceEndingPeriods || hasStop;
        
        // Result should be a string
        const isString = typeof result === 'string';
        
        return isString && noPeriodSpace && noTrailingPeriod && correctReplacement;
      }),
      { numRuns: 100 }
    );
  });

  // Additional property: Full persona transformation should apply all rules
  it('Property: Full persona transformation applies all constraints', () => {
    const textGen = fc.oneof(
      fc.lorem(),
      fc.string({ minLength: 1, maxLength: 100 }),
      fc.constantFrom(
        'hello world.',
        'Test message. Another sentence.',
        'lowercase text with periods.',
        'ALREADY UPPERCASE.'
      )
    );
    
    fc.assert(
      fc.property(textGen, (text) => {
        const result = applyOperatorPersona(text);
        
        // Should be uppercase
        const isUppercase = !/[a-z]/.test(result);
        
        // Should not have period-space or trailing period
        const noPeriods = !result.includes('. ') && !result.endsWith('.');
        
        // Should be a string
        const isString = typeof result === 'string';
        
        return isString && isUppercase && noPeriods;
      }),
      { numRuns: 100 }
    );
  });
});
