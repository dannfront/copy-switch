# Spec: Popup UX Polish

## Domain: popup-window

### Purpose
Behavior of the translation popup window, including drag handle, pin state, and blur-aware visibility.

### Requirements

#### Requirement: Draggable Top Handle

The popup window MUST display a 28px drag handle bar at the top. The handle MUST use `[-webkit-app-region:drag]` to enable native OS dragging. All other popup content MUST remain interactive and MUST NOT be inside the drag region.

#### Scenario: User drags popup by top handle

- GIVEN the popup is visible
- WHEN the user clicks and drags the top handle bar
- THEN the popup window moves with the cursor using native OS drag behavior

### Requirement: Pin Button

The popup MUST provide a pin button inside the drag handle. The pin button MUST have `[-webkit-app-region:no-drag]`. When clicked, the system MUST toggle a session-level pin state. When pinned, the popup MUST NOT hide on blur. When unpinned, the popup MUST hide on blur as before. The renderer MUST receive `popup:pinned-changed` events to update the pin button visual state.

#### Scenario: Pin popup to keep visible

- GIVEN the popup is visible and unpinned
- WHEN the user clicks the pin button
- THEN the pin state becomes pinned
- AND the popup does not hide when it loses focus

#### Scenario: Unpin popup to restore blur-hide

- GIVEN the popup is visible and pinned
- WHEN the user clicks the pin button again
- THEN the pin state becomes unpinned
- AND the popup hides when it loses focus

### Requirement: Popup Height Consistency

The popup window height MUST be 200px in both main process window creation and renderer root layout.

## Domain: action-bar

### Purpose
Actions available on translated text, including copy with visual feedback.

### Requirements

#### Requirement: Copy Button Feedback

The copy button MUST temporarily display a checkmark icon for approximately 1.5 seconds after a successful copy operation, then MUST revert to the copy icon. The feedback MUST only trigger after `navigator.clipboard.writeText()` resolves successfully.

#### Scenario: User copies translation successfully

- GIVEN translated text is present
- WHEN the user clicks the copy button
- THEN the text is written to the clipboard
- AND the button icon changes to a checkmark
- AND after ~1.5 seconds the icon reverts to the copy icon

#### Scenario: Copy button disabled when no translation

- GIVEN no translated text is present
- WHEN the user views the action bar
- THEN the copy button is disabled
- AND no feedback animation can be triggered
