import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TelegraphKey from './TelegraphKey.jsx';

/**
 * Unit Tests for Telegraph Key Component
 * 
 * Tests specific press durations, character break timing, and audio integration
 * Requirements: 1.1, 1.2, 1.3
 */

describe('TelegraphKey Component', () => {
  let mockOnDotDash;
  let mockOnCharacterBreak;
  let mockOnTransmissionComplete;

  beforeEach(() => {
    mockOnDotDash = vi.fn();
    mockOnCharacterBreak = vi.fn();
    mockOnTransmissionComplete = vi.fn();
    
    // Use real timers for these tests to avoid timing issues with React state updates
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Timing Classification', () => {
    
    it('should register a 100ms press as a dot', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      // Simulate 100ms press using real timing
      const startTime = Date.now();
      fireEvent.mouseDown(button);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.mouseUp(button);

      expect(mockOnDotDash).toHaveBeenCalledWith('.');
    });

    it('should register a 150ms press as a dot', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      // Simulate 150ms press (well below threshold)
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 150));
      fireEvent.mouseUp(button);

      expect(mockOnDotDash).toHaveBeenCalledWith('.');
    });

    it('should register a 200ms press as a dash', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      // Simulate 200ms press
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 200));
      fireEvent.mouseUp(button);

      expect(mockOnDotDash).toHaveBeenCalledWith('-');
    });

    it('should register a 300ms press as a dash', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      // Simulate 300ms press
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 300));
      fireEvent.mouseUp(button);

      expect(mockOnDotDash).toHaveBeenCalledWith('-');
    });
  });

  describe('Character Break Detection', () => {
    
    it('should trigger character break after 800ms pause', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      // Input a dot
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.mouseUp(button);

      expect(mockOnDotDash).toHaveBeenCalledWith('.');

      // Wait for character break (> 800ms)
      await waitFor(() => {
        expect(mockOnCharacterBreak).toHaveBeenCalledWith('.');
      }, { timeout: 1500 });
    });

    it('should not trigger character break before 800ms', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      // Input a dot
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.mouseUp(button);

      // Wait less than 800ms
      await new Promise(resolve => setTimeout(resolve, 700));

      expect(mockOnCharacterBreak).not.toHaveBeenCalled();
    });

    it('should accumulate multiple inputs before character break', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      // Input dot
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.mouseUp(button);

      // Wait a bit but not enough for break
      await new Promise(resolve => setTimeout(resolve, 200));

      // Input dash
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 300));
      fireEvent.mouseUp(button);

      // Now wait for character break
      await waitFor(() => {
        expect(mockOnCharacterBreak).toHaveBeenCalledWith('.-');
      }, { timeout: 1500 });
    });
  });

  describe('Visual Feedback', () => {
    
    it('should show pressed state when key is pressed', () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      fireEvent.mouseDown(button);
      
      expect(button).toHaveClass('pressed');
      expect(screen.getByText('PRESSED')).toBeInTheDocument();
    });

    it('should show ready state when key is released', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.mouseUp(button);
      
      expect(button).not.toHaveClass('pressed');
      expect(screen.getByText('READY')).toBeInTheDocument();
    });

    it('should display current morse sequence', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      // Input dot
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.mouseUp(button);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 200));

      // Input dash
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 300));
      fireEvent.mouseUp(button);

      await waitFor(() => {
        expect(screen.getByText('.-')).toBeInTheDocument();
      });
    });
  });

  describe('Transmission Handling', () => {
    
    it('should show send button when sequence is not empty', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      // Input a dot
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.mouseUp(button);

      await waitFor(() => {
        expect(screen.getByText('SEND TRANSMISSION')).toBeInTheDocument();
      });
    });

    it('should call onTransmissionComplete when send button is clicked', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      // Input a sequence
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.mouseUp(button);

      await waitFor(() => {
        expect(screen.getByText('SEND TRANSMISSION')).toBeInTheDocument();
      });

      const sendButton = screen.getByText('SEND TRANSMISSION');
      fireEvent.click(sendButton);

      expect(mockOnTransmissionComplete).toHaveBeenCalledWith('.');
    });

    it('should clear sequence after sending transmission', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      // Input a sequence
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.mouseUp(button);

      await waitFor(() => {
        expect(screen.getByText('.')).toBeInTheDocument();
      });

      const sendButton = screen.getByText('SEND TRANSMISSION');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.queryByText('.')).not.toBeInTheDocument();
        expect(screen.getByText('—')).toBeInTheDocument(); // Empty state indicator
      });
    });
  });

  describe('Audio Integration', () => {
    
    it('should handle audio initialization gracefully', async () => {
      // This test verifies the component doesn't crash if audio fails
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      // Should not throw even if audio fails
      expect(() => {
        fireEvent.mouseDown(button);
      }).not.toThrow();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(() => {
        fireEvent.mouseUp(button);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    
    it('should handle mouse leave as mouse up', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.mouseLeave(button);

      expect(mockOnDotDash).toHaveBeenCalledWith('.');
      expect(button).not.toHaveClass('pressed');
    });

    it('should not register input if already pressed', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      fireEvent.mouseDown(button);
      fireEvent.mouseDown(button); // Second press while already pressed
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.mouseUp(button);

      // Should only register one input
      expect(mockOnDotDash).toHaveBeenCalledTimes(1);
    });
  });
});
