#!/usr/bin/env node

/**
 * MCP Telegraph Line Tool
 * Enables AI agents to transmit messages via Morse code over the virtual telegraph line
 */

import { textToMorse, morseToTiming } from '../shared/morse-lib.js';

// MCP Server implementation
class TelegraphLineMCPServer {
  constructor() {
    this.tools = [
      {
        name: 'transmit_telegram',
        description: 'Converts operator text to Morse code for transmission over the telegraph line',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The message to transmit in Morse code'
            }
          },
          required: ['message']
        }
      }
    ];
  }

  /**
   * Handles the transmit_telegram tool invocation
   * @param {string} message - The text message to transmit
   * @returns {Object} Response with morse, text, and timing fields
   */
  transmitTelegram(message) {
    try {
      // Validate input
      if (typeof message !== 'string') {
        throw new Error('Message must be a string');
      }

      // Convert text to Morse code
      const morse = textToMorse(message);
      
      // Generate timing array for audio playback
      const timing = morseToTiming(morse);
      
      // Return formatted response
      return {
        morse: morse,
        text: message.toUpperCase(),
        timing: timing
      };
    } catch (error) {
      throw new Error(`Telegraph transmission failed: ${error.message}`);
    }
  }

  /**
   * Handles incoming MCP requests
   * @param {Object} request - MCP request object
   * @returns {Object} MCP response object
   */
  handleRequest(request) {
    try {
      if (request.method === 'tools/list') {
        return {
          tools: this.tools
        };
      }

      if (request.method === 'tools/call') {
        const { name, arguments: args } = request.params;
        
        if (name === 'transmit_telegram') {
          const result = this.transmitTelegram(args.message);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        }
        
        throw new Error(`Unknown tool: ${name}`);
      }

      throw new Error(`Unknown method: ${request.method}`);
    } catch (error) {
      return {
        error: {
          code: -32603,
          message: error.message
        }
      };
    }
  }
}

// Export for testing
export { TelegraphLineMCPServer };

// Main execution for MCP stdio protocol
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new TelegraphLineMCPServer();
  
  // Handle stdio communication
  let buffer = '';
  
  process.stdin.on('data', (chunk) => {
    buffer += chunk.toString();
    
    // Process complete JSON messages (separated by newlines)
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const request = JSON.parse(line);
          const response = server.handleRequest(request);
          process.stdout.write(JSON.stringify(response) + '\n');
        } catch (error) {
          const errorResponse = {
            error: {
              code: -32700,
              message: 'Parse error: ' + error.message
            }
          };
          process.stdout.write(JSON.stringify(errorResponse) + '\n');
        }
      }
    }
  });
  
  process.stdin.on('end', () => {
    process.exit(0);
  });
}
