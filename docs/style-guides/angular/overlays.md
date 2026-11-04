# Overlays: portal, positioning, dismiss, focus

What is specific to Angular. The shared overlay rules (portal, positioning, `aria-controls`, dismiss, focus, tests) are in [overlays-and-positioning](../framework-agnostic/overlays-and-positioning.md#rules-for-every-framework-adapter); read it first. Why: [overlays](../../why/overlays.md). Names below are examples.

## Invariants

- The public entry point of an overlay follows Angular Material and the CDK ([architecture §10 item 5](../../architecture.md#10-simplicity-and-reuse)), not this guide: for a Dialog, the service-first form that opens it and returns a ref, with a config and a default-options token; for a Tooltip, one attribute on the trigger (`cckTooltip="Copy link"`, Material's `matTooltip`), with the compound form (`cckTooltipTrigger`, a `cckTooltipPortal` template, `cckTooltipContent`) for rich content, no open model, `show(delay?)`, `hide(delay?)` and `toggle()` methods, and a `CCK_TOOLTIP_DEFAULT_OPTIONS` token that replaces the built-in defaults. The portal below is the internal mechanism that renders content; it is not an entry point. A declarative root is optional secondary sugar: adding one, or a service beside it, never validates a primary entry point the reference lacks.
- Template content is declared as an `ng-template` and rendered into an overlay container by the fw-core portal, never by moving nodes or appending to `document.body` by hand. The embedded view is created at the declaration site, so DI, context and change detection keep working, and it is destroyed on close.
- The portal is `CckPortal` from `@cocokits/angular-core`: list it in the overlay root's `providers`, give it the view container of the content's `ng-template` with `useContainer(inject(ViewContainerRef))` (never the container of an `ng-container` root: it breaks hydration), and call `attach(template, context, trigger)` and `detach()`. A component is rendered the same way with `attachComponent(component, trigger, { injector })`, which returns its `ComponentRef` (the one-attribute Tooltip renders its private bubble this way): it uses the same container and host, a second call or `attach` replaces it, and `detach()` destroys it. The view is created in that container, so it is checked with the declaring view and is not a root view of the application; the portal never calls `detectChanges()`. It passes the provided theme's `modeCollections` to the host and the direction from `CckDirection` (`[cckDir]` for a subtree, `provideCckDirection('rtl')` for an app, default `'ltr'`), and detaches when the root is destroyed.
- Attach in `afterRenderEffect`, so the server renders nothing for overlays and the first client render matches. Create any default container lazily in the browser, never in a constructor.
- `data-side` / `data-align` are rendered from the component's own resolved-placement state, fed by the positioning module's placement callback.
- The Dialog service renders through one internal container per `open()` (a hidden `CckDialogRoot` and its `<dialog>`), so it reuses the root's presence, dismissal, scroll lock, modal exit and focus return. The opened view's injector starts with the dialog's own providers (`CckDialogRef`, `CCK_DIALOG_DATA`, the root, its `CckOverlayLayer`, and `CckDirection` when `direction` is set); the parent is `config.injector`, else `config.viewContainerRef.injector`, else the service's injector. The parent can add providers, never replace those. With `viewContainerRef` the container and the view are part of that container's change-detection tree and leave no element at its place; without it they attach to `ApplicationRef`.
- Dismissal decides inside vs outside through registered element refs (trigger, content, nested layers), never `host.contains(event.target)`, because the content is not inside the host.
- Modal overlays restore focus to the previously focused element on close. Non-modal overlays keep Tab order continuing after the trigger.
- A component that renders its own trigger and list (the Select) keeps DOM focus on the trigger and anchors the list to the FormField's input wrapper when the trigger is the field's control (`CckFormControlBase.fieldAnchor`, from the `anchor` of the field's `_register`); the directive of its portal template reaches the root through an `InjectionToken` (`CCK_SELECT_CONTENT_HOST`), because importing the root class would be a cycle.

## Portal mechanism (illustrative sketch, not an entry point)

```html
<ng-container cckExample [(open)]="open" placement="bottom-start">
  <button cckExampleTrigger>Open</button>
  <ng-template cckExamplePortal>
    <div cckExampleContent aria-label="Details">…</div>
  </ng-template>
</ng-container>
```

```ts
// Root: registered refs and the content slot; never DOM queries.
readonly open = model(false);
readonly placement = input<Placement>('bottom');
/** @internal Set by the trigger and content parts. */
readonly _trigger = signal<HTMLElement | null>(null);
/** @internal */
readonly _content = signal<HTMLElement | null>(null);
/** @internal */
readonly _template = signal<TemplateRef<void> | null>(null);

constructor() {
  afterRenderEffect({ write: () => {   // never runs on the server
    const [template, trigger, open] = [this._template(), this._trigger(), this.open()];
    untracked(() => (open && template && trigger ? this.portal.attach(template, undefined, trigger) : this.portal.detach()));
  } });
}
```

## Pitfalls

- Keep one root element in the overlay template.
- Testing Library's `container` and `fixture.nativeElement` do not contain portaled content: query via `screen` / `document.body`, run axe on `document.body`, harnesses use `documentRootLocatorFactory()` ([testing](./testing.md)).

## Refusal and outputs

- **Refuse a dismissal the way Material does.** The Dialog, Popover and Tooltip roots take `disableClose` (Escape, an outside press and, for the Popover, focus-out); the Dialog and Popover roots also take `closePredicate: (details) => boolean`, called for every close the component makes (a `false` keeps it open). A parent write to `open` is never checked. The Popover has `restoreFocus` (default `true`). A close the browser forces (a native `close` event) cannot be refused.
- **Report a change with the model output and `opened` / `closed`.** `[(open)]` and `(openChange)` give the value of the model. The Dialog and Popover roots also have `opened` and `closed`, which emit `{ reason, event }` for the component's own changes only. The Select keeps `openChangeDetails`; the Tooltip has no open model and no output, like Material's, and is opened from code with `show()`, `hide()` and `toggle()`.
- A Dialog opened by its Trigger returns focus to that Trigger; a Dialog opened another way (without a Trigger, a controlled `open`, the service) returns it to its opener. A Dialog without a Trigger opens; a Popover or Tooltip without a Trigger warns in development.
