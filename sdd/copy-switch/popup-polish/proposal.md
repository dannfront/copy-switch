# Proposal: Popup UX Polish

## Intent
The popup window currently lacks visual feedback on copy, cannot be repositioned by the user, and always hides on blur. These three UX gaps create friction: users don't know if copy succeeded, can't move the popup out of the way, and can't keep it visible for reference.

## Scope

### In Scope
- Copy button checkmark animation (~1.5s) in ActionBar
- Draggable top handle bar on popup window
- Pin button to suppress blur-hide behavior (session-only)
- Align popup height to 200px across main and renderer

### Out of Scope
- Persisting pin state across app restarts
- Custom JS drag implementation
- Reusable icon button abstraction

## Capabilities

### New Capabilities
- `popup-window`: Draggable top handle, pin toggle, and blur-aware hide
- `action-bar`: Copy button visual feedback animation

### Modified Capabilities
- None

## Approach
Use a 28px top drag handle with `[-webkit-app-region:drag]` containing a `no-drag` pin button. Pin state lives as a module-level variable in `popup.ts`; blur handler checks it before hiding. Copy feedback uses local `useState` + `setTimeout(1500)` in ActionBar, conditionally rendering a checkmark SVG. IPC channels `popup:toggle-pin` and `popup:pinned-changed` mirror existing patterns.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/main/windows/popup.ts` | Modified | Add `isPinned` variable, update blur handler, emit `popup:pinned-changed` |
| `src/main/ipc/handlers.ts` | Modified | Add `popup:toggle-pin` handler |
| `src/preload/index.ts` | Modified | Expose `popup.togglePin()` |
| `src/preload/index.d.ts` | Modified | Add `togglePin` to `Api` interface |
| `src/renderer/src/pages/Popup.tsx` | Modified | Add drag handle bar, pin button, height alignment |
| `src/renderer/src/components/ActionBar.tsx` | Modified | Add `copied` state and checkmark icon |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|-------------|
| Drag region breaks pin button clicks | Low | Pin button gets explicit `[-webkit-app-region:no-drag]` |
| Blur fires before pin state updates | Low | Pin toggle is synchronous in main process |
| Clipboard API throws on restricted systems | Low | Existing async handler already covers this |

## Rollback Plan
Revert all six files to pre-change state. No schema migrations or persistent state changes required.

## Dependencies
None

## Success Criteria
- [ ] Copy button shows checkmark for ~1.5s after click, then reverts
- [ ] Popup can be dragged by top handle on Windows/macOS/Linux
- [ ] Pin button toggles; when pinned, popup stays open on blur
- [ ] When unpinned, popup hides on blur as before
- [ ] No interactive elements become unclickable
