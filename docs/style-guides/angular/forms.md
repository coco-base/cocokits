# Forms: model integration and native participation

Angular form support is two separate concerns (the cross-framework rule is in [architecture](../../architecture.md#6-props-events-and-forms-contract); the shared hidden-input rules in [cdk-modules](../framework-agnostic/cdk-modules.md#form-participation)). Names below are examples.

| Concern | Mechanism | When |
|---|---|---|
| **Model integration**: `[formField]`, validation state, touched, disabled rules | The part implements a Signal Forms control interface (`FormCheckboxControl` / `FormValueControl<T>`) | Always |
| **Native participation**: `FormData` on submit, `form.reset()`, constraint validation, `form` attribute, disabled fieldsets | The control's own native input (the host, or an input in its template), else a visually hidden native input rendered next to the host while `name` is set | Native input: always. Hidden input: only while `name` is set |

A `<button role="switch">` bound to `[formField]` is a form-model field, not a submitted form field. Without `name`, nothing is submitted and the browser validates nothing; the Signal Forms validators still run. A control that has a native input needs no hidden input (see the next sections): a Checkbox, Switch or Radio is one.

## Model integration (Signal Forms)

| Control holds | Implement | Value member |
|---|---|---|
| A boolean on/off | `FormCheckboxControl` | `readonly checked = model(false)`; no `value` |
| Anything else (text, number, selection, range) | `FormValueControl<T>` | `readonly value = model<T>(…)`; no `checked` |

Both come from `@angular/forms/signals` (`import type`). Never declare `value` and `checked` on one control: the template checker rejects a `value` binding and a static `value` attribute (NG8022) on a `[formField]` control. A boolean control that submits a value therefore names the input `submitValue` (semantic id `value`).

- Add `implements FormCheckboxControl` / `implements FormValueControl<T>` for compile-time conformance.
- Do not implement `ControlValueAccessor` or provide `NG_VALUE_ACCESSOR`.
- Emit `touch` on blur, not focus.
- Let forms drive `disabled` / `required` / `invalid` / `name` through inputs; never read form state directly.
- Write the model only in action methods; writes coming from the form arrive through the model input and must not re-emit change details ([signals-and-inputs](./signals-and-inputs.md)).
- Do not name outputs `change`, `input`, `blur` or `focus`.

| Member | Declaration | Host binding |
|---|---|---|
| `checked` / `value` | `model(false)` / `model<T>(…)` | `aria-checked` or native value, `data-checked` |
| `disabled` | `input(false, { transform: booleanAttribute })` | `[disabled]`, `data-disabled` |
| `readOnly` | `input(false, { transform: booleanAttribute })` | `aria-readonly`, `data-readonly`; user changes rejected |
| `required` | `input(false, { transform: booleanAttribute })` | `aria-required`, `data-required` |
| `invalid` | `input(false, { transform: booleanAttribute })` | `aria-invalid`, `data-invalid` (controls with a field state: gated `aria-invalid`, see [aria-rules](../accessibility/aria-rules.md#disabled-read-only-invalid-required)) |
| `name` | `input('')` | Not on the host; turns the hidden input on |
| `touch` | `output<void>()` | `'(blur)'` handler emitting it |

## Native-host control (a text `input` or `textarea`)

When the host is the native control (`input[cckInput]`, `textarea[cckTextarea]`; both take the same `ngNoCva` path), there is no hidden input: the host takes part in the form itself, and the table's second concern is the browser's own. Everything above still applies, with these rules:

- Implement `FormValueControl<string>` on the native element. Name each input as the native attribute and `FormUiControl` do (`readonly`, `required`, `disabled`, `name`), not as the React prop (`readOnly`). Declare every `FormUiControl` member that affects the control, and `errors`/`disabledReasons` for the parts that read them.
- Set the static host attribute `ngNoCva`. Reactive (`formControlName`, `[formControl]`) and template-driven (`ngModel`) forms then bind the control through the same custom-control path as `[formField]`, with no ControlValueAccessor. [Why](../../why/forms.md).
- The control may inject `NgControl` (`{ self: true, optional: true }`) only to tell whether a forms library binds it, for example to leave the value to the library on a native reset. It reads only the control path (for the default `name`) and the reset events of its control (to clear `submitted`), never the form state.
- `ngModel` does not pass `required`; template-driven `required` comes from the template attribute.
- Angular 22 does not apply validator directives (`required`, `minlength`, `pattern` attributes) to a control bound through the custom-control path. The attribute still reaches the control's `required` input, but the `FormControl` does not become invalid from it. Docs send authors to validators on the `FormControl` or to Signal Forms rules.
- A write from a forms library arrives through the inputs and emits no change details.
- Native participation (reset, submit attempt, disabling fieldset, value to DOM) is `injectFormParticipation` from angular-core.
- Docs: render a Signal Forms hidden field with `@if`; native `hidden` stays in the DOM and Signal Forms warns about it in dev mode.

## Choice control (a native checkbox or radio in the template)

When the native control is an `input type="checkbox"` or `type="radio"` inside the component's template (`[cckCheckbox]`, `[cckSwitch]`, `[cckRadio]`; the host is the root), there is no hidden input either. Everything above applies, with these rules:

- The control attributes (`id`, `name`, `aria-describedby`, `aria-label`, `aria-labelledby`, `form`) are declared inputs and belong to the native input in the template. The host renders none of them: bind `[attr.id]: 'null'` and the like on the host, because Angular keeps an author's static `id="x"` on the host otherwise.
- The Radio names its submitted value `submitValue` too; React and Vue keep the native `value`.
- The input always has an id, because the inner `label for` needs one. Take the author's `id`; inside a field as its primary control let the machine give `<fieldId>-control`; otherwise use a generated id (`IdGenerator`, the block class as prefix) as a fallback only. A generated id must never replace the field id.
- Register the input, not the host, with the FormField; `CckFormControlBase` does it from `controlElement()`.
- `injectFormParticipation({ getChecked, element: () => input()?.nativeElement })` binds the input. A Radio adds `onUncheckedByGroup` to follow the group; it checks nothing itself.
- Bind both the `checked` property and the `checked` attribute (`[checked]` and `[attr.checked]`), so the server HTML carries the attribute.
- A read-only control cancels the activation (`preventDefault` on `click`) and renders `aria-readonly="true"` on the input.
- The Radio implements no forms interface: it has a `checked` model and a change output, and takes no part in the FormField contract. The Radio group (`[cckRadioGroup]`) is the forms control of a group of Radios: it implements `FormValueControl<string | null>` with `ngNoCva` and no `invalid`, and the Radios inside read its value, name, disabled and required state.

## Native participation (hidden input)

This section is for a custom host that is not a native control and has no native input of its own (for example a `button role="switch"`).

While `name()` is non-empty, an fw-core helper renders a hidden native input as the host's next sibling (so the server markup contains it too) and removes it when `name` becomes empty. Requirements of that helper:

- It mirrors `name`, the value (`checked` / `value`), `disabled`, `required` and the host's `form` attribute onto the input, and is visually hidden by inline style so it works unthemed.
- In the browser it uses the framework-free form-control building block from `@cocokits/cdk`; the shared behaviour (native events, fieldsets, owning form, validation focus, reset) is in [cdk-modules](../framework-agnostic/cdk-modules.md#form-participation).
- It cleans up through `DestroyRef`.
- The hidden input carries its own fixed class and no `data-*`, and is never a theme target.
- A custom control whose focus target is a `button` (the Select trigger) passes it as `element` to `injectFormParticipation`, so the reset, the submit attempt and a disabling fieldset reach it. Its hidden inputs are `type="text"`, not `hidden` (a hidden input is barred from constraint validation), with `tabindex="-1"`, `aria-hidden` and no class; an `invalid` event on them returns focus to the control and is never canceled (a canceled `invalid` lets the submit go on).

```ts
// Example (illustrative helper name)
constructor() {
  injectFormControlBridge({
    type: 'checkbox',
    name: this.name,
    checked: this.checked,
    disabled: this.disabled,
    required: this.required,
    onReset: (defaultChecked) => this.setChecked(defaultChecked),
  });
}
```

## Wrapping a control with `hostDirectives`

A wrapper must re-expose the whole surface, or forms silently stop binding. A model's implicit `xChange` output must be listed too.

```ts
// Example (illustrative)
hostDirectives: [{
  directive: CckExample,
  inputs: ['checked', 'disabled', 'readOnly', 'required', 'invalid', 'name', 'id'],
  outputs: ['checkedChange', 'touch'],
}],
```

## Tests

Cover the two concerns separately ([testing](./testing.md)): model integration with `form()` + `[formField]` (user action updates the model, validation state, blur sets touched, a `disabled(...)` rule disables the element) and native participation in a real `<form>` (the native input, or the hidden input while `name` is set, puts the value into `FormData`, `required` blocks submit, `form.reset()` restores the default).
