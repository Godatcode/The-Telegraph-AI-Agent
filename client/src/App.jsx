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
      return;
    }

    setIsSending(true);
    setCurrentMorseSequence(''); // Clear input buffer

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
        throw new Error(errorData.error || 'TELEGRAPH LINE FAILURE STOP');
      }

      const data = await response.json();
      const { reply_morse, reply_text, timing_array } = data;

      // Start response playback
      await playResponse(timing_array, reply_text);

    } catch (error) {
      console.error('Transmission error:', error);
      // Display error message
      setResponseText('TELEGRAPH LINE DOWN STOP TRY AGAIN STOP');
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Play AI response as Morse code audio
   * @param {number[]} timingArray - Array of tone/silence durations
   * @param {string} text - Decoded response text
   */
  const playResponse = async (timingArray, text) => {
    if (!timingArray || timingArray.length === 0) {
      setResponseText(text);
      return;
    }

    try {
      // Set playing state - text should NOT be displayed yet
      setIsPlayingResponse(true);
      setResponseText(''); // Clear any previous response

      // Initialize audio engine if needed
      audioEngineRef.current.initialize();

      // Play the Morse sequence
      await audioEngineRef.current.playMorseSequence(timingArray);

      // After playback completes, display the text
      setIsPlayingResponse(false);
      setResponseText(text);

    } catch (error) {
      console.error('Playback error:', error);
      // On error, still display the text
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
      // Display text immediately when cancelled
      if (responseText === '') {
        setResponseText('TRANSMISSION INTERRUPTED');
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
    // Character break detected - could decode here if needed
    const decoded = morseToText(sequence);
    // For now, just log it
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Telegraph AI Agent</h1>
        <p className="app-subtitle">Morse Code Communication - Est. 1865</p>
      </header>
      
      <main>
        <TelegraphKey 
          onDotDash={handleDotDash}
          onCharacterBreak={handleCharacterBreak}
          onTransmissionComplete={handleTransmissionComplete}
        />
        
        <DisplayManager 
          currentMorseSequence={currentMorseSequence}
          isPlayingResponse={isPlayingResponse}
          responseText={responseText}
        />

        {/* Playback controls */}
        {isPlayingResponse && (
          <div className="playback-controls">
            <button 
              onClick={cancelPlayback}
              className="cancel-button"
            >
              CANCEL TRANSMISSION
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {isSending && (
          <div className="sending-indicator">
            SENDING TRANSMISSION...
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
