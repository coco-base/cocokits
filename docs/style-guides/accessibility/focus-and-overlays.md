# Focus management and overlays

Where focus goes, how it comes back, and what changes because overlay content is portaled. The overlay invariants are in [architecture.md](../../architecture.md). Widgets named here are examples; a component's actual focus contract comes from its approved requirements.

## Focus strategy

- **Roving tabindex** (for example toolbars, tab lists, radio groups, menus): exactly one item has `tabIndex=0` (the selected one, or the first enabled); the rest `-1`. Focus events synchronise the active item (pointer or programmatic focus on an item makes it the active one), and the tab stop is revalidated when items are disabled, removed or reordered.
- **`aria-activedescendant`** (for example a combobox, or a listbox in a popup): DOM focus stays on the input or container; the active item is pointed to by id.
- Choose per APG pattern ([apg-patterns](./apg-patterns.md)); never mix both in one widget.
- Do not steal focus on mount except for modals or an explicit auto-focus option.
- Keyboard modality may be exposed as `data-focus-visible`; the base never removes outlines.
- Find items through registered element refs or the part class, in DOM order, with shadow-root-safe helpers; never `[data-part]`.
- Deferred focus goes through the shared scheduler and re-reads state; never a bare `setTimeout(() => el.focus())`.
- Virtualised or async collections keep the active item rendered.

## Overlays are portaled

Every floating part renders in an overlay container that belongs to the trigger's closest overlay host (the document's fullscreen element, else an open modal `<dialog>` containing the trigger, else the trigger's shadow root, else the end of `<body>`). An overlay opened from inside a modal dialog lives in the dialog's container and is not made inert by it. DOM order is not focus order or reading order, so focus is managed explicitly.

### Modal dialogs

| Concern | Owner |
|---|---|
| Inertness of everything outside | The native `<dialog>` modal (`showModal()`); no manual `inert` on the app root and no Tab-only trap |
| Escape / `cancel` | A dismissal layer stack: Escape closes only the top layer, so an overlay open inside the dialog closes first and the dialog stays open |
| Scroll locking | One shared scroll lock |
| Initial focus and focus return | Initial focus on a sensible element; return focus to the trigger (or a fallback if it is gone) on close |
| Nested modals | The inner dialog opens inside the outer one's container |

- `aria-modal="true"` and a label on the dialog. Behaviour never depends on where the dialog is declared in the template.
- An alert-style dialog puts initial focus on the least destructive action.

### Non-modal overlays that take focus (popovers, menus, select content)

They do not trap focus:

- On open, focus moves into the content.
- On close (Escape, selection, outside click on non-focusable space), focus returns to the trigger. An outside click on another focusable element leaves focus there.
- Tab out: focus guards (invisible sentinels at both ends of the content) send Tab from the last focusable to the element after the trigger and Shift+Tab from the first back to the trigger. Whether the overlay closes when focus leaves follows the pattern.

### Exceptions

- Tooltips and hover cards never take focus; a tooltip describes the trigger through `aria-describedby`. Floating content that is not focusable must not hold information unreachable from the keyboard.
- Combobox-style popups keep DOM focus on the input or trigger and move `aria-activedescendant` into the portaled list.

### Exiting overlays

An exit completes immediately when no CSS animation runs (a transition is not awaited); reopening during an exit cancels it. An exiting overlay no longer takes part in focus, dismissal or inertness.

### ARIA across the portal

- Keep `aria-controls`, `aria-expanded` and `aria-haspopup` on the trigger; ids resolve because both ends are in the same document.
- Portaled content is read at the end of the page in browse mode; moving focus in on open (and `aria-modal` for dialogs) puts it in context.
- Theme scope, mode and `dir` reach the content from the trigger's ancestors ([themes/overlays-and-theme-scope](../themes/overlays-and-theme-scope.md)).

## Testing

Overlay tests: [overlays-and-positioning](../framework-agnostic/overlays-and-positioning.md#rules-for-every-framework-adapter); manual pass: [manual-testing](./manual-testing.md).
