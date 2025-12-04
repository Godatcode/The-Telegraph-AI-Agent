# Requirements Document

## Introduction

This feature addresses UX issues with the telegraph transmission interface where the send button visibility is inconsistent and users are unclear about how to interact with the system. The goal is to improve button visibility, state management, and provide clearer user guidance.

## Glossary

- **Telegraph Key**: The interactive button component that users press to input Morse code dots and dashes
- **Send Button**: The button that transmits the completed Morse sequence to the backend
- **Morse Sequence**: A string of dots (.) and dashes (-) representing encoded text
- **Transmission**: The act of sending a Morse sequence to the backend for processing
- **Input Buffer**: The current Morse sequence being composed by the user
- **Disabled State**: A UI state where user input is temporarily blocked during processing

## Requirements

### Requirement 1

**User Story:** As a user, I want the send button to always be visible, so that I know where to look when I'm ready to send my message.

#### Acceptance Criteria

1. WHEN the telegraph interface loads THEN the Telegraph Key component SHALL display a send button at all times
2. WHEN the Input Buffer is empty THEN the Telegraph Key component SHALL display the send button in a disabled visual state
3. WHEN the Input Buffer contains at least one symbol THEN the Telegraph Key component SHALL display the send button in an enabled visual state
4. WHEN a Transmission is in progress THEN the Telegraph Key component SHALL display the send button in a disabled visual state with appropriate feedback text
5. WHEN the user hovers over a disabled send button THEN the Telegraph Key component SHALL display a tooltip explaining why the button is disabled

### Requirement 2

**User Story:** As a user, I want clear visual feedback about the current state of my input, so that I understand what the system is doing.

#### Acceptance Criteria

1. WHEN the user is actively composing a Morse Sequence THEN the Telegraph Key component SHALL display the current sequence length and character count
2. WHEN the Input Buffer is empty THEN the Telegraph Key component SHALL display placeholder text indicating the user should start tapping
3. WHEN a Transmission is being sent THEN the Telegraph Key component SHALL display a loading indicator with status text
4. WHEN a Transmission completes successfully THEN the Telegraph Key component SHALL display a brief success indicator before clearing
5. WHEN a Transmission fails THEN the Telegraph Key component SHALL display an error indicator without clearing the Input Buffer

### Requirement 3

**User Story:** As a user, I want the input state to persist reliably, so that I don't lose my work if something unexpected happens.

#### Acceptance Criteria

1. WHEN the user inputs Morse symbols THEN the Telegraph Key component SHALL maintain the Input Buffer state consistently across re-renders
2. WHEN the parent component updates props THEN the Telegraph Key component SHALL preserve the Input Buffer unless explicitly cleared
3. WHEN a Transmission is initiated THEN the Telegraph Key component SHALL preserve the Input Buffer until successful transmission confirmation
4. WHEN a Transmission fails THEN the Telegraph Key component SHALL retain the Input Buffer so the user can retry
5. WHILE the user is composing a message IF the component re-renders THEN the Telegraph Key component SHALL not lose any input symbols

### Requirement 4

**User Story:** As a new user, I want clear instructions on how to use the telegraph interface, so that I can start communicating immediately.

#### Acceptance Criteria

1. WHEN the telegraph interface first loads THEN the Telegraph Key component SHALL display brief usage instructions
2. WHEN the Input Buffer is empty THEN the Telegraph Key component SHALL display a hint about tap duration for dots and dashes
3. WHEN the user completes their first symbol THEN the Telegraph Key component SHALL display a hint about the send button
4. WHEN the user has sent at least one Transmission THEN the Telegraph Key component SHALL hide instructional hints
5. WHERE the user prefers minimal UI THEN the Telegraph Key component SHALL provide an option to permanently hide hints

### Requirement 5

**User Story:** As a user, I want to easily clear my current input without sending, so that I can start over if I make mistakes.

#### Acceptance Criteria

1. WHEN the Input Buffer contains at least one symbol THEN the Telegraph Key component SHALL display a clear button
2. WHEN the user clicks the clear button THEN the Telegraph Key component SHALL empty the Input Buffer immediately
3. WHEN the user clicks the clear button THEN the Telegraph Key component SHALL not send any Transmission
4. WHEN the clear button is clicked THEN the Telegraph Key component SHALL provide visual confirmation of the clear action
5. WHEN a Transmission is in progress THEN the Telegraph Key component SHALL disable the clear button
