# APG patterns

A component follows the WAI-ARIA Authoring Practices pattern for its widget: <https://www.w3.org/WAI/ARIA/apg/patterns/>. Read the pattern's page for its roles, states, keyboard interaction and focus management before implementing; do not work from memory.

A component's actual keyboard and ARIA contract comes from its approved requirements and its tested implementation, not from this file ([architecture.md](../../architecture.md)). The table below only helps choose a focus strategy; it does not specify any CocoKits component.

## Required, optional and library choices

- Behaviour the APG pattern prescribes is **required**; never drop it.
- Behaviour APG lists as optional may be added; an optional behaviour never removes a required one (for example, optional arrow keys between disclosure headers do not take the headers out of the Tab order).
- Where APG allows either (for example whether disabled items are skipped), the choice is made once per component in its requirements and tested.

## Focus strategy by widget family

"Roving" is roving tabindex; "AD" is `aria-activedescendant`. Follow the pattern page for the details.

| Widget family (APG pattern) | Usual focus strategy |
|---|---|
| Button, checkbox, switch, link, disclosure, slider, spinbutton | Native focus on the element |
| Radio group, tabs, toolbar, menu, menubar, tree view, inline listbox | Roving; one tab stop |
| Combobox, listbox or tree in a popup | AD; DOM focus stays on the input or container |
| Grid, treegrid | Roving by cell |
| Dialog, alert dialog | Native `<dialog>` modal; focus moves in and returns |
| Tooltip | Never focusable; trigger uses `aria-describedby` |
| Alert, status | Pre-rendered live region; never steals focus |

## Widgets APG does not define

For widgets with no APG pattern (toast, select, popover, date picker and similar), choose a well-established reference, record the choice in the component's requirements, and keep the invariants in this guide: toasts announce through the live region and never steal focus; non-modal popovers are portaled, do not trap focus, move focus in on open and return it on close ([focus-and-overlays](./focus-and-overlays.md)); hover-only content must not hold information that is unreachable from the keyboard.

Dragging interactions (slider, splitter, drawer) always have a keyboard or single-pointer alternative.
