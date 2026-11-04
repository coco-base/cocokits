# Manual accessibility testing

Automated checks find only part of the issues; keyboard and screen-reader passes cover the rest. Treat the lists below as guidance and never report a pass you did not perform.

## When a manual pass is worth doing

- A change to an interactive component's behaviour, roles, keyboard handling, focus logic or announcements, and a new interactive component.
- A theme change that alters focus indicators or colour-coded state: a keyboard and forced-colors pass.

## Screen readers

Suggested combinations: NVDA with Chrome or Firefox (Windows), VoiceOver with Safari (macOS and iOS), JAWS with Chrome or Edge, TalkBack with Chrome, Narrator with forced colors in Edge. A component change should be checked with at least one Windows and one Apple combination when available.

## Keyboard pass

1. Tab into the component: focus lands on the expected element with a visible ring.
2. Walk every documented key in LTR and RTL, horizontal and vertical where supported; compare with the APG page, not only with the component's requirements.
3. Disabled items behave as the pattern says (skipped, or focusable but not activatable).
4. Escape closes only the topmost layer, including inside a native modal dialog; focus returns to the trigger.
5. Tab and Shift+Tab leave the composite; there is one tab stop inside it.
6. Overlays: opening moves focus into the content (tooltips, hover cards and combobox popups excepted); Tab and Shift+Tab leave around the trigger; a modal never lets Tab or the virtual cursor reach the page behind.
7. 200% zoom and a narrow viewport: focus is never hidden by sticky content.
8. Forced colors: state and focus stay visible.
9. `prefers-reduced-motion: reduce`: no movement, correct end states, exits complete.

## Screen-reader pass

1. Reach the component with Tab and with the virtual cursor.
2. Name, role and state are announced.
3. Change the state by keyboard; the new state is announced.
4. Relationships are announced (for example position in a set), and related panels are reachable and named.
5. Errors and descriptions are announced when focus enters the control.
6. Live announcements are spoken once at the right politeness.
7. Nothing decorative is announced.
8. Overlays: on open the content is announced with its role and name; a modal's background is not reachable; the trigger announces its expanded state.

## Recording the result

In the PR, list what you ran: the assistive technology and browser, the steps, the expected and actual result. Write "not tested: <reason>" for anything you did not run.
