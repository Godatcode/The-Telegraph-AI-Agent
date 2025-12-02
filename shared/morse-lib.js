// Morse Engine - ITU Morse Code Translation Library

// ITU Morse Code character mappings
const TEXT_TO_MORSE_MAP = {
  'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',   'E': '.',
  'F': '..-.',  'G': '--.',   'H': '....',  'I': '..',    'J': '.---',
  'K': '-.-',   'L': '.-..',  'M': '--',    'N': '-.',    'O': '---',
  'P': '.--.',  'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
  'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',  'Y': '-.--',
  'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
  '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
  '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
  '$': '...-..-', '@': '.--.-.',
  ' ': '/'
};

// Reverse mapping for Morse to text
const MORSE_TO_TEXT_MAP = Object.entries(TEXT_TO_MORSE_MAP)
  .reduce((acc, [char, morse]) => {
    acc[morse] = char;
    return acc;
  }, {});

/**
 * Converts text to Morse code
 * @param {string} text - The text to convert (case-insensitive)
 * @returns {string} Morse code representation with spaces between characters
 */
export function textToMorse(text) {
  if (text === null || text === undefined) {
    return '';
  }
  
  if (typeof text !== 'string') {
    return '';
  }
  
  const upperText = text.toUpperCase();
  const morseChars = [];
  
  for (let i = 0; i < upperText.length; i++) {
    const char = upperText[i];
    const morse = TEXT_TO_MORSE_MAP[char];
    
    if (morse) {
      morseChars.push(morse);
    }
    // Skip unknown characters silently
  }
  
  return morseChars.join(' ');
}

/**
 * Converts Morse code to text
 * @param {string} morse - Morse code string with spaces between characters
 * @returns {string} Decoded text in uppercase
 */
export function morseToText(morse) {
  if (morse === null || morse === undefined) {
    return '';
  }
  
  if (typeof morse !== 'string') {
    return '';
  }
  
  if (morse.trim() === '') {
    return '';
  }
  
  const morseChars = morse.split(' ');
  const textChars = [];
  
  for (let i = 0; i < morseChars.length; i++) {
    const morseChar = morseChars[i];
    
    if (morseChar === '') {
      continue; // Skip empty strings from multiple spaces
    }
    
    const char = MORSE_TO_TEXT_MAP[morseChar];
    
    if (char) {
      textChars.push(char);
    } else {
      // Invalid sequence - mark with error indicator
      textChars.push('�');
    }
  }
  
  return textChars.join('');
}

/**
 * Converts Morse code to timing array for audio playback
 * ITU timing rules:
 * - Dot: 1 unit (100ms)
 * - Dash: 3 units (300ms)
 * - Inter-element gap: 1 unit (100ms)
 * - Character gap: 3 units (300ms)
 * - Word gap: 7 units (700ms)
 * 
 * @param {string} morse - Morse code string with spaces between characters
 * @returns {number[]} Array of timing values in milliseconds [tone, silence, tone, silence, ...]
 */
export function morseToTiming(morse) {
  if (morse === null || morse === undefined) {
    return [];
  }
  
  if (typeof morse !== 'string') {
    return [];
  }
  
  if (morse.trim() === '') {
    return [];
  }
  
  const DOT_DURATION = 100;
  const DASH_DURATION = 300;
  const ELEMENT_GAP = 100;
  const CHAR_GAP = 300;
  const WORD_GAP = 700;
  
  const timing = [];
  const morseChars = morse.split(' ');
  
  for (let i = 0; i < morseChars.length; i++) {
    const morseChar = morseChars[i];
    
    if (morseChar === '') {
      continue;
    }
    
    // Handle word separator
    if (morseChar === '/') {
      // Add word gap (only if not at the end)
      if (i < morseChars.length - 1) {
        timing.push(0, WORD_GAP);
      }
      continue;
    }
    
    // Process each dot/dash in the character
    for (let j = 0; j < morseChar.length; j++) {
      const symbol = morseChar[j];
      
      if (symbol === '.') {
        timing.push(DOT_DURATION);
      } else if (symbol === '-') {
        timing.push(DASH_DURATION);
      }
      
      // Add inter-element gap if not the last element in character
      if (j < morseChar.length - 1) {
        timing.push(ELEMENT_GAP);
      }
    }
    
    // Add character gap if not the last character and next is not a word separator
    if (i < morseChars.length - 1) {
      const nextChar = morseChars[i + 1];
      if (nextChar !== '/' && nextChar !== '') {
        timing.push(CHAR_GAP);
      }
    }
  }
  
  return timing;
}
