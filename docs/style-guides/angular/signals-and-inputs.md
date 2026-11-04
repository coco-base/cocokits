# Signals, inputs, models and outputs

How state, inputs and events are declared on a part. Names below are examples.

## Reactivity

- Keep all state in `signal` / `computed` / `linkedSignal`. No `BehaviorSubject` for state, `ChangeDetectorRef.markForCheck()` / `detectChanges()`, `NgZone`, or `setTimeout` to "wait for CD".
- Use `computed` for derived state and `linkedSignal` for writable state reset by a source.
- Pass a signal on as the signal (`size: theme.size`), never as a function that reads it or a `computed` that wraps it. The value is derived once, in the `computed` that consumes it; a provider or helper never adds a `computed` its caller cannot see. Type such parameters `Signal<T>`, so a reader function does not compile.
- Do not use `effect` to write one signal from another. `effect` is only for side effects outside the reactive graph (embedded views, third-party widgets); wrap non-reactive work in `untracked`.
- Use `set` / `update`; never mutate signal contents in place (`registry.update((s) => new Set(s).add(item))`).
- Call `inject()` only in field initialisers and constructors.

## Inputs, outputs, models

- Use `input()`, `input.required()`, `output()`, `model()`; not `@Input`, `@Output`, `EventEmitter`.
- Mark them `readonly`. Template-only members are `protected`.
- Boolean inputs use `input(false, { transform: booleanAttribute })` so `<button cckExample disabled>` works; numbers use `numberAttribute`. No custom coercion helpers.
- Name outputs for what happened (`checkedChange`, `valueChangeDetails`), never after DOM events (`change`, `click`, `focus`, `blur`, `input`): the native event bubbles to the host and fires the same listener.
- Avoid `input.required()` on a child value that the parent reads in a `computed` during the first change detection; use `input('')` plus a dev warning.
- Suggested member order: injected deps, inputs/models, outputs, public computed, private state, constructor, public methods, private methods.

## Controlled / uncontrolled: `model()`

The primary value is a `model()`. A static attribute or one-way binding is the initial value, so there is no `defaultValue` input. Three usages work: `[(value)]`, `[value]="x"` / `value="x"`, or unbound. Controlled/uncontrolled mapping across frameworks: [architecture](../../architecture.md).

```ts
// Example (illustrative)
readonly checked = model(false);
readonly checkedChangeDetails = output<ValueChangeDetails<boolean, 'user' | 'form-reset'>>();

toggle(event?: Event): void {
  if (this.disabled()) return;
  this.setChecked(!this.checked(), event);
}
setChecked(value: boolean, event?: Event): void {
  if (value === this.checked()) return;
  this.checked.set(value);
  this.checkedChangeDetails.emit({ value, reason: 'user', event: event ?? null });
}
```

- The model's own `xChange` output gives the new value. A second output with details (`{ value, reason, event }`) is emitted only from the action method. The details type is `ValueChangeDetails<T, Reason>` from `@cocokits/shared`. The reasons are `'user'` (an interaction) and `'form-reset'` (a native reset); there is no `'api'` reason, because a write from the parent or a forms library emits nothing.
- A derived value (a default item when nothing is bound) is a `computed`, never a model write from an `effect`.
- Writes arriving through the model input (parent or form) must not re-emit the details output.
- With a one-way `[value]`, an internal `set()` diverges from the parent until the parent sets a new value. That is the documented model semantics; document it, do not fight it.
- A selection model is `model<T | null | undefined>(undefined)`: `undefined` (unbound) means "apply the default", `null` means "nothing selected" and is never converted.

## Ids

Every element that needs an id gets a generated one from the fw-core id generator, which is SSR-stable (`readonly id = input(inject(IdGenerator).getId('cck-example-'))`, illustrative). Part ids derive from a generated id plus the part name (`${item.id()}-trigger`), so `aria-controls` / `aria-labelledby` never need a lookup. Never derive an id from an item value (values with punctuation or whitespace collide) and never use `Math.random()`, `Date.now()` or a module-level counter (not SSR-stable). Where a value must appear in an id, encode it with `toIdSegment` from `@cocokits/utils`.
