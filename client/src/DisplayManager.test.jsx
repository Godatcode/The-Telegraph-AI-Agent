import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DisplayManager from './DisplayManager.jsx';

/**
 * Unit Tests for Display Manager Component
 * 
 * Tests display updates for dots and dashes, character decoding display,
 * error state indication, and buffer clearing.
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

describe('DisplayManager Component', () => {
  let mockOnCharacterBreak;
  let mockOnTransmissionSent;

  beforeEach(() => {
    mockOnCharacterBreak = vi.fn();
    mockOnTransmissionSent = vi.fn();
  });

  describe('Display Updates for Dots and Dashes (Requirement 2.1)', () => {
    
    it('should display a single dot immediately', () => {
      render(
        <DisplayManager 
          currentMorseSequence="."
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
        />
      );

      const displayValue = screen.getByText('.');
      expect(displayValue).toBeInTheDocument();
    });

    it('should display a single dash immediately', () => {
      render(
        <DisplayManager 
          currentMorseSequence="-"
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
        />
      );

      const displayValue = screen.getByText('-');
      expect(displayValue).toBeInTheDocument();
    });

    it('should display a sequence of dots and dashes', () => {
      render(
        <DisplayManager 
          currentMorseSequence=".-.-"
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
        />
      );

      const displayValue = screen.getByText('.-.-');
      expect(displayValue).toBeInTheDocument();
    });

    it('should update display when morse sequence changes', () => {
      const { rerender } = render(
        <DisplayManager 
          currentMorseSequence="."
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
        />
      );

      expect(screen.getByText('.')).toBeInTheDocument();

      // Update with new sequence
      rerender(
        <DisplayManager 
          currentMorseSequence=".-"
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
        />
      );

      expect(screen.getByText('.-')).toBeInTheDocument();
    });

    it('should show empty state indicator when no input', () => {
      render(
        <DisplayManager 
          currentMorseSequence=""
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
        />
      );

      const displayValue = screen.getByText('—');
      expect(displayValue).toBeInTheDocument();
    });
  });

  describe('Character Decoding Display (Requirement 2.2)', () => {
    
    it('should not show decoded character initially', () => {
      render(
        <DisplayManager 
          currentMorseSequence=".-"
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
        />
      );

      // Decoded character section should not be visible initially
      expect(screen.queryByText('DECODED:')).not.toBeInTheDocument();
    });

    // Note: Character decoding happens when handleCharacterBreak is called
    // This is triggered by the parent component (TelegraphKey) after a character break
    // The DisplayManager component needs to expose this method or receive decoded characters as props
  });

  describe('Error State Indication (Requirement 2.3)', () => {
    
    it('should not show error state for valid sequences', () => {
      render(
        <DisplayManager 
          currentMorseSequence=".-"
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
        />
      );

      expect(screen.queryByText('INVALID MORSE SEQUENCE')).not.toBeInTheDocument();
    });
  });

  describe('Buffer Clearing (Requirement 2.4)', () => {
    
    it('should clear buffer when sequence is cleared', () => {
      const { rerender } = render(
        <DisplayManager 
          currentMorseSequence=".-.-"
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
        />
      );

      // Verify initial sequence is displayed
      expect(screen.getByText('.-.-')).toBeInTheDocument();

      // Clear the sequence (simulating transmission sent)
      rerender(
        <DisplayManager 
          currentMorseSequence=""
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
        />
      );

      // Verify buffer shows empty state
      expect(screen.getByText('—')).toBeInTheDocument();
      expect(screen.queryByText('.-.-')).not.toBeInTheDocument();
    });

    it('should clear buffer immediately after transmission', () => {
      const { rerender } = render(
        <DisplayManager 
          currentMorseSequence="..."
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
        />
      );

      expect(screen.getByText('...')).toBeInTheDocument();

      // Simulate transmission by clearing sequence
      rerender(
        <DisplayManager 
          currentMorseSequence=""
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
        />
      );

      // Buffer should be empty immediately
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('Transmission History', () => {
    
    it('should show empty history message when no transmissions', () => {
      render(
        <DisplayManager 
          currentMorseSequence=""
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
        />
      );

      expect(screen.getByText('NO TRANSMISSIONS YET')).toBeInTheDocument();
    });

    it('should display transmission log label', () => {
      render(
        <DisplayManager 
          currentMorseSequence=""
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
        />
      );

      expect(screen.getByText('TRANSMISSION LOG:')).toBeInTheDocument();
    });
  });

  describe('AI Response Playback Status', () => {
    
    it('should show playback status when playing response', () => {
      render(
        <DisplayManager 
          currentMorseSequence=""
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
          isPlayingResponse={true}
        />
      );

      expect(screen.getByText('RECEIVING TRANSMISSION...')).toBeInTheDocument();
    });

    it('should not show playback status when not playing', () => {
      render(
        <DisplayManager 
          currentMorseSequence=""
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
          isPlayingResponse={false}
        />
      );

      expect(screen.queryByText('RECEIVING TRANSMISSION...')).not.toBeInTheDocument();
    });

    it('should show response text after playback completes', () => {
      render(
        <DisplayManager 
          currentMorseSequence=""
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
          isPlayingResponse={false}
          responseText="HELLO STOP"
        />
      );

      expect(screen.getByText('OPERATOR RESPONSE:')).toBeInTheDocument();
      expect(screen.getByText('HELLO STOP')).toBeInTheDocument();
    });

    it('should not show response text during playback', () => {
      render(
        <DisplayManager 
          currentMorseSequence=""
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
          isPlayingResponse={true}
          responseText="HELLO STOP"
        />
      );

      expect(screen.queryByText('OPERATOR RESPONSE:')).not.toBeInTheDocument();
      expect(screen.getByText('RECEIVING TRANSMISSION...')).toBeInTheDocument();
    });
  });

  describe('Component Labels', () => {
    
    it('should display current input label', () => {
      render(
        <DisplayManager 
          currentMorseSequence="."
          onCharacterBreak={mockOnCharacterBreak}
          onTransmissionSent={mockOnTransmissionSent}
        />
      );

      expect(screen.getByText('CURRENT INPUT:')).toBeInTheDocument();
    });
  });
});
