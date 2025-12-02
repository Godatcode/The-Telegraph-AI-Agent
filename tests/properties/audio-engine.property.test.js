import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { AudioEngine } from '../../client/src/AudioEngine.js';

// Mock Web Audio API
class MockAudioContext {
  constructor() {
    this.currentTime = 0;
    this.destination = {};
  }
  
  createOscillator() {
    return new MockOscillator();
  }
  
  createGain() {
    return new MockGainNode();
  }
  
  close() {
    return Promise.resolve();
  }
}

class MockOscillator {
  constructor() {
    this.frequency = { setValueAtTime: vi.fn() };
    this.type = 'sine';
    this.started = false;
    this.stopped = false;
  }
  
  connect() {}
  disconnect() {}
  
  start(when = 0) {
    this.started = true;
  }
  
  stop(when = 0) {
    this.stopped = true;
  }
}

class MockGainNode {
  constructor() {
    this.gain = { setValueAtTime: vi.fn() };
  }
  
  connect() {}
  disconnect() {}
}

describe('AudioEngine Property-Based Tests', () => {
  beforeEach(() => {
    // Mock Web Audio API
    global.window = {
      AudioContext: MockAudioContext
    };
  });

  afterEach(() => {
    delete global.window;
  });

  // Feature: telegraph-ai-agent, Property 4: Audio State Synchronization
  // Validates: Requirements 1.4, 1.5
  describe('Property 4: Audio State Synchronization', () => {
    it('for any key press event, audio tone should be active if and only if key is pressed', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }), // Number of press/release cycles
          (numCycles) => {
            const engine = new AudioEngine();
            engine.initialize();

            for (let i = 0; i < numCycles; i++) {
              // Key press - tone should start
              engine.startTone();
              expect(engine.getIsPlaying()).toBe(true);

              // Key release - tone should stop
              engine.stopTone();
              expect(engine.getIsPlaying()).toBe(false);
            }

            engine.dispose();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('for any sequence of start/stop operations, state should always be synchronized', () => {
      fc.assert(
        fc.property(
          fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }), // true = start, false = stop
          (operations) => {
            const engine = new AudioEngine();
            engine.initialize();

            let expectedState = false;

            for (const shouldStart of operations) {
              if (shouldStart) {
                engine.startTone();
                expectedState = true;
              } else {
                engine.stopTone();
                expectedState = false;
              }

              expect(engine.getIsPlaying()).toBe(expectedState);
            }

            engine.dispose();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: telegraph-ai-agent, Property 11: Morse Timing Array Correctness
  // Validates: Requirements 6.1, 6.2, 6.3, 6.4
  describe('Property 11: Morse Timing Array Correctness', () => {
    it('for any Morse sequence, timing array should follow ITU timing rules', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.oneof(
              fc.constant('.'),
              fc.constant('-')
            ),
            { minLength: 1, maxLength: 10 }
          ),
          (morseSymbols) => {
            const DOT_DURATION = 100;
            const DASH_DURATION = 300;
            const ELEMENT_GAP = 100;

            // Build a simple Morse character
            const morseChar = morseSymbols.join('');
            
            // Import morseToTiming to test
            const { morseToTiming } = require('../../shared/morse-lib.js');
            const timing = morseToTiming(morseChar);

            // Verify timing array structure
            expect(Array.isArray(timing)).toBe(true);
            expect(timing.length).toBeGreaterThan(0);

            // Check that all values are positive numbers
            for (const duration of timing) {
              expect(typeof duration).toBe('number');
              expect(duration).toBeGreaterThanOrEqual(0);
            }

            // Verify ITU timing rules for single character
            let expectedIndex = 0;
            for (let i = 0; i < morseSymbols.length; i++) {
              const symbol = morseSymbols[i];
              
              // Check tone duration
              if (symbol === '.') {
                expect(timing[expectedIndex]).toBe(DOT_DURATION);
              } else if (symbol === '-') {
                expect(timing[expectedIndex]).toBe(DASH_DURATION);
              }
              expectedIndex++;

              // Check inter-element gap (if not last symbol)
              if (i < morseSymbols.length - 1) {
                expect(timing[expectedIndex]).toBe(ELEMENT_GAP);
                expectedIndex++;
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('for any timing array, all durations should be positive integers', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.oneof(
              fc.constant('.-'),    // A
              fc.constant('-...'),  // B
              fc.constant('...'),   // S
              fc.constant('---')    // O
            ),
            { minLength: 1, maxLength: 5 }
          ),
          (morseChars) => {
            const morse = morseChars.join(' ');
            const { morseToTiming } = require('../../shared/morse-lib.js');
            const timing = morseToTiming(morse);

            // All durations must be positive integers
            for (const duration of timing) {
              expect(Number.isInteger(duration)).toBe(true);
              expect(duration).toBeGreaterThanOrEqual(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('for any Morse sequence with word gaps, timing should include 700ms gaps', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.oneof(
              fc.constant('.-'),
              fc.constant('-...'),
              fc.constant('...')
            ),
            { minLength: 2, maxLength: 4 }
          ),
          (morseChars) => {
            // Create a sequence with word separator
            const morse = morseChars[0] + ' / ' + morseChars.slice(1).join(' ');
            const { morseToTiming } = require('../../shared/morse-lib.js');
            const timing = morseToTiming(morse);

            // Should contain a 700ms word gap
            const WORD_GAP = 700;
            const hasWordGap = timing.some(duration => duration === WORD_GAP);
            expect(hasWordGap).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
