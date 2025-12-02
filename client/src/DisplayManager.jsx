import React, { useState, useEffect } from 'react';
import { morseToText } from '../../shared/morse-lib.js';

/**
 * DisplayManager Component
 * 
 * Manages the display of Morse code input, decoded characters,
 * transmission history, and AI response playback status.
 * 
 * Requirements:
 * - 2.1: Display dots/dashes immediately as they're input
 * - 2.2: Display decoded character on character breaks
 * - 2.3: Indicate error state for invalid sequences
 * - 2.4: Clear buffer when transmission is sent
 */
const DisplayManager = ({
  currentMorseSequence = '',
  onCharacterBreak,
  onTransmissionSent,
  isPlayingResponse = false,
  responseText = ''
}) => {
  const [decodedCharacter, setDecodedCharacter] = useState('');
  const [transmissionHistory, setTransmissionHistory] = useState([]);
  const [errorState, setErrorState] = useState(false);
  const [inputBuffer, setInputBuffer] = useState('');

  // Update input buffer immediately when morse sequence changes
  useEffect(() => {
    setInputBuffer(currentMorseSequence);
  }, [currentMorseSequence]);

  // Handle character breaks
  useEffect(() => {
    if (onCharacterBreak && typeof onCharacterBreak === 'function') {
      // This effect is triggered by parent component calling onCharacterBreak
    }
  }, [onCharacterBreak]);

  /**
   * Decodes a Morse sequence and updates display
   * Called when a character break occurs
   */
  const handleCharacterBreak = (morseSequence) => {
    if (!morseSequence || morseSequence.trim() === '') {
      setDecodedCharacter('');
      setErrorState(false);
      return;
    }

    try {
      const decoded = morseToText(morseSequence);
      
      // Check for error indicator (invalid sequence)
      if (decoded.includes('�')) {
        setErrorState(true);
        setDecodedCharacter('?');
      } else {
        setErrorState(false);
        setDecodedCharacter(decoded);
      }
    } catch (error) {
      setErrorState(true);
      setDecodedCharacter('?');
    }
  };

  /**
   * Handles transmission send event
   * Clears buffer and adds to history
   */
  const handleTransmissionSent = (morseSequence, decodedText) => {
    // Add to history
    const transmission = {
      id: Date.now(),
      morse: morseSequence,
      text: decodedText,
      timestamp: new Date().toISOString(),
      sender: 'user'
    };
    
    setTransmissionHistory(prev => [...prev, transmission]);
    
    // Clear buffer immediately
    setInputBuffer('');
    setDecodedCharacter('');
    setErrorState(false);

    // Notify parent
    if (onTransmissionSent) {
      onTransmissionSent(transmission);
    }
  };

  /**
   * Adds AI response to history
   */
  const addResponseToHistory = (morseSequence, decodedText) => {
    const transmission = {
      id: Date.now(),
      morse: morseSequence,
      text: decodedText,
      timestamp: new Date().toISOString(),
      sender: 'operator'
    };
    
    setTransmissionHistory(prev => [...prev, transmission]);
  };

  return (
    <div className="display-manager">
      {/* Real-time Morse sequence display */}
      <div className="morse-input-display">
        <div className="display-label">CURRENT INPUT:</div>
        <div className={`display-value ${errorState ? 'error' : ''}`}>
          {inputBuffer || '—'}
        </div>
      </div>

      {/* Decoded character display */}
      {decodedCharacter && (
        <div className="decoded-character-display">
          <div className="display-label">DECODED:</div>
          <div className={`display-value ${errorState ? 'error' : ''}`}>
            {decodedCharacter}
          </div>
        </div>
      )}

      {/* Error state indicator */}
      {errorState && (
        <div className="error-indicator">
          INVALID MORSE SEQUENCE
        </div>
      )}

      {/* AI response playback status */}
      {isPlayingResponse && (
        <div className="playback-status">
          <div className="status-indicator">⚡</div>
          <div className="status-text">RECEIVING TRANSMISSION...</div>
        </div>
      )}

      {/* Response text display (after playback) */}
      {!isPlayingResponse && responseText && (
        <div className="response-display">
          <div className="display-label">OPERATOR RESPONSE:</div>
          <div className="display-value">{responseText}</div>
        </div>
      )}

      {/* Transmission history */}
      <div className="transmission-history">
        <div className="history-label">TRANSMISSION LOG:</div>
        <div className="history-list">
          {transmissionHistory.length === 0 ? (
            <div className="history-empty">NO TRANSMISSIONS YET</div>
          ) : (
            transmissionHistory.map(transmission => (
              <div 
                key={transmission.id} 
                className={`history-item ${transmission.sender}`}
              >
                <div className="history-sender">
                  {transmission.sender === 'user' ? 'YOU' : 'OPERATOR'}:
                </div>
                <div className="history-text">{transmission.text}</div>
                <div className="history-morse">{transmission.morse}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Export methods for testing
export { DisplayManager as default };
export const testHelpers = {
  handleCharacterBreak: (component, sequence) => {
    component.handleCharacterBreak(sequence);
  },
  handleTransmissionSent: (component, morse, text) => {
    component.handleTransmissionSent(morse, text);
  }
};
