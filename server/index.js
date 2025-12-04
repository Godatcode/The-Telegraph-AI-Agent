import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { morseToText, textToMorse, morseToTiming } from '../shared/morse-lib.js';
import { invokeOperatorAI } from './operator-persona.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting: 10 requests per minute (disabled in test environment)
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: 'TELEGRAPH LINE BUSY STOP TRY AGAIN STOP',
  });
  
  app.use('/api', limiter);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// POST /api/send-telegram - Process incoming Morse transmissions
app.post('/api/send-telegram', async (req, res) => {
  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({
        error: 'INVALID TRANSMISSION STOP NO DATA RECEIVED STOP'
      });
    }

    const { morse_sequence } = req.body;

    // Validate morse_sequence field exists
    if (!morse_sequence) {
      return res.status(400).json({
        error: 'INVALID TRANSMISSION STOP MORSE SEQUENCE REQUIRED STOP'
      });
    }

    // Validate morse_sequence is a string
    if (typeof morse_sequence !== 'string') {
      return res.status(400).json({
        error: 'INVALID TRANSMISSION STOP MORSE SEQUENCE MUST BE TEXT STOP'
      });
    }

    // Validate morse_sequence length (max 500 characters for security)
    if (morse_sequence.length > 500) {
      return res.status(400).json({
        error: 'TRANSMISSION TOO LONG STOP MAX 500 CHARACTERS STOP'
      });
    }

    // Decode the incoming Morse transmission
    const decodedText = morseToText(morse_sequence);

    // Check if decoding resulted in error markers
    if (decodedText.includes('�')) {
      return res.status(400).json({
        error: 'INVALID MORSE SEQUENCE STOP CONTAINS UNKNOWN PATTERNS STOP',
        partial_decode: decodedText
      });
    }

    // Invoke AI operator with decoded message
    let replyText;
    try {
      replyText = await invokeOperatorAI(decodedText);
    } catch (aiError) {
      console.error('AI invocation failed:', aiError);
      // Fallback response when AI is unavailable
      replyText = 'OPERATOR UNAVAILABLE STOP TRY AGAIN STOP';
    }

    // Encode AI response to Morse
    const replyMorse = textToMorse(replyText);
    
    // Generate timing array for response playback
    const timingArray = morseToTiming(replyMorse);

    // Return complete response package
    res.json({
      reply_morse: replyMorse,
      reply_text: replyText,
      timing_array: timingArray
    });

  } catch (error) {
    console.error('Error processing transmission:', error);
    res.status(500).json({
      error: 'TELEGRAPH LINE FAILURE STOP TRY AGAIN STOP'
    });
  }
});

// Only start server if this file is run directly (not imported for testing)
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`Telegraph server running on port ${PORT}`);
  });
}

export default app;
