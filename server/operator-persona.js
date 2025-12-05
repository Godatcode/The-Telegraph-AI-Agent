/**
 * Operator Persona Transformation Functions
 * 
 * These functions enforce the telegraph operator persona constraints
 * on AI-generated responses according to the steering rules.
 */

/**
 * Enforces uppercase on all text
 * @param {string} text - Input text
 * @returns {string} - Uppercase text
 */
export function enforceUppercase(text) {
  if (typeof text !== 'string') {
    return '';
  }
  return text.toUpperCase();
}

/**
 * Replaces periods with "STOP" for telegram protocol
 * @param {string} text - Input text
 * @returns {string} - Text with periods replaced by STOP
 */
export function replacePeriods(text) {
  if (typeof text !== 'string') {
    return '';
  }
  
  // Replace periods that are sentence endings (followed by space or end of string)
  // but not periods in abbreviations or decimals
  return text
    .replace(/\.\s+/g, ' STOP ')
    .replace(/\.$/, ' STOP')
    .trim();
}

/**
 * Checks if text meets brevity constraints (max 20 words)
 * @param {string} text - Input text
 * @returns {boolean} - True if text is within word limit
 */
export function checkBrevity(text) {
  if (typeof text !== 'string') {
    return true;
  }
  
  // Split by whitespace and filter out empty strings
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length <= 20;
}

/**
 * Counts words in text
 * @param {string} text - Input text
 * @returns {number} - Word count
 */
export function countWords(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Applies all operator persona transformations
 * @param {string} text - Input text
 * @returns {string} - Transformed text
 */
export function applyOperatorPersona(text) {
  if (typeof text !== 'string') {
    return '';
  }
  
  let transformed = text;
  transformed = enforceUppercase(transformed);
  transformed = replacePeriods(transformed);
  
  return transformed;
}

/**
 * Invokes the AI operator with a user message
 * Integrates with Google Gemini (FREE) to generate contextual responses with operator persona
 * 
 * @param {string} userMessage - The decoded user message
 * @returns {Promise<string>} - The AI operator's response
 */
export async function invokeOperatorAI(userMessage) {
  if (typeof userMessage !== 'string' || userMessage.trim() === '') {
    throw new Error('Invalid user message');
  }

  // Check if Gemini API key is available
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('API Key present:', apiKey ? 'YES' : 'NO');
  console.log('User message:', userMessage);
  
  if (!apiKey) {
    console.log('No API key found - using fallback echo mode');
    // Fallback to simple echo response if no API key
    let response = `RECEIVED YOUR MESSAGE STOP ${userMessage} STOP`;
    response = applyOperatorPersona(response);
    const words = response.split(/\s+/);
    if (words.length > 20) {
      response = words.slice(0, 20).join(' ') + ' STOP';
    }
    return response;
  }
  
  console.log('Using Gemini API...');

  try {
    // Call Google Gemini API with operator persona
    // Using gemini-2.5-flash which is available in your API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    console.log('Calling Gemini API...');
    
    const requestBody = {
      contents: [{
        parts: [{
          text: `You are a Western Union Telegraph Operator from 1865. Follow these rules strictly:
1. Use ONLY UPPERCASE letters
2. Replace periods with "STOP"
3. Maximum 20 words per response
4. Be concise - charge by the word
5. If users mention modern concepts (internet, email, computer, phone), express confusion in character
6. Use 1860s language and professional telegraph operator tone
7. Use abbreviations: REC'D, MSG, XMIT
8. Acknowledge receipt: "RECEIVED STOP [response] STOP"

Examples:
- User: "Hello" → "RECEIVED STOP HELLO STOP OPERATOR STANDING BY STOP"
- User: "What time is it?" → "RECEIVED STOP TIME IS [current time] STOP"
- User: "Email me" → "WHAT IN TARNATION IS EMAIL STOP SEND TELEGRAM STOP"

User message: ${userMessage}

Respond as the telegraph operator:`
        }]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 200,
        topP: 0.95,
        topK: 40
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE"
        }
      ]
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    // Parse the response - handle different response formats
    let aiResponse = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      aiResponse = data.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('Unexpected response format from Gemini API');
    }
    
    // Apply operator persona transformations as safety net
    aiResponse = applyOperatorPersona(aiResponse);
    
    // Ensure brevity (truncate if needed)
    const words = aiResponse.split(/\s+/);
    if (words.length > 20) {
      aiResponse = words.slice(0, 20).join(' ') + ' STOP';
    }
    
    return aiResponse;
    
  } catch (error) {
    console.error('AI invocation error:', error);
    
    // Fallback response on error
    let response = `RECEIVED YOUR MESSAGE STOP ${userMessage} STOP`;
    response = applyOperatorPersona(response);
    const words = response.split(/\s+/);
    if (words.length > 20) {
      response = words.slice(0, 20).join(' ') + ' STOP';
    }
    return response;
  }
}