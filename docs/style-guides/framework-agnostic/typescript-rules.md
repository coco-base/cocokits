# TypeScript, naming and docs rules

Rules for types, naming, errors and TSDoc in utils, shared, cdk and machines. The compiler settings are in the workspace `tsconfig`; typed ESLint runs with zero warnings allowed. Lint enforces what it enforces: do not work around it or silence it. The file-size limit is enforced by the `lint` target ([targets.md](../workspace/targets.md)). When a file reaches the limit, split it by responsibility; do not split a coherent file below it only for size.

## Types

- `type` for unions, function and mapped types; `interface` for public, extendable object shapes (props, API).
- No `enum`. Use a string-literal union, plus an `as const` array when a runtime list is needed.
- No `any`. Use `unknown` plus narrowing. A type assertion carries a comment saying why it is sound; avoid non-null `!` outside tests.
- Model events as a discriminated union on `type`. Declare guard, action and effect names as unions so a typo is a compile error.
- Optional props are `x?: T | undefined`. Every exported function, constant and class member has an explicit type. Indexed access is checked for `undefined`.
- Mark inputs `readonly`. Context values are immutable: a new array or object per change.
- An empty value is `null`; an absent option is `undefined`. An adapter or a state container never converts `null` to `undefined`.

## Naming

| Kind | Pattern | Example (illustrative) |
|---|---|---|
| Stateful factory | `create*` | `createRovingFocus` |
| Typed data-only declaration | `define*` | `defineAnatomy` |
| Subscribes and returns a cleanup | `track*` / `trap*` / `observe*` | `trapFocus` |
| Pure getter | `get*` | `getRovingIntent` |
| Prop getter on a machine API | `get<Part>Props` | `getTriggerProps` |
| Boolean | `is*` / `has*` / `can*` / `should*` | `isDisabled` |
| Callback prop | `on<Noun><Verb>` | `onValueChange` |
| Event | `PART.ACTION`, upper snake | `'TRIGGER.CLICK'` |

What a name says about its value (`*Name` strings, no bare `config` or `part`): [architecture §10](../../architecture.md#10-simplicity-and-reuse). No `use*` exports in shared layers: hooks belong to the framework packages. Files are `<component>.<concern>.ts` or `<kebab-name>.ts`. Avoid abbreviations except `id`, `el`, `rtl`/`ltr`, `aria`, `i18n`, `dom`.

## Errors and dev warnings

- Warn, do not throw, for consumer mistakes that degrade. Throw only for programmer errors that make the widget meaningless.
- Do not hide errors with `try/catch`. Catch only around platform APIs known to throw, and warn in the catch.
- Warnings are development-only and say what happened and how to fix it.

## TSDoc

API descriptions are written once, as TSDoc on the source ([architecture, section 8](../../architecture.md)). TSDoc rules: [tsdoc](./tsdoc.md#tsdoc-rules-all-frameworks). Prop docs live on the `Props` interface.

## Performance

- Batch DOM reads before writes within a frame.
- Register `touchstart`, `touchmove` and `wheel` listeners as passive unless `preventDefault()` is needed and documented.
- Do not call `getComputedStyle` or `getBoundingClientRect` while computing a machine's props.
