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
 * This function would integrate with Kiro's AI service in production.
 * For now, it applies operator persona constraints to generate responses.
 * 
 * @param {string} userMessage - The decoded user message
 * @returns {Promise<string>} - The AI operator's response
 */
export async function invokeOperatorAI(userMessage) {
  if (typeof userMessage !== 'string' || userMessage.trim() === '') {
    throw new Error('Invalid user message');
  }

  // In a production environment, this would call Kiro's AI service
  // with the operator persona steering rules automatically applied.
  // For this implementation, we'll simulate the AI response with
  // persona constraints applied.
  
  // Simulate AI processing delay (skip in test environment for performance)
  if (process.env.NODE_ENV !== 'test') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Generate a response that follows operator persona rules
  // In production, the AI would generate contextual responses
  // For now, we acknowledge receipt and apply persona transformations
  let response = `RECEIVED YOUR MESSAGE STOP ${userMessage} STOP`;
  
  // Apply operator persona transformations
  response = applyOperatorPersona(response);
  
  // Ensure brevity (truncate if needed)
  const words = response.split(/\s+/);
  if (words.length > 20) {
    response = words.slice(0, 20).join(' ') + ' STOP';
  }
  
  return response;
}
