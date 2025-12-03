import { describe, it, expect } from 'vitest';
import { TelegraphLineMCPServer } from './mcp-telegraph-tool.js';

describe('MCP Telegraph Tool - Unit Tests', () => {
  describe('transmitTelegram', () => {
    it('should convert text to Morse code', () => {
      const server = new TelegraphLineMCPServer();
      const result = server.transmitTelegram('HELLO');
      
      expect(result.morse).toBe('.... . .-.. .-.. ---');
      expect(result.text).toBe('HELLO');
      expect(Array.isArray(result.timing)).toBe(true);
    });

    it('should handle SOS message', () => {
      const server = new TelegraphLineMCPServer();
      const result = server.transmitTelegram('SOS');
      
      expect(result.morse).toBe('... --- ...');
      expect(result.text).toBe('SOS');
      expect(result.timing.length).toBeGreaterThan(0);
    });

    it('should handle numbers', () => {
      const server = new TelegraphLineMCPServer();
      const result = server.transmitTelegram('123');
      
      expect(result.morse).toBe('.---- ..--- ...--');
      expect(result.text).toBe('123');
    });

    it('should handle mixed case by converting to uppercase', () => {
      const server = new TelegraphLineMCPServer();
      const result = server.transmitTelegram('Hello World');
      
      expect(result.text).toBe('HELLO WORLD');
      expect(result.morse).toContain('/'); // Space becomes /
    });

    it('should handle empty string', () => {
      const server = new TelegraphLineMCPServer();
      const result = server.transmitTelegram('');
      
      expect(result.morse).toBe('');
      expect(result.text).toBe('');
      expect(result.timing).toEqual([]);
    });

    it('should handle single character', () => {
      const server = new TelegraphLineMCPServer();
      const result = server.transmitTelegram('A');
      
      expect(result.morse).toBe('.-');
      expect(result.text).toBe('A');
      expect(result.timing).toEqual([100, 100, 300]);
    });

    it('should throw error for non-string input', () => {
      const server = new TelegraphLineMCPServer();
      
      expect(() => server.transmitTelegram(null)).toThrow('Telegraph transmission failed');
      expect(() => server.transmitTelegram(undefined)).toThrow('Telegraph transmission failed');
      expect(() => server.transmitTelegram(123)).toThrow('Telegraph transmission failed');
      expect(() => server.transmitTelegram({})).toThrow('Telegraph transmission failed');
    });
  });

  describe('Response format validation', () => {
    it('should return object with morse, text, and timing fields', () => {
      const server = new TelegraphLineMCPServer();
      const result = server.transmitTelegram('TEST');
      
      expect(result).toHaveProperty('morse');
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('timing');
      
      expect(typeof result.morse).toBe('string');
      expect(typeof result.text).toBe('string');
      expect(Array.isArray(result.timing)).toBe(true);
    });

    it('should generate valid timing arrays with positive integers', () => {
      const server = new TelegraphLineMCPServer();
      const result = server.transmitTelegram('ABC');
      
      expect(result.timing.every(val => typeof val === 'number')).toBe(true);
      expect(result.timing.every(val => val >= 0)).toBe(true);
      expect(result.timing.every(val => Number.isInteger(val))).toBe(true);
    });
  });

  describe('MCP request handling', () => {
    it('should handle tools/list request', () => {
      const server = new TelegraphLineMCPServer();
      const request = { method: 'tools/list' };
      const response = server.handleRequest(request);
      
      expect(response).toHaveProperty('tools');
      expect(Array.isArray(response.tools)).toBe(true);
      expect(response.tools.length).toBe(1);
      expect(response.tools[0].name).toBe('transmit_telegram');
    });

    it('should handle tools/call request for transmit_telegram', () => {
      const server = new TelegraphLineMCPServer();
      const request = {
        method: 'tools/call',
        params: {
          name: 'transmit_telegram',
          arguments: { message: 'HELLO' }
        }
      };
      const response = server.handleRequest(request);
      
      expect(response).toHaveProperty('content');
      expect(Array.isArray(response.content)).toBe(true);
      expect(response.content[0].type).toBe('text');
      
      const result = JSON.parse(response.content[0].text);
      expect(result.morse).toBe('.... . .-.. .-.. ---');
    });

    it('should return error for unknown tool', () => {
      const server = new TelegraphLineMCPServer();
      const request = {
        method: 'tools/call',
        params: {
          name: 'unknown_tool',
          arguments: {}
        }
      };
      const response = server.handleRequest(request);
      
      expect(response).toHaveProperty('error');
      expect(response.error.message).toContain('Unknown tool');
    });

    it('should return error for unknown method', () => {
      const server = new TelegraphLineMCPServer();
      const request = { method: 'unknown/method' };
      const response = server.handleRequest(request);
      
      expect(response).toHaveProperty('error');
      expect(response.error.message).toContain('Unknown method');
    });
  });

  describe('Error handling', () => {
    it('should handle tool invocation failures gracefully', () => {
      const server = new TelegraphLineMCPServer();
      const request = {
        method: 'tools/call',
        params: {
          name: 'transmit_telegram',
          arguments: { message: null }
        }
      };
      const response = server.handleRequest(request);
      
      expect(response).toHaveProperty('error');
      expect(response.error.message).toContain('Telegraph transmission failed');
    });

    it('should handle missing arguments', () => {
      const server = new TelegraphLineMCPServer();
      const request = {
        method: 'tools/call',
        params: {
          name: 'transmit_telegram',
          arguments: {}
        }
      };
      const response = server.handleRequest(request);
      
      expect(response).toHaveProperty('error');
    });
  });
});
