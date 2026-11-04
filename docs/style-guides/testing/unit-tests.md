# Unit tests

Logic without a framework: `@cocokits/utils`, `@cocokits/shared`, `@cocokits/cdk`, `@cocokits/machines` and the tool projects in `tools/*`. They run in node with Vitest through the package's `test` target (`pnpm nx run <project>:test`, [targets.md](../workspace/targets.md)). Rendered DOM, roles and keyboard in a real DOM are covered by [component tests](./component-tests.md).

## Files

Tests live in the package's `tests/` folder, named after the unit they cover (`<name>.test.ts`). Group by what the unit does, not by file.

## What to cover

- **Utils and shared**: table-driven tests (`it.each` with object rows), edge cases included, locale-independent expectations (fixed time zone, `Intl` for formatted strings). Cover every branch of a pure function. For shared contracts, assert the contract (for example that anatomy output has classes per part and no role or attribute, and the `data-*` naming helpers).
- **Machines**: transitions and guards; controlled, uncontrolled and "controlled but the parent ignores the change"; change callbacks per [architecture.md](../../architecture.md) section 6; the props each part receives for each state (ids deterministic from the given id; booleans per [machines](../framework-agnostic/machines.md)); keyboard maps. A "does not X when guarded" test pairs with a sibling where only the guard flips. For items-based machines: DOM-order re-evaluation, and falling back to the first enabled item when the selected item is removed or disabled.
- **CDK modules**: pure parts (key maps, geometry, id generation) in node. Code that needs layout, focus or pointer is tested in a DOM environment in the same package; it is still a unit test of the module. Cleanup: listeners, observers and timers are removed on destroy, and destroy is idempotent.
- **Tools** (`tools/*`): table-driven tests per rule and per error code. A tool that prints code compares it with small golden files, one per pattern, in `tests/golden/*.golden`; the extension keeps lint, typecheck and Prettier away from them. A deliberate change to the printed code updates the golden files in the same commit, and a reviewer reads their diff. Generated code is also compiled in a scratch folder under the project's `tmp/` (ignored by git and lint) by the checker of its language, with a failing case for each.
- **Import safety**: importing an entry point of a framework-free package (utils, shared, cdk, machines) in node, without `window` or `document`, does not throw and has no side effects. This is the test for the framework-free, SSR-safe invariant in [architecture.md](../../architecture.md).

## Rules

Shared test rules: [testing](./index.md).

- No DOM globals in node tests; if a test needs a DOM, it is a component test or a DOM test of the module.
- Type assertions (`expectTypeOf`, `@ts-expect-error`) live in the same test files; there is no separate type-test target.

## Example (illustrative)

```ts
it.each([
  { checked: true, disabled: false, expected: true },
  { checked: true, disabled: true, expected: false },
])('onChange fires only when allowed: %o', ({ checked, disabled, expected }) => {
  const onChange = vi.fn();
  const unit = createExample({ disabled, onChange });
  unit.toggle(checked);
  expect(onChange.mock.calls.length > 0).toBe(expected);
});
```
