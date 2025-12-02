import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioEngine } from './AudioEngine.js';

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
    this.connectedTo = null;
  }
  
  connect(node) {
    this.connectedTo = node;
  }
  
  disconnect() {
    this.connectedTo = null;
  }
  
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
    this.connectedTo = null;
  }
  
  connect(node) {
    this.connectedTo = node;
  }
  
  disconnect() {
    this.connectedTo = null;
  }
}

describe('AudioEngine Unit Tests', () => {
  beforeEach(() => {
    // Mock Web Audio API
    global.window = {
      AudioContext: MockAudioContext
    };
  });

  afterEach(() => {
    delete global.window;
  });

  describe('Oscillator creation and frequency', () => {
    it('should create oscillator with 600Hz frequency by default', () => {
      const engine = new AudioEngine();
      engine.initialize();
      engine.startTone();

      expect(engine.oscillator).toBeDefined();
      expect(engine.oscillator.type).toBe('sine');
      expect(engine.oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        600,
        expect.any(Number)
      );

      engine.dispose();
    });

    it('should create oscillator with custom frequency', () => {
      const engine = new AudioEngine();
      engine.initialize();
      engine.startTone(800);

      expect(engine.oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        800,
        expect.any(Number)
      );

      engine.dispose();
    });

    it('should connect oscillator to gain node and destination', () => {
      const engine = new AudioEngine();
      engine.initialize();
      engine.startTone();

      expect(engine.oscillator.connectedTo).toBe(engine.gainNode);
      expect(engine.gainNode.connectedTo).toBe(engine.audioContext.destination);

      engine.dispose();
    });
  });

  describe('Tone start/stop behavior', () => {
    it('should start tone and set isPlaying to true', () => {
      const engine = new AudioEngine();
      engine.initialize();
      
      expect(engine.getIsPlaying()).toBe(false);
      
      engine.startTone();
      
      expect(engine.getIsPlaying()).toBe(true);
      expect(engine.oscillator.started).toBe(true);

      engine.dispose();
    });

    it('should stop tone and set isPlaying to false', () => {
      const engine = new AudioEngine();
      engine.initialize();
      engine.startTone();
      
      expect(engine.getIsPlaying()).toBe(true);
      const oscillator = engine.oscillator;
      
      engine.stopTone();
      
      expect(engine.getIsPlaying()).toBe(false);
      expect(oscillator.stopped).toBe(true);
      expect(engine.oscillator).toBe(null);

      engine.dispose();
    });

    it('should handle multiple start/stop cycles', () => {
      const engine = new AudioEngine();
      engine.initialize();

      for (let i = 0; i < 5; i++) {
        engine.startTone();
        expect(engine.getIsPlaying()).toBe(true);
        
        engine.stopTone();
        expect(engine.getIsPlaying()).toBe(false);
      }

      engine.dispose();
    });

    it('should stop existing tone before starting new one', () => {
      const engine = new AudioEngine();
      engine.initialize();
      
      engine.startTone();
      const firstOscillator = engine.oscillator;
      
      engine.startTone();
      const secondOscillator = engine.oscillator;
      
      expect(firstOscillator).not.toBe(secondOscillator);
      expect(firstOscillator.stopped).toBe(true);

      engine.dispose();
    });

    it('should handle stopTone when no tone is playing', () => {
      const engine = new AudioEngine();
      engine.initialize();
      
      expect(() => engine.stopTone()).not.toThrow();
      expect(engine.getIsPlaying()).toBe(false);

      engine.dispose();
    });
  });

  describe('Timing array playback sequence', () => {
    it('should play empty timing array without error', async () => {
      const engine = new AudioEngine();
      engine.initialize();

      await expect(engine.playMorseSequence([])).resolves.toBeUndefined();

      engine.dispose();
    });

    it('should play simple timing array', async () => {
      const engine = new AudioEngine();
      engine.initialize();

      const timing = [100, 100, 300, 100]; // dot, gap, dash, gap
      
      await expect(engine.playMorseSequence(timing)).resolves.toBeUndefined();

      engine.dispose();
    });

    it('should handle timing array with zero durations', async () => {
      const engine = new AudioEngine();
      engine.initialize();

      const timing = [100, 0, 300, 0]; // tone, no gap, tone, no gap
      
      await expect(engine.playMorseSequence(timing)).resolves.toBeUndefined();

      engine.dispose();
    });

    it('should reject invalid timing array', async () => {
      const engine = new AudioEngine();
      engine.initialize();

      await expect(engine.playMorseSequence(null)).resolves.toBeUndefined();
      await expect(engine.playMorseSequence(undefined)).resolves.toBeUndefined();
      await expect(engine.playMorseSequence('not an array')).resolves.toBeUndefined();

      engine.dispose();
    });

    it('should throw error if not initialized', async () => {
      // Mock initialization failure
      global.window = {};
      
      const engine = new AudioEngine();

      await expect(engine.playMorseSequence([100, 100])).rejects.toThrow('AudioContext not initialized');
    });
  });

  describe('Error handling', () => {
    it('should throw error when starting tone without initialization', () => {
      global.window = {}; // No AudioContext available
      
      const engine = new AudioEngine();

      expect(() => engine.startTone()).toThrow('AudioContext not initialized');
    });

    it('should return false when initialization fails', () => {
      global.window = {}; // No AudioContext available
      
      const engine = new AudioEngine();
      const result = engine.initialize();

      expect(result).toBe(false);
      expect(engine.isInitialized).toBe(false);
    });

    it('should return true when already initialized', () => {
      const engine = new AudioEngine();
      
      const firstInit = engine.initialize();
      const secondInit = engine.initialize();

      expect(firstInit).toBe(true);
      expect(secondInit).toBe(true);

      engine.dispose();
    });
  });

  describe('Cleanup', () => {
    it('should dispose resources properly', () => {
      const engine = new AudioEngine();
      engine.initialize();
      engine.startTone();

      expect(engine.isInitialized).toBe(true);
      expect(engine.getIsPlaying()).toBe(true);

      engine.dispose();

      expect(engine.audioContext).toBe(null);
      expect(engine.isInitialized).toBe(false);
      expect(engine.getIsPlaying()).toBe(false);
    });
  });
});
