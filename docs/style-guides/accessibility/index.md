# Accessibility style guide

How CocoKits components meet the WAI-ARIA Authoring Practices (APG) and WCAG 2.2 AA in every framework. Behaviour, roles and ARIA live in the base (machines, cdk, framework parts), never in a theme; visual requirements (focus ring, contrast, forced colors, motion, target size) are in [themes](../themes/index.md). The accessibility invariants are in [architecture.md](../../architecture.md); this guide adds the detail.

## Load on demand

| File | Load when |
|---|---|
| [apg-patterns.md](./apg-patterns.md) | Choosing the APG pattern for a widget and its focus strategy; required vs optional APG behaviour |
| [aria-rules.md](./aria-rules.md) | Native semantics first, roles, ids, accessible names, disabled and read-only states, live regions, strings, RTL, touch |
| [keyboard.md](./keyboard.md) | General keyboard rules (every documented key has a test); RTL, orientation, IME, Escape layering, one tab stop |
| [focus-and-overlays.md](./focus-and-overlays.md) | Roving focus vs `aria-activedescendant`, modal dialogs, focus return, portaled content, tooltips and combobox popups |
| [manual-testing.md](./manual-testing.md) | Keyboard and screen-reader passes; evidence for a PR |
