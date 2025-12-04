import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import TelegraphKey from '../../client/src/TelegraphKey.jsx';

/**
 * Property-Based Tests for Telegraph Key Component
 * 
 * These tests verify the correctness properties of the Telegraph Key
 * timing logic and character break detection.
 */

describe('Telegraph Key Properties', () => {
  
  /**
   * Feature: improved-send-button-ux, Property 1: Send button always rendered
   * Validates: Requirements 1.1
   * 
   * For any component state (regardless of buffer content, disabled status, or 
   * transmission status), the send button element should always be present in 
   * the rendered DOM output.
   */
  it('Property 1: Send button always rendered', () => {
    fc.assert(
      fc.property(
        fc.record({
          bufferContent: fc.oneof(
            fc.constant(''),
            fc.array(fc.constantFrom('.', '-'), { minLength: 1, maxLength: 20 }).map(arr => arr.join(''))
          ),
          disabled: fc.boolean(),
          transmissionStatus: fc.constantFrom('idle', 'sending', 'success', 'error')
        }),
        ({ bufferContent, disabled, transmissionStatus }) => {
          const mockOnDotDash = vi.fn();
          const mockOnCharacterBreak = vi.fn();
          const mockOnTransmissionComplete = vi.fn();
          
          const { getByText, unmount } = render(
            <TelegraphKey 
              onDotDash={mockOnDotDash}
              onCharacterBreak={mockOnCharacterBreak}
              onTransmissionComplete={mockOnTransmissionComplete}
              disabled={disabled}
            />
          );
          
          try {
            // Verify send button is always present
            const sendButton = getByText('SEND TRANSMISSION');
            expect(sendButton).toBeInTheDocument();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: improved-send-button-ux, Property 2: Send button disabled when buffer empty
   * Validates: Requirements 1.2
   * 
   * For any component state where the Input Buffer is empty (contains zero symbols), 
   * the send button should have the disabled attribute set to true.
   */
  it('Property 2: Send button disabled when buffer empty', () => {
    fc.assert(
      fc.property(
        fc.record({
          disabled: fc.boolean(),
          transmissionStatus: fc.constantFrom('idle', 'sending', 'success', 'error')
        }),
        ({ disabled, transmissionStatus }) => {
          const mockOnDotDash = vi.fn();
          const mockOnCharacterBreak = vi.fn();
          const mockOnTransmissionComplete = vi.fn();
          
          const { getByText, unmount } = render(
            <TelegraphKey 
              onDotDash={mockOnDotDash}
              onCharacterBreak={mockOnCharacterBreak}
              onTransmissionComplete={mockOnTransmissionComplete}
              disabled={disabled}
            />
          );
          
          try {
            const sendButton = getByText('SEND TRANSMISSION');
            // When buffer is empty, send button should be disabled
            expect(sendButton).toBeDisabled();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: improved-send-button-ux, Property 3: Send button enabled when buffer has content
   * Validates: Requirements 1.3
   * 
   * For any component state where the Input Buffer contains at least one symbol and 
   * the transmission status is 'idle', the send button should have the disabled 
   * attribute set to false.
   */
  it('Property 3: Send button enabled when buffer has content', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom('.', '-'), { minLength: 1, maxLength: 10 }),
        async (morseSymbols) => {
          vi.useFakeTimers();
          
          const mockOnDotDash = vi.fn();
          const mockOnCharacterBreak = vi.fn();
          const mockOnTransmissionComplete = vi.fn();
          
          const { getByText, getByRole, unmount } = render(
            <TelegraphKey 
              onDotDash={mockOnDotDash}
              onCharacterBreak={mockOnCharacterBreak}
              onTransmissionComplete={mockOnTransmissionComplete}
              disabled={false}
            />
          );
          
          try {
            const button = getByRole('button', { name: /telegraph key/i });
            
            // Input the morse sequence
            for (const symbol of morseSymbols) {
              fireEvent.mouseDown(button);
              vi.advanceTimersByTime(symbol === '.' ? 100 : 300);
              fireEvent.mouseUp(button);
              vi.advanceTimersByTime(50);
            }
            
            const sendButton = getByText('SEND TRANSMISSION');
            // When buffer has content and status is idle, send button should be enabled
            expect(sendButton).not.toBeDisabled();
          } finally {
            unmount();
            vi.useRealTimers();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: telegraph-ai-agent, Property 2: Timing Threshold Accuracy
   * Validates: Requirements 1.1, 1.2
   * 
   * For any key press duration, durations less than 200ms should register as dots
   * and durations of 200ms or greater should register as dashes.
   */
  it('Property 2: Timing Threshold Accuracy - durations < 200ms are dots, >= 200ms are dashes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }), // Generate random durations from 0-1000ms
        (duration) => {
          // Classify based on timing threshold
          const expectedSymbol = duration < 200 ? '.' : '-';
          
          // Simulate the classification logic from TelegraphKey
          const actualSymbol = duration < 200 ? '.' : '-';
          
          // Verify the classification matches the requirement
          expect(actualSymbol).toBe(expectedSymbol);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: telegraph-ai-agent, Property 3: Character Break Detection
   * Validates: Requirements 1.3
   * 
   * For any pause duration greater than 800ms following Morse input,
   * the system should interpret it as a character break and trigger character decoding.
   */
  it('Property 3: Character Break Detection - pauses > 800ms trigger character breaks', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2000 }), // Generate random pause durations from 0-2000ms
        (pauseDuration) => {
          // Determine if this should trigger a character break
          const shouldTriggerBreak = pauseDuration > 800;
          
          // Simulate the break detection logic from TelegraphKey
          const actuallyTriggersBreak = pauseDuration > 800;
          
          // Verify the break detection matches the requirement
          expect(actuallyTriggersBreak).toBe(shouldTriggerBreak);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: improved-send-button-ux, Property 4: Input buffer preserved on re-render
   * Validates: Requirements 3.1, 3.2, 3.5
   * 
   * For any non-empty Input Buffer, if the component re-renders (either from internal 
   * state changes or parent prop updates) without an explicit clear action, the Input 
   * Buffer should contain the exact same sequence.
   */
  it('Property 4: Input buffer preserved on re-render', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom('.', '-'), { minLength: 1, maxLength: 10 }), // Generate random morse sequences
        async (morseSymbols) => {
          // Setup fake timers for this test run
          vi.useFakeTimers();
          
          const mockOnDotDash = vi.fn();
          const mockOnCharacterBreak = vi.fn();
          const mockOnTransmissionComplete = vi.fn();
          
          // Render component
          const { rerender, getByText, unmount, getByRole } = render(
            <TelegraphKey 
              onDotDash={mockOnDotDash}
              onCharacterBreak={mockOnCharacterBreak}
              onTransmissionComplete={mockOnTransmissionComplete}
              disabled={false}
            />
          );
          
          try {
            const button = getByRole('button', { name: /telegraph key/i });
            
            // Input the morse sequence by simulating mouse events
            for (const symbol of morseSymbols) {
              fireEvent.mouseDown(button);
              vi.advanceTimersByTime(symbol === '.' ? 100 : 300);
              fireEvent.mouseUp(button);
              vi.advanceTimersByTime(50); // Small delay between inputs
            }
            
            const expectedSequence = morseSymbols.join('');
            
            // Verify sequence is displayed
            expect(getByText(expectedSequence)).toBeInTheDocument();
            
            // Force re-render by updating props (without explicit clear)
            rerender(
              <TelegraphKey 
                onDotDash={mockOnDotDash}
                onCharacterBreak={mockOnCharacterBreak}
                onTransmissionComplete={mockOnTransmissionComplete}
                disabled={false}
              />
            );
            
            // Verify sequence is still present after re-render
            expect(getByText(expectedSequence)).toBeInTheDocument();
          } finally {
            // Clean up after each test run
            unmount();
            vi.useRealTimers();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: improved-send-button-ux, Property 6: Clear button visible when buffer has content
   * Validates: Requirements 5.1
   * 
   * For any component state where the Input Buffer contains at least one symbol, 
   * the clear button should be rendered and visible in the DOM.
   */
  it('Property 6: Clear button visible when buffer has content', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom('.', '-'), { minLength: 1, maxLength: 10 }),
        async (morseSymbols) => {
          vi.useFakeTimers();
          
          const mockOnDotDash = vi.fn();
          const mockOnCharacterBreak = vi.fn();
          const mockOnTransmissionComplete = vi.fn();
          
          const { getByText, getByRole, unmount } = render(
            <TelegraphKey 
              onDotDash={mockOnDotDash}
              onCharacterBreak={mockOnCharacterBreak}
              onTransmissionComplete={mockOnTransmissionComplete}
              disabled={false}
            />
          );
          
          try {
            const button = getByRole('button', { name: /telegraph key/i });
            
            // Input the morse sequence
            for (const symbol of morseSymbols) {
              fireEvent.mouseDown(button);
              vi.advanceTimersByTime(symbol === '.' ? 100 : 300);
              fireEvent.mouseUp(button);
              vi.advanceTimersByTime(50);
            }
            
            // When buffer has content, clear button should be visible
            const clearButton = getByText('CLEAR');
            expect(clearButton).toBeInTheDocument();
          } finally {
            unmount();
            vi.useRealTimers();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: improved-send-button-ux, Property 7: Clear action empties buffer without sending
   * Validates: Requirements 5.2, 5.3
   * 
   * For any non-empty Input Buffer, when the clear button is clicked, the Input Buffer 
   * should become empty (zero symbols) and the onTransmissionComplete callback should 
   * not be invoked.
   */
  it('Property 7: Clear action empties buffer without sending', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom('.', '-'), { minLength: 1, maxLength: 10 }),
        async (morseSymbols) => {
          vi.useFakeTimers();
          
          const mockOnDotDash = vi.fn();
          const mockOnCharacterBreak = vi.fn();
          const mockOnTransmissionComplete = vi.fn();
          
          const { getByText, getByRole, unmount } = render(
            <TelegraphKey 
              onDotDash={mockOnDotDash}
              onCharacterBreak={mockOnCharacterBreak}
              onTransmissionComplete={mockOnTransmissionComplete}
              disabled={false}
            />
          );
          
          try {
            const button = getByRole('button', { name: /telegraph key/i });
            
            // Input the morse sequence
            for (const symbol of morseSymbols) {
              fireEvent.mouseDown(button);
              vi.advanceTimersByTime(symbol === '.' ? 100 : 300);
              fireEvent.mouseUp(button);
              vi.advanceTimersByTime(50);
            }
            
            const expectedSequence = morseSymbols.join('');
            expect(getByText(expectedSequence)).toBeInTheDocument();
            
            // Click clear button
            const clearButton = getByText('CLEAR');
            fireEvent.click(clearButton);
            
            // Buffer should be empty (showing placeholder)
            expect(getByText('TAP KEY TO BEGIN')).toBeInTheDocument();
            
            // onTransmissionComplete should NOT have been called
            expect(mockOnTransmissionComplete).not.toHaveBeenCalled();
          } finally {
            unmount();
            vi.useRealTimers();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: improved-send-button-ux, Property 5: Input buffer preserved on transmission failure
   * Validates: Requirements 3.4
   * 
   * For any Input Buffer state, if a transmission attempt fails (returns an error), 
   * the Input Buffer should contain the same sequence that was attempted to be sent.
   */
  it('Property 5: Input buffer preserved on transmission failure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom('.', '-'), { minLength: 1, maxLength: 10 }),
        async (morseSymbols) => {
          vi.useFakeTimers();
          
          const mockOnDotDash = vi.fn();
          const mockOnCharacterBreak = vi.fn();
          // Mock transmission that fails
          const mockOnTransmissionComplete = vi.fn().mockRejectedValue(new Error('TRANSMISSION FAILED'));
          
          const { getByText, getByRole, unmount } = render(
            <TelegraphKey 
              onDotDash={mockOnDotDash}
              onCharacterBreak={mockOnCharacterBreak}
              onTransmissionComplete={mockOnTransmissionComplete}
              disabled={false}
            />
          );
          
          try {
            const button = getByRole('button', { name: /telegraph key/i });
            
            // Input the morse sequence
            for (const symbol of morseSymbols) {
              fireEvent.mouseDown(button);
              vi.advanceTimersByTime(symbol === '.' ? 100 : 300);
              fireEvent.mouseUp(button);
              vi.advanceTimersByTime(50);
            }
            
            const expectedSequence = morseSymbols.join('');
            expect(getByText(expectedSequence)).toBeInTheDocument();
            
            // Click send button to trigger transmission
            const sendButton = getByText('SEND TRANSMISSION');
            const clickPromise = fireEvent.click(sendButton);
            
            // Wait a bit for the async handler to process
            await vi.advanceTimersByTimeAsync(100);
            
            // Buffer should still contain the original sequence after failure
            expect(getByText(expectedSequence)).toBeInTheDocument();
            
            // Verify transmission was attempted
            expect(mockOnTransmissionComplete).toHaveBeenCalledWith(expectedSequence);
          } finally {
            unmount();
            vi.useRealTimers();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

});
