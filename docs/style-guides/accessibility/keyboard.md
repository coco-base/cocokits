# Keyboard

General keyboard rules for interactive components. Which keys a given component handles comes from its requirements and the APG pattern it follows, not from this file ([architecture.md](../../architecture.md), [apg-patterns](./apg-patterns.md)).

## Rules

- Follow the APG pattern's keyboard interaction for the widget. If APG has no pattern, name the reference used in the component's requirements.
- Never implement or document a key that is not part of the component's requirements.
- Map physical keys to semantic intents in one place (next, previous, first, last), aware of `orientation` and `dir`; behaviour code handles the intent, not `ArrowLeft` / `ArrowRight`.
- Ignore keydown while `event.isComposing` (IME) and ignore modifier combinations the component does not handle.
- Keep exactly one tab stop per composite widget; Tab and Shift+Tab leave it ([focus-and-overlays](./focus-and-overlays.md)). Optional arrow navigation never turns native Tab order into roving.
- Escape closes only the topmost layer when overlays are stacked.
- Consumer veto: [machines](../framework-agnostic/machines.md#props-per-part).
- Horizontal arrows flip in RTL; vertical orientation uses up/down. Both are in one place, not scattered.
- Disabled, read-only and loop behaviour follow the pattern ([aria-rules](./aria-rules.md)): state which one applies and test it.

## Example (illustrative)

```ts
// Incorrect: physical key check inside behaviour code
if (event.key === 'ArrowRight') next();

// Correct: semantic intent, RTL- and orientation-aware, IME-safe
if (event.isComposing) return;
const intent = getIntent(event.key, { orientation, dir });
if (intent === 'next') next();
```

## Testing

Tests: [component-tests](../testing/component-tests.md); manual pass: [manual-testing](./manual-testing.md).
