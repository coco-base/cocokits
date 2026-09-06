# Component and utility work

Read the root `AGENTS.md` first. Paths below are repository-relative.

## A focused change

1. Locate the public export, implementation, shared class definition, and existing
   story. For a visual issue, inspect the theme SCSS before changing behavior.
2. Reproduce the actual state combination: framework, theme, mode, props, form
   state, and user action. Check the counterpart framework only as relevant to the
   contract being changed; matching directory names do not prove feature parity.
3. Fix the responsible layer. Add a focused regression case where a test harness
   exists and an interactive story when that is the clearest reproduction.
4. Update public JSDoc, story controls/displayed source, exports, and Changeset as
   appropriate. Validate using the [workflow matrix](workflow.md).

## Angular conventions

- Start with `packages/angular/button/src/lib/button/button.component.ts` for a
  simple component, and `packages/angular/form-field/src/lib/input/input.component.ts`
  for native-input/form integration. Inspect the relevant neighboring component
  for complex behavior rather than treating either example as universally correct.
- Components typically extend `_UiBaseComponent<'componentName'>` from
  `packages/angular/core/src/ui-base.component.ts`, use signals/computed/inject,
  `ChangeDetectionStrategy.OnPush`, and `ViewEncapsulation.None`.
- Preserve existing selectors, input aliases, public outputs, projection slots,
  host bindings, and signal semantics. Use established input transforms (for
  example `toBooleanOrPresent`) where the surrounding API uses them.
- Theme inputs are `_type`, `_size`, `_color` aliased to public names. Theme-only
  extra attributes are collected from `data-cck-*` into `additional`.
- Use the base class's `classNames()`/`hostClassNames()` and state class conditions;
  do not introduce a second class naming scheme.
- Native input `type` is distinct from a theme's visual `type`; the existing input
  uses `baseClassOptions.skipType`. Preserve such collisions deliberately.
- Form-field children register/unregister with their store and cooperate with
  `NgControl`/Angular Forms. Check disabled, required, touched/invalid, reset,
  focus, and component removal. Use the particular control's established form
  integration; do not assume every input implements ControlValueAccessor itself.
- Dispose subscriptions, listeners, observers, and overlay resources on teardown.

## React conventions

- Start with `packages/react/button/src/lib/button.tsx` and
  `packages/react/form-field/src/lib/input.tsx`. Layout varies: newer components
  may live in `src/lib/<component>/<component>.tsx`; use `rg --files` to locate them.
- Theme configuration comes from `ThemeConfigContext`; `useUiBaseComponentConfig`
  generates classes and throws if the provider is missing. Include a provider in
  tests/stories that render themed components.
- Preserve TypeScript native-element props, refs, className, style, children,
  callback composition, and controlled/uncontrolled behavior. Existing components
  use `forwardRef` where appropriate; a refactor to a new React API is separate work.
- Theme props use `type`, `size`, `color`, `additional`. Omit conflicting native
  attributes from extended prop interfaces and use `skipProps` where necessary
  (the input skips theme type). Avoid leaking internal theme props onto the DOM.
- Preserve client boundaries (`'use client'`), hook ordering, effect cleanup, and
  local store registration. Form inputs support `react-hook-form`; test both
  integrated and ordinary native-input paths when touching that logic.

## Shared code and compatibility

`packages/common/core` owns the common selector/prop contract. Its
`src/lib/ui-component-props/ui-component-props.spec.ts` covers theme prop handling.
Do not collapse `null` and `undefined`: size/color/additional preserve `null` to
opt out of defaults. The current resolver explicitly sets `acceptNull: false`
for `type`, so `type: null` falls back to the configured default despite broader
base-input JSDoc. Verify this exception before documenting or changing its API.

`packages/common/utils` contains shared algorithms and browser helpers, with
Vitest tests colocated beside implementations. It also contains RxJS code, so do
not assume every helper is dependency-free just because older docs say so. Keep
pure data operations separate from framework components and browser-dependent code.
Document new exported helpers with JSDoc and useful `@example` blocks; utility MDX
is generated from those comments.

For selector/DOM changes inspect all of:

- `src/lib/model/ui-base-components-name.ts` in shared core;
- the component's class definition, `layoutClassNamesConfigRecord`, and
  `CLASS_NAMES_FN_MAP` in shared core;
- both framework templates/render functions and their public barrels;
- both theme configurations and matching SCSS mixins;
- both docs where the affected API/structure is demonstrated.

`getHostClassNamesFromProps` explicitly notes duplicated selector logic in
`packages/internal/storybook-addon-theme/src/lib/features/story-doc-page/story-doc-page-styling.utils.tsx`.
Keep the styling documentation's selector generation aligned when changing that
shared logic.

Do not add visual brand choices to the shared/framework layers. Preserve semantic
HTML, accessible naming, keyboard interactions, focus behavior, disabled behavior,
and overlay dismissal/restoration when implementing interactive components.

## Adding a component or library

The workspace generator `@cocokits/workspace-plugin:ui-core-component` coordinates
shared names/classes, both themes, Angular/React code, and docs. Read
`tools/workspace-plugin/src/generators/ui-core-component/schema.json`,
`generator.ts`, and `utils/options.util.ts` before running it.

Preview example (replace the proposed names with the requested component):

```text
pnpm exec nx g @cocokits/workspace-plugin:ui-core-component --name=tooltip --newLibraryName=Tooltip --dry-run
```

For an existing library, the option is literally **`exitingLibraryName`** (a typo
in the schema); supply it instead of `newLibraryName`. The options helper requires
exactly one library choice. `skipStorybook` defaults to false. Review the dry-run,
then run without `--dry-run` if creating those files is within the task.

Scaffolding is a starting point: implement semantics and accessibility, complete
both theme mixins/configs as required by scope, verify exports and package
dependencies, and replace placeholder docs. Other registered generators are
`library`, `component`, `setup-storybook`, and `example-story`; inspect their own
schemas instead of guessing flags. A generator source directory alone does not
mean that generator is registered in `generators.json`.
