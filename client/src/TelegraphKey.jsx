import React, { useState, useEffect, useRef } from 'react';
import { AudioEngine } from './AudioEngine.js';

/**
 * TelegraphKey Component
 * 
 * Interactive telegraph key button that captures user input and converts
 * timing-based presses into Morse code dots and dashes.
 * 
 * Timing rules:
 * - Press < 200ms = dot (.)
 * - Press >= 200ms = dash (-)
 * - Pause > 800ms = character break
 */
const TelegraphKey = ({ onDotDash, onCharacterBreak, onTransmissionComplete }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [currentSequence, setCurrentSequence] = useState('');
  
  const pressStartTimeRef = useRef(null);
  const lastInputTimeRef = useRef(null);
  const audioEngineRef = useRef(null);
  const breakTimerRef = useRef(null);

  // Initialize AudioEngine on mount
  useEffect(() => {
    audioEngineRef.current = new AudioEngine();
    
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.dispose();
      }
      if (breakTimerRef.current) {
        clearTimeout(breakTimerRef.current);
      }
    };
  }, []);

  // Monitor for character breaks
  useEffect(() => {
    if (lastInputTimeRef.current && currentSequence.length > 0) {
      // Clear any existing timer
      if (breakTimerRef.current) {
        clearTimeout(breakTimerRef.current);
      }

      // Set new timer for character break detection
      breakTimerRef.current = setTimeout(() => {
        if (currentSequence.length > 0) {
          if (onCharacterBreak) {
            onCharacterBreak(currentSequence);
          }
          setCurrentSequence('');
        }
      }, 800);
    }

    return () => {
      if (breakTimerRef.current) {
        clearTimeout(breakTimerRef.current);
      }
    };
  }, [currentSequence, onCharacterBreak]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    
    if (isPressed) return;

    setIsPressed(true);
    pressStartTimeRef.current = Date.now();

    // Start audio tone
    try {
      if (audioEngineRef.current) {
        audioEngineRef.current.startTone(600);
      }
    } catch (error) {
      console.error('Failed to start audio tone:', error);
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    
    if (!isPressed || !pressStartTimeRef.current) return;

    setIsPressed(false);

    // Stop audio tone
    try {
      if (audioEngineRef.current) {
        audioEngineRef.current.stopTone();
      }
    } catch (error) {
      console.error('Failed to stop audio tone:', error);
    }

    // Calculate press duration
    const pressDuration = Date.now() - pressStartTimeRef.current;
    pressStartTimeRef.current = null;

    // Determine dot or dash based on duration
    const symbol = pressDuration < 200 ? '.' : '-';

    // Update sequence
    setCurrentSequence(prev => prev + symbol);
    lastInputTimeRef.current = Date.now();

    // Notify parent
    if (onDotDash) {
      onDotDash(symbol);
    }
  };

  const handleMouseLeave = (e) => {
    // Treat mouse leave as mouse up to prevent stuck keys
    if (isPressed) {
      handleMouseUp(e);
    }
  };

  const handleSendTransmission = () => {
    if (currentSequence.length > 0) {
      if (onTransmissionComplete) {
        onTransmissionComplete(currentSequence);
      }
      setCurrentSequence('');
      lastInputTimeRef.current = null;
      
      if (breakTimerRef.current) {
        clearTimeout(breakTimerRef.current);
      }
    }
  };

  return (
    <div className="telegraph-key-container">
      <button
        className={`telegraph-key ${isPressed ? 'pressed' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        aria-label="Telegraph Key"
      >
        <div className="key-label">TELEGRAPH KEY</div>
        <div className="key-status">{isPressed ? 'PRESSED' : 'READY'}</div>
      </button>
      
      <div className="morse-display">
        <div className="sequence-label">CURRENT SEQUENCE:</div>
        <div className="sequence-value">{currentSequence || '—'}</div>
      </div>

      {currentSequence.length > 0 && (
        <button 
          className="send-button"
          onClick={handleSendTransmission}
        >
          SEND TRANSMISSION
        </button>
      )}
    </div>
  );
};

export default TelegraphKey;
