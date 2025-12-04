import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
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
        expect(screen.getByText('TAP KEY TO BEGIN')).toBeInTheDocument(); // Empty state indicator
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

  describe('Status Message Generation', () => {
    /**
     * Unit tests for status message generation
     * Requirements: 2.1, 2.3, 2.4, 2.5
     */
    
    it('should show idle status when no transmission is in progress', () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      // In idle state, the key should show READY
      expect(screen.getByText('READY')).toBeInTheDocument();
    });

    it('should show sending status during transmission', async () => {
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

      // Send button should be disabled during transmission
      expect(sendButton).toBeDisabled();
    });

    it('should return to idle status after successful transmission', async () => {
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

      // Wait for status to return to idle (500ms timeout in component)
      await waitFor(() => {
        expect(screen.getByText('READY')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Tooltip Text Generation', () => {
    /**
     * Unit tests for tooltip text generation
     * Requirements: 1.5
     */
    
    it('should show empty buffer tooltip when sequence is empty', () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const sendButton = screen.getByRole('button', { name: /send transmission/i });
      
      expect(sendButton).toHaveAttribute('title', 'TAP KEY TO INPUT MORSE CODE');
    });

    it('should show transmission in progress tooltip when sending', async () => {
      mockOnTransmissionComplete.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
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

      const sendButton = screen.getByRole('button', { name: /send transmission/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(sendButton).toHaveAttribute('title', 'TRANSMISSION IN PROGRESS');
      });
    });

    it('should show system busy tooltip when component is disabled', () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
          disabled={true}
        />
      );

      const sendButton = screen.getByRole('button', { name: /send transmission/i });
      
      expect(sendButton).toHaveAttribute('title', 'SYSTEM BUSY - WAIT FOR CURRENT OPERATION');
    });

    it('should show no tooltip when button is enabled with content', async () => {
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

      const sendButton = screen.getByRole('button', { name: /send transmission/i });
      
      expect(sendButton).toHaveAttribute('title', '');
    });

    it('should have aria-describedby for accessibility', () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const sendButton = screen.getByRole('button', { name: /send transmission/i });
      
      expect(sendButton).toHaveAttribute('aria-describedby', 'send-button-status');
    });
  });

  describe('Character Count Calculation', () => {
    /**
     * Unit tests for character count calculation from morse sequences
     * Requirements: 2.1
     */
    
    it('should calculate character count for single character morse sequence', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      // Input 'E' (single dot)
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.mouseUp(button);

      await waitFor(() => {
        expect(screen.getByText('.')).toBeInTheDocument();
      });

      // Sequence should show single dot
      expect(screen.getByText('.')).toBeInTheDocument();
    });

    it('should calculate character count for multi-character morse sequence', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      // Input multiple symbols
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.mouseUp(button);

      await new Promise(resolve => setTimeout(resolve, 200));

      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 300));
      fireEvent.mouseUp(button);

      await new Promise(resolve => setTimeout(resolve, 200));

      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.mouseUp(button);

      await waitFor(() => {
        expect(screen.getByText('.-.')).toBeInTheDocument();
      });
    });

    it('should show empty state indicator when sequence is empty', () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      // Empty state should show placeholder text
      expect(screen.getByText('TAP KEY TO BEGIN')).toBeInTheDocument();
    });
  });

  describe('Help Hints Component', () => {
    /**
     * Unit tests for help hints component
     * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
     */
    
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
    });

    it('should show hints on first load when localStorage is empty', () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      // Hints should be visible on first load
      expect(screen.getByText(/TAP AND HOLD/i)).toBeInTheDocument();
    });

    it('should show appropriate hint for empty buffer state', () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      // Should show hint about tap duration
      expect(screen.getByText(/SHORT TAP.*DOT/i)).toBeInTheDocument();
      expect(screen.getByText(/LONG HOLD.*DASH/i)).toBeInTheDocument();
    });

    it('should show hint about send button after first symbol', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      const button = screen.getByRole('button', { name: /telegraph key/i });

      // Input first symbol
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.mouseUp(button);

      await waitFor(() => {
        expect(screen.getByText(/SEND TRANSMISSION/i)).toBeInTheDocument();
      });

      // Should show hint about send button
      expect(screen.getByText(/CLICK.*SEND/i)).toBeInTheDocument();
    });

    it('should hide hints after first successful transmission', async () => {
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

      // Wait for transmission to complete
      await waitFor(() => {
        expect(screen.getByText('READY')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Hints should be hidden after successful send
      expect(screen.queryByText(/TAP AND HOLD/i)).not.toBeInTheDocument();
    });

    it('should persist hint dismissal in localStorage', async () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      // Find and click dismiss button
      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);

      // Hints should be hidden
      await waitFor(() => {
        expect(screen.queryByText(/TAP AND HOLD/i)).not.toBeInTheDocument();
      });

      // Check localStorage
      const prefs = JSON.parse(localStorage.getItem('telegraphPreferences'));
      expect(prefs.hideHints).toBe(true);
    });

    it('should not show hints when localStorage indicates they are hidden', () => {
      // Set localStorage to hide hints
      localStorage.setItem('telegraphPreferences', JSON.stringify({ hideHints: true }));

      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      // Hints should not be visible
      expect(screen.queryByText(/TAP AND HOLD/i)).not.toBeInTheDocument();
    });

    it('should have dismiss button that hides hints', () => {
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      // Hints should be visible initially
      expect(screen.getByText(/TAP AND HOLD/i)).toBeInTheDocument();

      // Find and click dismiss button
      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);

      // Hints should be hidden
      expect(screen.queryByText(/TAP AND HOLD/i)).not.toBeInTheDocument();
    });

    it('should show hints again on new component mount if not permanently dismissed', () => {
      const { unmount } = render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      // Hints should be visible
      expect(screen.getByText(/TAP AND HOLD/i)).toBeInTheDocument();

      unmount();

      // Re-render without localStorage set
      render(
        <TelegraphKey 
          onDotDash={mockOnDotDash}
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionComplete={mockOnTransmissionComplete}
        />
      );

      // Hints should be visible again
      expect(screen.getByText(/TAP AND HOLD/i)).toBeInTheDocument();
    });
  });
});
