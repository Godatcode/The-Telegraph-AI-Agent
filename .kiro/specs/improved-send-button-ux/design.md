# Design Document: Improved Send Button UX

## Overview

This design improves the telegraph interface UX by making the send button always visible, improving state management reliability, adding clear visual feedback, providing user guidance, and adding a clear button. The changes focus on the `TelegraphKey` component with minimal impact on parent components.

## Architecture

The solution maintains the existing component architecture with enhancements to the `TelegraphKey` component:

```
App (parent)
  └── TelegraphKey (enhanced)
      ├── Telegraph Key Button (existing)
      ├── Morse Display (enhanced)
      ├── Action Buttons Container (new)
      │   ├── Send Button (always visible)
      │   └── Clear Button (conditional)
      └── Help Hints (new, conditional)
```

The component will continue to use controlled state patterns but with improved state management to prevent loss of input during re-renders.

## Components and Interfaces

### Enhanced TelegraphKey Component

**Props (unchanged):**
```typescript
interface TelegraphKeyProps {
  onDotDash: (symbol: '.' | '-') => void;
  onCharacterBreak: (sequence: string) => void;
  onTransmissionComplete: (sequence: string) => void;
  disabled: boolean;
}
```

**New Internal State:**
```typescript
interface TelegraphKeyState {
  isPressed: boolean;
  currentSequence: string;
  transmissionStatus: 'idle' | 'sending' | 'success' | 'error';
  showHints: boolean;
  hasEverSent: boolean;
}
```

**New Helper Functions:**
```typescript
// Calculate decoded character count from morse sequence
function getCharacterCount(morseSequence: string): number

// Get appropriate tooltip text for disabled send button
function getSendButtonTooltip(disabled: boolean, sequenceLength: number, status: string): string

// Get appropriate status message for current state
function getStatusMessage(status: string, disabled: boolean): string
```

### Action Buttons Container (New)

A new sub-component that groups the send and clear buttons together with consistent styling and behavior.

```typescript
interface ActionButtonsProps {
  sequenceLength: number;
  disabled: boolean;
  transmissionStatus: string;
  onSend: () => void;
  onClear: () => void;
}
```

### Help Hints Component (New)

A dismissible hints component that provides contextual guidance to new users.

```typescript
interface HelpHintsProps {
  show: boolean;
  sequenceLength: number;
  hasEverSent: boolean;
  onDismiss: () => void;
}
```

## Data Models

### Transmission Status

```typescript
type TransmissionStatus = 'idle' | 'sending' | 'success' | 'error';
```

- **idle**: No transmission in progress, ready for input
- **sending**: Transmission currently being sent to backend
- **success**: Transmission completed successfully (brief state before returning to idle)
- **error**: Transmission failed (allows retry with preserved input)

### User Preferences

Store user preferences in localStorage:

