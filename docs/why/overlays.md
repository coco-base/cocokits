# Why: overlays

Rules: [Overlays and positioning](../style-guides/framework-agnostic/overlays-and-positioning.md). This file explains them and states no rules.

## Always portaled, with Floating UI only positioning

**Rejected alternatives.**
- *Top layer where available, portal as fallback.* Two code paths with different focus, stacking and testing behaviour. DI, context and event bubbling follow the declaration site in the framework, not the DOM.
- *Render in place, rely on `position: fixed` and the top layer.* Ancestors with `transform`, `filter` or `contain` break fixed positioning.
- *The Angular CDK Overlay engine for Angular.* It is Angular-only, so Angular would behave differently from React and Vue in focus, stacking and dismissal. This rejects the engine only. Material's and the CDK's component APIs (a dialog opened from a service, a tooltip directive, default-options tokens) remain the Angular reference ([architecture §10 item 5](../architecture.md#10-simplicity-and-reuse)).

**Why.**
- In place breaks under `overflow: hidden`, transforms and stacking contexts of any ancestor. A container at the end of `<body>` avoids all three.
- Positioning is a separate concern from where the element lives in the DOM. Floating UI computes coordinates and writes inline styles. It never creates, moves or portals elements, so it works with any portal mechanism.
- Each framework uses its native portal, so DI, context and bubbling behave as developers expect there.
- An overlay opened from inside a modal dialog stays in the dialog's subtree, so the dialog does not make it inert.

**Cost.** "Inside" versus "outside" for dismiss logic cannot use DOM nesting. It uses registered element refs. Styling needs nothing extra, because part classes work wherever the element lives.

## The public entry point follows the reference, the portal is internal

**Rejected alternatives.**
- *The guide's declarative root and `ng-template` slot as the Angular API of every overlay.* The first Dialog build read the guide's example as the required shape and built a declarative Dialog that Material and the CDK do not have; a service added later was read as making it acceptable.

**Why.** The portal is how content reaches the overlay container, and every entry point can use it. Which entry point a developer sees is an API choice that [architecture §10 item 5](../architecture.md#10-simplicity-and-reuse) gives to the reference library. A guide that shows only one shape makes a builder reproduce it, so the guide names the portal as internal and the entry point as the reference's.

## The host is a manual popover in the top layer

**Rejected alternatives.**
- *A plain `position: fixed` host at the end of the container.* A themed dialog or page ancestor with `transform` or `filter` becomes the containing block of fixed descendants and shifts or clips the overlay.
- *Top layer where the Popover API exists, a fixed host elsewhere.* The first rejected alternative above: two code paths. Every supported browser (the last two of Chrome, Firefox, Safari and iOS) has the Popover API, so the fallback would never run.
- *`popover="auto"`.* Its light dismiss and Escape handling are not routed through the layer stack, so a nested overlay could not close first.

**Why.**
- A top-layer host is not clipped by an ancestor's `overflow` or `transform` and needs no `z-index`.
- A modal `<dialog>` makes the rest of the document inert, including a top-layer element outside it: the host must be inside the dialog's subtree. A browser test of the overlay facts confirmed it in Chromium and Firefox: a host nested in the dialog is drawn above it and takes clicks and focus; a host on `<body>` does not.
- A manual popover is not closed by Escape, and Escape otherwise reaches the dialog's `cancel`, so the dismissal module owns Escape on `keydown` and prevents the default.
- The host moves, but only on a fullscreen change. A fullscreen element is drawn above hosts that were shown earlier, and a host in the top layer only comes back on top when it is moved into the fullscreen element and shown again (measured in three engines). Angular's `FullscreenOverlayContainer` does the same. Hosts move in creation order, so a nested overlay stays above its parent.
- Known limit: when an open modal `<dialog>` that holds the trigger is inside the fullscreen element, the host goes into the fullscreen element, outside the dialog, so the dialog makes it inert: the overlay is visible but takes no clicks or focus. No extra containment rule was added.

**Cost.** WebKit is not verified yet (the first measurements could not run it). A failure there is the only case that brings back a fixed host.

## The dismiss layer raises a cancelable intent and walks the stack

**Rejected alternatives.**
- *`closeOnEscape`, `closeOnOutsidePress` and `closeOnFocusOut` booleans on the layer.* No reference library has them; each framework's reference refuses with a handler (Radix, Reka) or a flag and a predicate (Angular), so a boolean cannot carry a per-event refusal.
- *Checking the topmost layer only for an outside press.* A Tooltip over a Popover would swallow the press and leave the Popover open.
- *Escape in the capture phase (Radix).* An inner widget (a combobox, a menu) could not stop Escape before a layer closed. Reka and Angular CDK listen in the bubble phase.

**Why.**
- One intent per cause lets the three adapters map the same core to their reference: Angular `disableClose` and `closePredicate`, React Content handlers and `details.cancel()`, Vue Content emits.
- Angular CDK and Radix give an outside press to every layer above the one that contains it and stop at a modal; a refused intent stops the walk, so a refusal never closes what lies below.
- A native modal stays shown during its exit animation and makes the page inert, so its layer keeps standing in the way (and the scroll lock stays) until the dialog has left the document. A refused Escape is default-prevented so Chromium never force-closes a modal on repeated Escape: the browser-facts rows check it in Chromium, Firefox and WebKit.

## Each framework refuses and reports as its reference does

**Rejected alternatives.**
- *One refusal API in the three frameworks (a `canClose` callback, or `details.cancel()` everywhere).* A Radix or Reka user looks for `onEscapeKeyDown` and `preventDefault()`, an Angular user for Material's `disableClose` and a predicate; a shared name would match none of the references, and §10.5 says the reference decides.
- *Keeping `openChange` and `valueChange` in Vue beside `update:open`.* Reka has only `update:*`. A second event with the same value gives two ways to listen, and a consumer who listens to both runs the handler twice.
- *Angular `opened` and `closed` firing for a change the parent made.* §6 says a change callback fires for the component's own changes; the parent already knows its own write, and the reason of the details stays non-null only for a change the component made.

**Why.**
- The cdk raises one cancelable intent per cause, so the adapters stay thin: Angular maps it to `disableClose` and `closePredicate`, React to the Content handlers (the specific one, then `onInteractOutside` with the same event) and `details.cancel()`, Vue to the same events as emits.
- Vue gives no reason with `update:open`. A tool that lists change events shows the reason only where the framework has it (React); the Vue `update:*` event has none, which is the price of one change event.
- Trigger and Close parts in Vue send their click whatever a consumer `preventDefault()` did, because Reka's parts do; Angular and React keep the veto of their references.

## Overlay roots start their listeners outside the zone

The dismiss layer listens to `pointerdown`, `keydown` and `focusin` on the document, positioning follows scroll and resize, and the Tooltip runs delay timers. Inside `NgZone` each of these events starts a change detection of the whole app, for a signal-based component that does not need one. The Angular CDK's overlay dispatchers subscribe outside the zone and re-enter to emit, so `injectZoneBoundary()` does the same in one place: the listeners start outside, and only the callbacks that write a signal, emit an output or emit on a ref stream run inside. It calls plainly when the app has no real zone (zoneless), so the rule "work zoneless" keeps its meaning and this is its one exception.

## A click made before hydration needs a `host` listener

`listenLast` adds its listener after the first render, with `addEventListener`. Angular's event replay records the clicks of elements that have a template or `host` listener and replays them to the listeners it registered, so a click on a Dialog or Popover trigger before hydration was lost. The part now also has a `host` `(click)` that acts only on a replayed event (`eventPhase` 101), once the replay's other listeners have run, and only if none called `preventDefault()`, so the consumer's veto still works. The TabNav link guard is not replayed: it has to run before the consumer's listeners, which a replay cannot order, and a link followed before hydration is a native navigation nothing can undo. The Close part and the Select option do not exist in the server markup, so nothing of theirs is clicked before hydration.

## The portal view is created in the container of the template

`CckPortal` used to create the view from the template and attach it to `ApplicationRef`, making it a separate root view that Angular checks outside the declaration's tree, and it called `detectChanges()` by hand. It now creates the view in a `ViewContainerRef`, as the CDK's `DomPortalOutlet` does, and moves the nodes. The container is the `ng-template` of the content (or the Select's own host): a container injected on an `ng-container` root moves the comment node of the `ng-container` and breaks hydration (NG0500), which a test for each overlay shows.

## `CckDialog` is opened from code

Old CocoKits had an imperative open with data and a result, which a template slot cannot give: a slot has no caller to hand a value to and no promise to resolve.

The service follows Angular Material's `MatDialog` and not a smaller design of ours: `open<T, D, R>(component | template, config)` returns a ref with Observable streams (`afterOpened`, `beforeClosed`, `afterClosed`, `backdropClick`, `keydownEvents`), `getState()`, a mutable `disableClose` and a `closePredicate`. Angular developers already know these names, and the Observables are why the package now has an `rxjs` peer, as the CDK does. The defaults token **replaces** the built-in defaults, as Material's does, and the per-member result of its double merge is kept (an omitted `closeOnNavigation` acts as `true`, an omitted focus member acts as `undefined`), because someone who moves from Material expects the same result from the same token value.

Left out on purpose: the visual members (`panelClass`, `width`, `position`, animation durations, `scrollStrategy`) because themes own the look and the native modal plus the cdk scroll lock give one scroll policy; and the declarative form is secondary sugar over the same root. The service renders through one internal container per `open()` (a hidden root and its `<dialog>`) instead of a second overlay engine: presence, dismissal, scroll lock, modal exit and focus return exist once, in the root.

`aria-labelledby` and `aria-describedby` merge the configured ids with the Title's and the Description's. Material's container keeps only the first id of a queue, so a configured id replaces the Title; merging keeps the name and the description complete, as [aria-rules](../style-guides/accessibility/aria-rules.md) asks.

## A Dialog opened by its Trigger returns focus to the Trigger

A Dialog without a Trigger returns focus to its opener, the element that had focus when it opened. A Dialog opened through its Trigger returns it to that Trigger instead: Radix and Reka do, and it holds in Safari, which does not focus a button on a press, so the element that had focus before the press (another control inside an outer dialog) is not the control the user used. A controlled `open` and the Angular service have no Trigger and keep the opener rule.

## The Tooltip describes its trigger all the time

A tooltip that exists only while open is announced to nobody who focuses the trigger with a screen reader before it shows. Angular Material keeps a hidden copy of the message in the page and points `aria-describedby` at it, so a user hears the description on focus, hover or not. We do the same for a tooltip whose text is known while it is closed: the Angular message, the React `aria-label` or text-only children, the Vue `ariaLabel` or text-only slot. Radix and Reka add the copy only while the tooltip is open; that is the weaker behaviour, and rich content with no text still falls back to it, because scraping elements for text is a guess.

The helper (`createDescription` in the cdk `portal` module) differs from the CDK's `AriaDescriber` on purpose. It makes one element per tooltip in the trigger's own overlay container, because a shared container on `body` cannot be reached from a trigger in a shadow root, and an open modal makes everything outside it inert, so ids that point there stop resolving. It does not write `aria-describedby`: the frameworks own the trigger's attributes (a write the framework does not know about breaks hydration), so the machine adds the id to the props. It has no reference count, no form for an existing element and no role argument, because the only user is the tooltip. Nothing is made on the server, so before hydration the trigger has its own name only.

The Provider of the Tooltip is optional in React and Vue, as Base UI's is. Radix and Reka throw without one, which would force every app to wrap each tooltip. The group that lets a second tooltip open at once after a first closed lives in the framework-free machine (`createTooltipGroup`); the adapters create one per Provider.

The machine keeps the neutral delay names (`delay`, `closeDelay`, as Base UI names them) while each framework keeps its reference name (`showDelay` and `hideDelay` in Angular, `delayDuration` in React and Vue). This is the one exception to one name through the layers: a user of Material or Radix looks for their own name, and the reference decides (architecture section 10). The names map to one semantic id through `@cckSemantic`, and the defaults differ by design (0 ms in Angular, 700 ms in React and Vue), so each delay member is tagged `@cckDefaultDiffers` and the parity check reports the difference.

## The positioning module places the arrow

Radix and Reka write the arrow's coordinates and rotation inline from the placement Floating UI resolved, because they change with every flip and shift and must work before any theme loads. The module does the same: the arrow is the one part other than the content that it styles, and only with geometry (`position`, offsets, `transform`), the kind of value the content already gets. It measures the arrow once when positioning starts and keeps that size, so hiding the arrow (the native `hidden`, which collapses its box) cannot change the result and start a loop between shown and hidden. It therefore carries its own small arrow middleware with a fixed size, the algorithm of Floating UI's `arrow` otherwise. The module reports "cannot point" instead of hiding the part, because the visibility of a part is the machine's (the native `hidden` attribute); the browser-facts row for the arrow checks that an unthemed `span` hides that way.

`--transform-origin` is unprefixed like the other measured variables and is a variable, not Angular CDK's `withTransformOriginOn`, which writes `transform-origin` itself: motion belongs to the theme. In RTL the start of a top or bottom side is the right edge, so the module swaps the percentages Radix computes for LTR only.

## A modal Popover keeps its content element

Radix and Reka keep the Popover content element when `modal` is on and add `aria-modal`, the focus trap and the inert outside. A native `dialog` for the modal case would change the element with a prop, drop `render` and `as` on that part, and give the Popover two element contracts. So the content stays a `div` with `role="dialog"` and the cdk supplies what the native modal gives for free: `makeOutsideInert` (one `inert` attribute gives Radix's `hideOthers` and pointer-events-off in one step, and covers assistive technology), `lockScroll`, Tab wrapping in the focus guards (`loop`) and a dismiss layer that is a barrier. "A modal is `dialog`" holds for the Dialog, where the native element is the whole point (top layer, backdrop, focus containment).

## Force-mounted closed content is hidden

Radix and Reka keep a force-mounted closed content in the DOM and leave hiding to the author, who has to add a rule for `[data-state="closed"]`. The base hides what it promises to hide (architecture section 4), so closed kept content gets the native `hidden` attribute, after the exit animation; a closed `dialog` is hidden by the user agent. There is no layer, positioning, focus move or scroll lock while it is closed, and nothing renders on the server, as for every overlay, so the content appears after hydration.

## A non-modal Dialog is a native `dialog` opened with `show()`

Radix and Reka let `modal={false}` drop the backdrop, the focus trap and the inert page. The element stays `dialog` (architecture section 5), opened with `show()` instead of `showModal()`, so the same part, `render` and `as` rules hold. The dismiss layer of such a dialog is not a barrier, because the page and the layers below stay usable: an outside press closes it and also reaches what was pressed, as for a non-modal Popover. Focus returns to the trigger after Escape or Close and stays where the user put it after an outside press, as in Radix. The user agent centres only modal dialogs, so the theme centres a non-modal one.
