import React, { useState, useEffect, useRef } from 'react';
import { AudioEngine } from './AudioEngine.js';
import { morseToText } from '../../shared/morse-lib.js';

/**
 * Helper function to calculate character count from morse sequence
 * @param {string} morseSequence - Raw morse sequence (dots and dashes without spaces)
 * @returns {number} Estimated character count
 */
function getCharacterCount(morseSequence) {
  if (!morseSequence || morseSequence.length === 0) {
    return 0;
  }
  // For raw input, we can't accurately decode without spaces
  // Return symbol count as approximation
  return morseSequence.length;
}

/**
 * Helper function to get status message for current state
 * @param {string} status - Transmission status
 * @param {boolean} disabled - Whether component is disabled
 * @returns {string} Status message
 */
function getStatusMessage(status, disabled) {
  if (disabled) {
    return 'SYSTEM BUSY';
  }
  
  switch (status) {
    case 'sending':
      return 'TRANSMITTING...';
    case 'success':
      return 'TRANSMISSION COMPLETE';
    case 'error':
      return 'TRANSMISSION FAILED';
    case 'idle':
    default:
      return '';
  }
}

/**
 * Helper function to get tooltip text for disabled send button
 * @param {boolean} disabled - Whether component is disabled
 * @param {number} sequenceLength - Length of current morse sequence
 * @param {string} status - Transmission status
 * @returns {string} Tooltip text explaining why button is disabled
 */
export function getSendButtonTooltip(disabled, sequenceLength, status) {
  if (disabled) {
    return 'SYSTEM BUSY - WAIT FOR CURRENT OPERATION';
  }
  
  if (status === 'sending') {
    return 'TRANSMISSION IN PROGRESS';
  }
  
  if (sequenceLength === 0) {
    return 'TAP KEY TO INPUT MORSE CODE';
  }
  
  return '';
}

/**
 * HelpHints Component
 * 
 * Displays contextual guidance for new users
 */
