/**
 * AudioEngine - Web Audio API wrapper for telegraph tone generation
 * Handles 600Hz sine wave generation and Morse code timing playback
 */

export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.oscillator = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.isInitialized = false;
  }

  /**
   * Initialize AudioContext (requires user interaction)
   * @returns {boolean} True if initialization successful
   */
  initialize() {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Check for Web Audio API support
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        throw new Error('Web Audio API not supported');
      }

      this.audioContext = new AudioContext();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
      return false;
    }
  }

  /**
   * Start playing a 600Hz sine wave tone
   * @param {number} frequency - Frequency in Hz (default: 600)
   */
  startTone(frequency = 600) {
    if (!this.isInitialized && !this.initialize()) {
      throw new Error('AudioContext not initialized');
    }

    // Stop any existing tone first
    if (this.isPlaying) {
      this.stopTone();
    }

    try {
      // Create oscillator node
      this.oscillator = this.audioContext.createOscillator();
      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);

      // Connect nodes: oscillator -> gain -> destination
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      // Start the tone
      this.oscillator.start();
      this.isPlaying = true;
    } catch (error) {
      console.error('Failed to start tone:', error);
      throw error;
    }
  }

  /**
   * Stop the currently playing tone
   */
  stopTone() {
    if (!this.isPlaying || !this.oscillator) {
      return;
    }

    try {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.gainNode.disconnect();
      this.oscillator = null;
      this.gainNode = null;
      this.isPlaying = false;
    } catch (error) {
      // Oscillator may already be stopped
      this.isPlaying = false;
    }
  }

  /**
   * Play a Morse code sequence from a timing array
   * Timing array format: [tone_duration, silence_duration, tone_duration, ...]
   * 
   * @param {number[]} timingArray - Array of durations in milliseconds
   * @returns {Promise<void>} Resolves when playback completes
   */
  async playMorseSequence(timingArray) {
    if (!Array.isArray(timingArray) || timingArray.length === 0) {
      return Promise.resolve();
    }

    if (!this.isInitialized && !this.initialize()) {
      throw new Error('AudioContext not initialized');
    }

    // Stop any currently playing tone
    if (this.isPlaying) {
      this.stopTone();
    }

    return new Promise((resolve, reject) => {
      try {
        let currentTime = this.audioContext.currentTime;
        let isTone = true;

        for (let i = 0; i < timingArray.length; i++) {
          const duration = timingArray[i];
          
          if (duration > 0) {
            if (isTone) {
              // Schedule tone
              const osc = this.audioContext.createOscillator();
              const gain = this.audioContext.createGain();
              
              osc.type = 'sine';
              osc.frequency.setValueAtTime(600, currentTime);
              gain.gain.setValueAtTime(0.3, currentTime);
              
              osc.connect(gain);
              gain.connect(this.audioContext.destination);
              
              osc.start(currentTime);
              osc.stop(currentTime + duration / 1000);
              
              currentTime += duration / 1000;
            } else {
              // Schedule silence (just advance time)
              currentTime += duration / 1000;
            }
          }
          
          // Alternate between tone and silence
          isTone = !isTone;
        }

        // Schedule callback when playback completes
        const totalDuration = (currentTime - this.audioContext.currentTime) * 1000;
        setTimeout(() => {
          resolve();
        }, totalDuration);

      } catch (error) {
        console.error('Failed to play Morse sequence:', error);
        reject(error);
      }
    });
  }

  /**
   * Check if audio is currently playing
   * @returns {boolean}
   */
  getIsPlaying() {
    return this.isPlaying;
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.stopTone();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.isInitialized = false;
    }
  }
}

export default AudioEngine;
