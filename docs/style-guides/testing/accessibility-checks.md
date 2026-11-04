# Accessibility checks in tests

What automated tests can prove about accessibility, and what stays manual. Keyboard maps, focus rules and ARIA patterns are in [accessibility](../accessibility/index.md); this file only says how tests check them.

## Automated accessibility checking

When a package has an automated accessibility checker (for example an axe-based matcher):

- Run it on every documented state of a component, not only the initial render: closed, open, selected, disabled, invalid, read-only.
- Run it on `document.body` when an overlay is open, because overlay content is portaled outside the component root.
- Colour contrast cannot be judged on the unstyled base; check it only where a theme is applied.
- Treat it as one input: it does not replace the checks below or the manual pass.

## What tests assert directly

These are ordinary component tests, not checker rules (roles, keyboard and focus: [component-tests](./component-tests.md)):

- Live regions: a semantic alert or status keeps its role; a transient announcement goes through the shared live region. Assert one of them per message, not both.

Inactive panels that another element references stay mounted and `hidden`, so `aria-controls` resolves.

## Manual checks

Automated checks do not replace a keyboard and screen-reader pass for a changed interactive component; see [manual-testing](../accessibility/manual-testing.md). If you could not run a checker or a screen reader, say so in the reply and the PR; do not claim a check you did not perform.
