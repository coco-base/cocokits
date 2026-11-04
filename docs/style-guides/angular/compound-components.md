# Compound components: content projection and DI registration

How parent/child components are authored in Angular. The shared rule (same rendered contract in every framework, ids generated) is in [architecture](../../architecture.md). Why: [rendered contract](../../why/rendered-contract.md). Names below are examples.

## Authoring shape

One child element per section holds its own header and content and is configured on its own element:

```html
<!-- Example (illustrative) -->
<div cckExample [(value)]="selected">
  <div cckExampleItem value="a" label="A">…</div>
  <div cckExampleItem value="b" [disabled]="locked()">…</div>
</div>
```

- No config-array input (`[items]="[…]"`).
- Export only the projection API (root, item, slot templates, for example `cckTabs`, `cckTab` and the label template), not low-level trigger or content parts. Registration methods stay `@internal`; the `injectCckX` lookup is not exported unless users may author parts.
- Rendered DOM is identical to React's and Vue's sibling-part shape, so themes and tests do not care about the authoring shape.

## Child reads parent configuration

- A child reads its parent's configuration by injecting the parent class ([DI rules](./components-and-selectors.md#di-rules)); when to use a channel is in [architecture §10](../../architecture.md#10-simplicity-and-reuse).

## Registration through DI

- Each child injects the root class through `injectCckX('part')` ([DI rules](./components-and-selectors.md#di-rules)), registers in its constructor and unregisters in `DestroyRef.onDestroy`.
- A child whose root reads a required input of every child (Tabs reads each `value`) registers in `ngOnInit`, not in the constructor: inside a `@for`, the constructor of the next child runs before the inputs of the first are set. Unregister in `DestroyRef.onDestroy`.
- Do not discover structural parts with `contentChildren` / `contentChild`. `contentChild` is fine only to find a slot directive directly inside the host.
- The root renders the shared parts, then `<ng-content />`. Parts a component renders internally get their theme attributes from the fw-core theme runtime ([theming](./theming.md)).
- Projected children are created, and register, before the root's view runs its first update pass, so the server render already contains every part.

## Collection semantics

- **Order is DOM order.** Registration order is not: static children register in the creation pass, children inside `@if` / `@for` later. Keep the registry as `signal<ReadonlySet<T>>` (replace the Set on change) and derive the ordered list with a `linkedSignal` that sorts by `compareDocumentPosition` (use the numeric constant; the `Node` global does not exist on the server).
- **Re-check after every render.** A keyed `@for` reorder or a moved child changes no signal the root tracks. In `afterEveryRender({ read })`, sort the current list by DOM position and `set` it only when the order differs. Correct order never depends on `track` keys.

```ts
// Example (illustrative)
private readonly registry = signal<ReadonlySet<CckExampleItem>>(new Set());
protected readonly ordered = linkedSignal(() => sortByDomOrder([...this.registry()]));

constructor() {
  afterEveryRender({ read: () => {
    const current = untracked(this.ordered);
    const sorted = sortByDomOrder(current);
    if (sorted.some((item, i) => item !== current[i])) this.ordered.set(sorted);
  } });
}
```

## Slots

- A slot is an `ng-template[cckXSlot]` directive. It injects its parent part (the class) and registers its `TemplateRef` with it, clearing it on destroy; the parent renders it with `ngTemplateOutlet`.
- Lazy content creates its embedded view in an `effect` while active and destroys it otherwise (a legitimate side effect: embedded views).
- Export the template context interface and type it with `static ngTemplateContextGuard`.
- Use `<ng-content select>` only for static projection. Do not accept `string | TemplateRef` inputs with type sniffing.
- One exception: an always-rendered part may place a plain `<ng-content>` inside `@if` to insert its projected content only while a state holds (the FieldError, whose root is a live region that must exist before its text). Why: [forms](../../why/forms.md#a-fielderror-is-a-pre-rendered-polite-region).
