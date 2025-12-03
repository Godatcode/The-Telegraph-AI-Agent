import React, { useState, useRef } from 'react';
import TelegraphKey from './TelegraphKey.jsx';
import DisplayManager from './DisplayManager.jsx';
import { AudioEngine } from './AudioEngine.js';
import { morseToText } from '../../shared/morse-lib.js';

function App() {
  const [currentMorseSequence, setCurrentMorseSequence] = useState('');
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responseMorse, setResponseMorse] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [transmissionHistory, setTransmissionHistory] = useState([]);
  const audioEngineRef = useRef(null);

  // Initialize AudioEngine on first use
  if (!audioEngineRef.current) {
    audioEngineRef.current = new AudioEngine();
  }

  /**
   * Handle transmission completion from Telegraph Key
   * Sends Morse to backend and handles response playback
   */
  const handleTransmissionComplete = async (morse) => {
    if (!morse || morse.trim() === '') {
      setErrorMessage('NO TRANSMISSION TO SEND STOP');
      return;
    }

    // Clear any previous errors
    setErrorMessage('');
    setIsSending(true);
    
    // Decode user's message for history
    const userText = morseToText(morse);
    
    // Add user transmission to history
    const userTransmission = {
      id: Date.now(),
      morse: morse,
      text: userText,
      timestamp: new Date().toISOString(),
      sender: 'user'
    };
    setTransmissionHistory(prev => [...prev, userTransmission]);
    
    // Clear input buffer immediately
    setCurrentMorseSequence('');

    try {
      // Send to backend
      const response = await fetch('http://localhost:3001/api/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          morse_sequence: morse
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || 'TELEGRAPH LINE FAILURE STOP';
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const { reply_morse, reply_text, timing_array } = data;

      // Add operator response to history (will be displayed after playback)
      const operatorTransmission = {
        id: Date.now() + 1,
        morse: reply_morse,
        text: reply_text,
        timestamp: new Date().toISOString(),
        sender: 'operator'
      };
      setTransmissionHistory(prev => [...prev, operatorTransmission]);

      // Start response playback
      await playResponse(timing_array, reply_text, reply_morse);

    } catch (error) {
      // Handle network errors with period-appropriate messages
      let errorMsg = 'TELEGRAPH LINE DOWN STOP TRY AGAIN STOP';
      
      if (error.message) {
        // Use server error message if available
        errorMsg = error.message;
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // Network connection error
        errorMsg = 'TELEGRAPH LINE DOWN STOP CHECK CONNECTION STOP';
      }
      
      setErrorMessage(errorMsg);
      setResponseText(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Play AI response as Morse code audio
   * @param {number[]} timingArray - Array of tone/silence durations
   * @param {string} text - Decoded response text
   * @param {string} morse - Morse code sequence
   */
  const playResponse = async (timingArray, text, morse) => {
    // Store morse for display
    setResponseMorse(morse);
    
    if (!timingArray || timingArray.length === 0) {
      // No audio - display text immediately
      setResponseText(text);
      setIsPlayingResponse(false);
      return;
    }

    try {
      // Set playing state - text should NOT be displayed yet
      setIsPlayingResponse(true);
      setResponseText(''); // Clear any previous response

      // Try to initialize audio engine
      const audioInitialized = audioEngineRef.current.initialize();
      
      if (!audioInitialized) {
        // Audio not available - fallback to visual mode
        setErrorMessage('AUDIO UNAVAILABLE STOP VISUAL MODE ONLY STOP');
        setIsPlayingResponse(false);
        setResponseText(text);
        return;
      }

      // Play the Morse sequence
      await audioEngineRef.current.playMorseSequence(timingArray);

      // After playback completes, display the text
      setIsPlayingResponse(false);
      setResponseText(text);

    } catch (error) {
      // On playback error, display text immediately with error message
      setErrorMessage('PLAYBACK ERROR STOP DISPLAYING TEXT STOP');
      setIsPlayingResponse(false);
      setResponseText(text);
    }
  };

  /**
   * Cancel ongoing playback
   */
  const cancelPlayback = () => {
    if (isPlayingResponse) {
      audioEngineRef.current.stopTone();
      setIsPlayingResponse(false);
      
      // Get the last operator message from history
      const lastOperatorMsg = transmissionHistory
        .filter(t => t.sender === 'operator')
        .pop();
      
      // Display text immediately when cancelled
      if (lastOperatorMsg) {
        setResponseText(lastOperatorMsg.text);
      } else {
        setResponseText('TRANSMISSION INTERRUPTED STOP');
      }
    }
  };

  /**
   * Handle dot/dash input from Telegraph Key
   */
  const handleDotDash = (symbol) => {
    setCurrentMorseSequence(prev => prev + symbol);
  };

  /**
   * Handle character break from Telegraph Key
   */
  const handleCharacterBreak = (sequence) => {
    // Character break detected - decode for display
    try {
      const decoded = morseToText(sequence);
      // Could show decoded character in real-time if needed
    } catch (error) {
      // Invalid sequence - will be handled by DisplayManager
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setErrorMessage('');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">TELEGRAPH AI AGENT</h1>
        <p className="app-subtitle">MORSE CODE COMMUNICATION - EST. 1865</p>
      </header>
      
      <main className="main-content">
        {/* Error display with period-appropriate styling */}
        {errorMessage && (
          <div className="error-banner">
            <div className="error-text">⚠ {errorMessage}</div>
            <button 
              onClick={clearError}
              className="error-dismiss"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading indicator during AI processing */}
        {isSending && (
          <div className="loading-indicator">
            <div className="loading-spinner">⚡</div>
            <div className="loading-text">SENDING TRANSMISSION...</div>
          </div>
        )}

        {/* Telegraph Key input component */}
        <TelegraphKey 
          onDotDash={handleDotDash}
          onCharacterBreak={handleCharacterBreak}
          onTransmissionComplete={handleTransmissionComplete}
          disabled={isSending || isPlayingResponse}
        />
        
        {/* Display Manager for UI rendering */}
        <DisplayManager 
          currentMorseSequence={currentMorseSequence}
          isPlayingResponse={isPlayingResponse}
          responseText={responseText}
          responseMorse={responseMorse}
          transmissionHistory={transmissionHistory}
        />

        {/* Playback controls */}
        {isPlayingResponse && (
          <div className="playback-controls">
            <div className="playback-status">
              <span className="playback-icon">⚡</span>
              <span className="playback-text">RECEIVING TRANSMISSION...</span>
            </div>
            <button 
              onClick={cancelPlayback}
              className="cancel-button"
              aria-label="Cancel playback"
            >
              CANCEL TRANSMISSION
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>WESTERN UNION TELEGRAPH CO. - KIRO INTEGRATION</p>
      </footer>
    </div>
  );
}

export default App;
