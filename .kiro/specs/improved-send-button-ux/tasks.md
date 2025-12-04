# Implementation Plan

- [x] 1. Refactor TelegraphKey state management for reliability
  - Update state management to use both useState and useRef for sequence storage
  - Implement stable reference pattern to prevent input loss during re-renders
  - Add transmission status state ('idle' | 'sending' | 'success' | 'error')
  - Sync ref and state on every sequence update
  - _Requirements: 3.1, 3.2, 3.5_

- [x] 1.1 Write property test for input buffer preservation on re-render
  - **Property 4: Input buffer preserved on re-render**
  - **Validates: Requirements 3.1, 3.2, 3.5**

- [x] 2. Make send button always visible with proper disabled states
  - Remove conditional rendering of send button (always render it)
  - Add disabled state logic based on buffer content and transmission status
  - Update button styling to show disabled/enabled states clearly
  - Add aria-describedby for accessibility
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2.1 Write property test for send button always rendered
  - **Property 1: Send button always rendered**
  - **Validates: Requirements 1.1**

- [x] 2.2 Write property test for send button disabled when buffer empty
  - **Property 2: Send button disabled when buffer empty**
  - **Validates: Requirements 1.2**

- [x] 2.3 Write property test for send button enabled when buffer has content
  - **Property 3: Send button enabled when buffer has content**
  - **Validates: Requirements 1.3**

- [x] 3. Add clear button functionality
  - Create clear button that appears when buffer has content
  - Implement handleClear function that empties buffer without triggering send
  - Add disabled state for clear button during transmission
  - Style clear button consistently with send button
  - Add visual confirmation feedback on clear
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3.1 Write property test for clear button visibility
  - **Property 6: Clear button visible when buffer has content**
  - **Validates: Requirements 5.1**

- [x] 3.2 Write property test for clear action behavior
  - **Property 7: Clear action empties buffer without sending**
  - **Validates: Requirements 5.2, 5.3**

- [x] 4. Improve visual feedback and status messages
  - Add character count display alongside morse sequence
  - Implement status message display for different transmission states
  - Add placeholder text for empty buffer state
  - Add loading indicator during transmission
  - Add success/error indicators with appropriate timing
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4.1 Write unit tests for status message generation
  - Test status messages for idle, sending, success, and error states
  - Test character count calculation from morse sequences
  - _Requirements: 2.1, 2.3, 2.4, 2.5_

- [x] 5. Preserve input buffer on transmission failure
  - Update handleSendTransmission to not clear buffer immediately
  - Only clear buffer on successful transmission confirmation
  - Preserve buffer when transmission fails for retry capability
  - Update transmission status to 'error' on failure
  - _Requirements: 3.3, 3.4_

- [x] 5.1 Write property test for buffer preservation on failure
  - **Property 5: Input buffer preserved on transmission failure**
  - **Validates: Requirements 3.4**

- [x] 6. Add tooltip support for disabled send button
  - Implement getSendButtonTooltip helper function
  - Add tooltip display on hover for disabled button
  - Provide contextual messages (empty buffer, transmission in progress, etc.)
  - Ensure tooltip is accessible (aria-describedby)
  - _Requirements: 1.5_

- [x] 6.1 Write unit tests for tooltip text generation
  - Test tooltip text for various disabled states
  - Test tooltip accessibility attributes
  - _Requirements: 1.5_

- [x] 7. Add help hints for new users
  - Create HelpHints sub-component with contextual guidance
  - Implement localStorage-based user preferences for hint visibility
  - Show hints on first load, hide after first successful send
  - Add dismiss button for hints
  - Display appropriate hints based on current state (empty buffer, first symbol, etc.)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7.1 Write unit tests for help hints component
  - Test hint visibility logic based on state
  - Test localStorage persistence of preferences
  - Test hint dismissal functionality
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Update component styling for new elements
  - Add CSS for always-visible send button states
  - Style clear button to match telegraph aesthetic
  - Add styles for action buttons container
  - Style help hints component with dismissible design
  - Add styles for status messages and indicators
  - Ensure responsive design for all new elements
  - _Requirements: All visual requirements_

- [x] 9. Update parent component integration
  - Verify App.jsx works correctly with enhanced TelegraphKey
  - Ensure all existing callbacks continue to work
  - Test that transmission flow works end-to-end
  - Verify error handling integration
  - _Requirements: All requirements_

- [x] 9.1 Write integration tests for complete user flows
  - Test flow: input morse → see send button → click send → see loading → see success
  - Test flow: input morse → send fails → buffer preserved → retry succeeds
  - Test flow: input morse → click clear → buffer empty → send button disabled
  - Test flow: first load → see hints → send message → hints disappear
  - _Requirements: All requirements_

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