const HelpHints = ({ show, sequenceLength, hasEverSent, onDismiss }) => {
  if (!show) return null;

  return (
    <div className="help-hints">
      {sequenceLength === 0 ? (
        <div className="hint-content">
          <div className="hint-title">TAP AND HOLD THE KEY</div>
          <div className="hint-text">SHORT TAP FOR DOT • LONG HOLD FOR DASH</div>
        </div>
      ) : (
        <div className="hint-content">
          <div className="hint-text">CLICK SEND WHEN READY</div>
        </div>
      )}
      <button 
        className="dismiss-hint-button"
        onClick={onDismiss}
        aria-label="Dismiss hints"
      >
        DISMISS
      </button>
    </div>
  );
};

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
const TelegraphKey = ({ onDotDash, onCharacterBreak, onTransmissionComplete, disabled = false }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [currentSequence, setCurrentSequence] = useState('');
  const [transmissionStatus, setTransmissionStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [showHints, setShowHints] = useState(true);
  const [hasEverSent, setHasEverSent] = useState(false);
  
  const pressStartTimeRef = useRef(null);
  const lastInputTimeRef = useRef(null);
  const audioEngineRef = useRef(null);
  const breakTimerRef = useRef(null);
  const sequenceRef = useRef('');

  // Initialize AudioEngine and load user preferences on mount
  useEffect(() => {
    audioEngineRef.current = new AudioEngine();
    
    // Load user preferences from localStorage
    try {
      const prefs = localStorage.getItem('telegraphPreferences');
      if (prefs) {
        const parsed = JSON.parse(prefs);
        if (parsed.hideHints) {
          setShowHints(false);
        }
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
    
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
        if (sequenceRef.current.length > 0) {
          if (onCharacterBreak) {
            onCharacterBreak(sequenceRef.current);
          }
          // Clear sequence - sync both state and ref
          sequenceRef.current = '';
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
    
    if (isPressed || disabled) return;

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

    // Update sequence - sync both state and ref
    const newSequence = sequenceRef.current + symbol;
    sequenceRef.current = newSequence;
    setCurrentSequence(newSequence);
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

  const handleSendTransmission = async () => {
    if (sequenceRef.current.length > 0) {
      setTransmissionStatus('sending');
      
      try {
        if (onTransmissionComplete) {
          await onTransmissionComplete(sequenceRef.current);
        }
        
        // Only clear sequence on successful transmission - sync both state and ref
        sequenceRef.current = '';
        setCurrentSequence('');
        lastInputTimeRef.current = null;
        
        if (breakTimerRef.current) {
          clearTimeout(breakTimerRef.current);
        }
        
        // Hide hints after first successful send
        if (!hasEverSent) {
          setHasEverSent(true);
          setShowHints(false);
        }
        
        // Show success indication briefly
        setTransmissionStatus('success');
        setTimeout(() => {
          setTransmissionStatus('idle');
        }, 500);
      } catch (error) {
        // Preserve buffer on failure for retry capability
        setTransmissionStatus('error');
        
        // Reset to idle after showing error
        setTimeout(() => {
          setTransmissionStatus('idle');
        }, 2000);
      }
    }
  };

  const handleClear = () => {
    // Clear sequence - sync both state and ref
    sequenceRef.current = '';
    setCurrentSequence('');
    lastInputTimeRef.current = null;
    
    if (breakTimerRef.current) {
      clearTimeout(breakTimerRef.current);
    }
  };

  const handleDismissHints = () => {
    setShowHints(false);
    
    // Save preference to localStorage
    try {
      localStorage.setItem('telegraphPreferences', JSON.stringify({ hideHints: true }));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  };

  return (
    <div className="telegraph-key-container">
      <button
        className={`telegraph-key ${isPressed ? 'pressed' : ''} ${disabled ? 'disabled' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={disabled}
        aria-label="Telegraph Key"
        aria-disabled={disabled}
      >
        <div className="key-label">TELEGRAPH KEY</div>
        <div className="key-status">
          {disabled ? 'BUSY' : isPressed ? 'PRESSED' : 'READY'}
        </div>
      </button>
      
      <div className="morse-display">
        <div className="sequence-label">CURRENT SEQUENCE:</div>
        <div className="sequence-value">
          {currentSequence || <span className="placeholder-text">TAP KEY TO BEGIN</span>}
        </div>
        {currentSequence && (
          <div className="character-count">
            SYMBOLS: {getCharacterCount(currentSequence)}
          </div>
        )}
      </div>

      {getStatusMessage(transmissionStatus, disabled) && (
        <div className={`status-message status-${transmissionStatus}`}>
          {transmissionStatus === 'sending' && <span className="loading-indicator">⚡</span>}
          {transmissionStatus === 'success' && <span className="success-indicator">✓</span>}
          {transmissionStatus === 'error' && <span className="error-indicator">✗</span>}
          {getStatusMessage(transmissionStatus, disabled)}
        </div>
      )}

      <HelpHints 
        show={showHints}
        sequenceLength={currentSequence.length}
        hasEverSent={hasEverSent}
        onDismiss={handleDismissHints}
      />

      <div className="action-buttons">
        <button 
          className="send-button"
          onClick={handleSendTransmission}
          disabled={currentSequence.length === 0 || disabled || transmissionStatus === 'sending'}
          aria-label="Send transmission"
          aria-describedby="send-button-status"
          title={getSendButtonTooltip(disabled, currentSequence.length, transmissionStatus)}
        >
          SEND TRANSMISSION
        </button>
        
        {currentSequence.length > 0 && (
          <button 
            className="clear-button"
            onClick={handleClear}
            disabled={disabled || transmissionStatus === 'sending'}
            aria-label="Clear buffer"
          >
            CLEAR
          </button>
        )}
      </div>
    </div>
  );
};

export default TelegraphKey;