```typescript
interface UserPreferences {
  hideHints: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

After analyzing the acceptance criteria, I identified which requirements are testable as properties (universal rules) versus examples (specific states). I also performed property reflection to eliminate redundancy - for instance, requirements 3.1 and 3.5 both test re-render preservation, so they're combined into Property 4. Similarly, requirements 5.2 and 5.3 both test the clear action, so they're combined into Property 7.

### Property 1: Send button always rendered

*For any* component state (regardless of buffer content, disabled status, or transmission status), the send button element should always be present in the rendered DOM output.

**Reasoning**: Requirement 1.1 states the button must be visible at all times. This is a universal property - no matter what state the component is in, the send button should exist. We can test this by generating random component states and verifying the button element is always rendered.

**Validates: Requirements 1.1**

### Property 2: Send button disabled when buffer empty

*For any* component state where the Input Buffer is empty (contains zero symbols), the send button should have the disabled attribute set to true.

**Reasoning**: Requirement 1.2 specifies that empty buffers should show a disabled button. This applies to all empty buffer states, not just specific examples. We can generate random component states with empty buffers and verify the button is always disabled.

**Validates: Requirements 1.2**

### Property 3: Send button enabled when buffer has content

*For any* component state where the Input Buffer contains at least one symbol and the transmission status is 'idle', the send button should have the disabled attribute set to false.

**Reasoning**: Requirement 1.3 specifies that non-empty buffers should enable the button. This is the complement of Property 2 - for all non-empty buffers in idle state, the button should be enabled. We can generate random morse sequences and verify the button is enabled when appropriate.

**Validates: Requirements 1.3**

### Property 4: Input buffer preserved on re-render

*For any* non-empty Input Buffer, if the component re-renders (either from internal state changes or parent prop updates) without an explicit clear action, the Input Buffer should contain the exact same sequence.

**Reasoning**: Requirements 3.1 and 3.2 both specify that input should survive re-renders and prop updates. This is a critical property for preventing data loss. We can generate random morse sequences, force various types of re-renders, and verify the sequence remains unchanged. Note: This combines requirements 3.1, 3.2, and 3.5 which all test the same underlying property.

**Validates: Requirements 3.1, 3.2, 3.5**

### Property 5: Input buffer preserved on transmission failure

*For any* Input Buffer state, if a transmission attempt fails (returns an error), the Input Buffer should contain the same sequence that was attempted to be sent.

**Reasoning**: Requirement 3.4 specifies that failed transmissions should preserve the buffer for retry. This should hold for all possible sequences and all types of transmission failures. We can generate random sequences, simulate transmission failures, and verify the buffer is retained.

**Validates: Requirements 3.4**

### Property 6: Clear button visible when buffer has content

*For any* component state where the Input Buffer contains at least one symbol, the clear button should be rendered and visible in the DOM.

**Reasoning**: Requirement 5.1 states the clear button should appear when there's content. This is a universal rule about non-empty buffers. We can generate random morse sequences and verify the clear button is always rendered when the buffer has content.

**Validates: Requirements 5.1**

### Property 7: Clear action empties buffer without sending

*For any* non-empty Input Buffer, when the clear button is clicked, the Input Buffer should become empty (zero symbols) and the onTransmissionComplete callback should not be invoked.

**Reasoning**: Requirements 5.2 and 5.3 both describe what happens when clear is clicked - the buffer empties and no transmission occurs. These are two aspects of the same action, so we test them together. We can generate random sequences, simulate clear clicks, and verify both conditions.

**Validates: Requirements 5.2, 5.3**

## Error Handling

### Input State Loss Prevention

- Use `useRef` to maintain a stable reference to the current sequence
- Sync state with ref on every update to prevent loss during re-renders
- Only clear state on explicit user actions (send success, clear button) or parent-initiated clears

### Transmission Failure Handling

- Preserve input buffer when transmission fails
- Display error indicator without clearing user's work
- Allow immediate retry without re-entering morse code
- Provide clear error messaging through existing error banner system

### Audio Failure Handling

- Continue to allow visual-only operation if audio fails
- Don't block send button functionality due to audio issues
- Maintain existing audio error handling patterns

## Testing Strategy

### Unit Tests

- Test send button rendering in all states (empty buffer, with content, disabled, various transmission statuses)
- Test clear button rendering conditions
- Test tooltip text generation for different states
- Test character count calculation from morse sequences
- Test status message generation for different states
- Test localStorage persistence for user preferences
- Test state preservation across re-renders
- Test clear button functionality (empties buffer, doesn't trigger send)

### Property-Based Tests

Property-based tests will use `fast-check` library (already in use in the project) with a minimum of 100 iterations per test.

Each property test will be tagged with: `**Feature: improved-send-button-ux, Property {number}: {property_text}**`

- **Property 1**: Generate random component states, verify send button always exists in rendered output
- **Property 2**: Generate random empty buffer states, verify send button is disabled
- **Property 3**: Generate random non-empty buffer states with idle status, verify send button is enabled
- **Property 4**: Generate random morse sequences, render component, force re-render, verify sequence unchanged
- **Property 5**: Generate random morse sequences, simulate transmission failure, verify sequence preserved
- **Property 6**: Generate random non-empty buffer states, verify clear button is rendered
- **Property 7**: Generate random morse sequences, simulate clear action, verify buffer empty and no send callback
- **Property 8**: Generate random transmission status values, verify status message matches expected text

### Integration Tests

- Test complete user flow: input morse → see send button → click send → see loading → see success
- Test error recovery flow: input morse → send fails → buffer preserved → retry succeeds
- Test clear flow: input morse → click clear → buffer empty → send button disabled
- Test hints flow: first load → see hints → send message → hints disappear
- Test hints dismissal: see hints → dismiss → hints hidden → preference saved

### Edge Cases

- Empty string in buffer
- Very long morse sequences (100+ symbols)
- Rapid state changes (quick send/clear cycles)
- Component unmount during transmission
- localStorage unavailable or full
- Concurrent prop updates during user input

## Implementation Notes

### State Management Strategy

Use a combination of `useState` and `useRef`:
- `useState` for UI-reactive state (isPressed, transmissionStatus, showHints)
- `useRef` for stable sequence storage that survives re-renders
- Sync ref and state on every sequence update

### Backward Compatibility

- All existing props remain unchanged
- Parent components (App) require no modifications
- Existing callbacks (onDotDash, onCharacterBreak, onTransmissionComplete) work as before
- CSS classes maintain existing naming for styling compatibility

### Performance Considerations

- Memoize tooltip and status message calculations
- Debounce character count calculations for very long sequences
- Use React.memo for ActionButtons and HelpHints sub-components if needed
- Minimize re-renders by careful state management

### Accessibility

- Maintain existing ARIA labels
- Add aria-describedby for send button tooltip
- Add aria-live region for status messages
- Ensure keyboard navigation works for all buttons
- Provide screen reader announcements for state changes
