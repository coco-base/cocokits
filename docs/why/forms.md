# Why: forms

Rules: [Angular forms](../style-guides/angular/forms.md), [React forms](../style-guides/react/forms.md), [Vue forms](../style-guides/vue/forms.md), [cdk modules](../style-guides/framework-agnostic/cdk-modules.md#form-participation), [Packages and entry points](../style-guides/workspace/packages-and-entry-points.md), [ARIA rules](../style-guides/accessibility/aria-rules.md), [React compound parts](../style-guides/react/compound-parts.md). This file explains them and states no rules.

## A native text or choice control is the form control itself

**Rejected alternatives.**
- *A hidden native input next to a custom element* for text. The element would be a second control to keep in sync, and it would not carry `FormData`, constraint validation, implicit submission or the label association by itself.

**Why.**
- An `input` or `textarea` already is what the hidden input stands in for. Submitting, validating, the `form` attribute and fieldsets work natively.
- What the browser does not report is small: an uncanceled reset (no `input` event fires), a submit attempt and a disabling fieldset (no event). One cdk module reports those three and writes the value to the element, the same way in every framework.
- A reset is reported in a later task, after the browser has run its reset algorithm and every listener has run. A listener inside the event could not tell whether a later one cancels it.
- A checkbox and a radio are the same case. The checked state, `FormData` (`name=on`), `required` and the label click are native, and a hidden input would only duplicate them. The cdk instance gets a checked mode (`getChecked`, `.checked`) instead of a second module, so the adapters keep one lifecycle.
- The browser unchecks a radio when another radio of its group is checked, and fires no event on the unchecked one. Vue and Angular models would stay true while the DOM is false, so the cdk reports it (`onUncheckedByGroup`) from a `change` listener on the radio's root node (the document or its shadow root). A parent-only change fires no `change` at all and is not reported.
- A submit counts even when canceled, because Angular's `onSubmit`, `FormRoot` and react-hook-form call `preventDefault()`. The `invalid` event is not a source: `checkValidity()` and `reportValidity()` fire it too.

## Angular: `FormValueControl` with `ngNoCva`, no ControlValueAccessor

**Rejected alternatives.**
- *`NG_VALUE_ACCESSOR` next to `FormValueControl`.* Two bindings for one control, and the accessor path cannot receive `touched`, `invalid`, `pending` or `errors`.
- *Signal Forms only.* Applications on reactive or template-driven forms would need a wrapper.

**Why.**
- `@angular/forms` 22 binds a `FormValueControl` for reactive and template-driven forms when the host has no accessor or has the attribute `ngNoCva`. It then writes `value`, `touched`, `dirty`, `invalid`, `pending`, `disabled`, `required` and `errors` into the control.
- `DefaultValueAccessor` matches `input` by a compile-time selector (`:not([ngNoCva])`), so it is still instantiated on the native `input`. It is never selected, so its listeners call no-ops. The attribute is written before the control instruction runs, on the server and in hydration too.
- Risk: if Angular drops `ngNoCva`, the default accessor would bind the native input alongside the custom control. A spike test in the Angular build asserts the accessor is never selected, so a release that changes this fails a test.
- Injecting `NgControl` only tells whether a library binds the control. Nothing is read from it, so the control stays a plain Signal Forms control.
- `ngModel` does not write `required`, because template-driven `required` is a template attribute.
- The custom-control path also skips `setUpValidators`, so validator directives (`required`, `minlength`, `pattern` attributes) never join the `FormControl` of a bound control. A tripwire test in the Angular input tests records it, so a release that applies them fails a test and the docs line is removed.

## `@angular/forms` is an optional peer

Only the entries that implement a Signal Forms control import it, so an application that uses none of them should not have to install it. It is also a root devDependency, to compile and test those entries.

## `aria-invalid` is gated, `data-invalid` is raw

**Rejected alternatives.**
- *`aria-invalid` whenever the control is invalid.* Forms libraries report `invalid` at mount for an empty required field, so every untouched field would be announced as an error before the user did anything.

**Why.**
- MDN's `aria-invalid` guidance says to hold the state back until the user has left the field or tried to submit. The control writes `aria-invalid="true"` only while invalid and (touched or submitted), and never `"false"`.
- `data-invalid` stays the raw fact, as every `data-*` is (architecture §3), so a theme decides when the invalid look appears, normally on the same condition (`[data-invalid]:is([data-touched], [data-submitted])`).
- A submit attempt is the owner form's `submit` event, canceled ones included, because forms libraries cancel it.

## Latest callbacks through a ref until React 19.2

**Rejected alternatives.**
- *`useEffectEvent`.* It exists from React 19.2, and the supported floor (`compatibility.json`, both peer ranges) is 19.0, so using it would break 19.0 and 19.1 applications.
- *Raising the floor.* Raising `low` is a major change with no benefit beyond this hook.

**Why.**
- A listener created in a mount effect (the cdk instance) outlives a render, so it must call the latest callbacks. A ref assigned in a layout effect, never during render, gives that and survives StrictMode. When the floor reaches 19.2 the ref is replaced by `useEffectEvent`.

## A Vue model is a wide prop and a narrow event

`defineModel<T>()` gives one type to the prop and to the `update:<name>` event: vue-tsc prints the event as `[value: T]`, from the first type argument only, and no option changes it. A control that accepts `null` and `undefined` from the parent but only ever emits `string` cannot say both, and `const text = ref('')` with `v-model="text"` fails in a consumer's strict type check. Declaring the prop, the event and `useModel(props, '<name>')` states the two types; the compiler turns `defineModel` into exactly that, so the runtime is the same. React already states the pair (`value?: string | null | undefined`, `onValueChange(value: string)`). `modelModifiers` is declared because `defineModel` declared it implicitly: without it `v-model.trim` puts the modifiers into `$attrs`, which the Input and the Textarea spread onto the native element.

## A Vue root has a default prop and keeps the useModel rule

**Decision.** The Vue roots that hold a value or an open state (Tabs, Select, Dialog, Popover, Tooltip) declare `defaultValue` and `defaultOpen`, read once at setup, next to the `v-model` prop. A model prop bound without a listener keeps Vue's `useModel` behaviour (local state that starts from the prop), where Reka UI would freeze it.

**Why.**
- *The reference libraries and the other two frameworks have it.* Reka UI's roots take `defaultValue` and `defaultOpen`, and React's roots take the same names; a story or a consumer then starts a Tabs on a tab in the same way in React and Vue. Without it a Vue author who wants an uncontrolled root with a start value has to bind a `ref` and a listener.
- *Server output.* A bound `modelValue` already renders the selected tab on the server; `defaultValue` renders the same markup, so the server and the first client render agree.
- *A parent that renders again must not reset the state.* Reading the start value into the local state once, and never watching it, keeps an array literal (`:default-value="['a']"`, a new array on every render) from resetting a Select.
- *`useModel` stays the mechanism.* It is Vue's own, every existing Vue component follows its rule, and Reka's check (the prop is controlled whenever it is not `undefined` at setup) would silently ignore the user's input on `:open="true"` without a listener.

**Rejected alternatives.**
- *`defineModel` with a default.* The prop and the event would share one type ([above](#a-vue-model-is-a-wide-prop-and-a-narrow-event)), and the default would also fill a bound prop that is `undefined`.
- *Copying the model into a `ref` and a `watch`.* Two sources of truth, and the watch resets the state on a re-render.
- *A themed wrapper that binds `v-model` on the base root.* The base root would see a bound prop and a listener and be controlled by the wrapper, which ignores `default-value`. The wrapper forwards the model as the consumer wrote it.

## A FieldError is a pre-rendered polite region

**Rejected alternatives.**
- *`role="alert"` or `role="status"` on the FieldError.* aria-rules keeps those roles for the alert and status components, and `alert` is assertive: it interrupts typing.
- *Inject an `aria-live` element when the error appears.* A live region announces changes made to a region that already exists; one added together with its text is often not announced.
- *No live region, rely on `aria-describedby`.* The description is read only when the control gets focus, so an error found on blur would be silent (WCAG 4.1.3).
- *Hide the whole FieldError (`display: none`, `hidden`, or no root) while it is not shown.* The region leaves the accessibility tree and is created together with its text.
- *`aria-errormessage`.* Assistive-technology support is unverified, and `aria-describedby` already names the feedback wrapper.

**Why.**
- The root carries `aria-live="polite"` and no role, is always rendered, and only its content is gated by `invalidShown`, the same gate as `aria-invalid`, so the look, the attribute and the message cannot disagree. `polite` waits for a pause in typing.
- The text is announced when it appears and read again as the description on focus. This double exposure is accepted.
- An unshown FieldError adds no text to the description of the control.
- Angular places a plain `<ng-content>` inside `@if` so the author writes `<div cckFieldError>Enter an email.</div>` as with a Hint; a content template would make every message a template. The content is instantiated once even while hidden, which is harmless for a message.
