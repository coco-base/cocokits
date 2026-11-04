/**
 * A native `<textarea>` for several lines of text. It follows the contract of the Input: a real form control,
 * so `FormData`, constraint validation, the `form` attribute and `fieldset[disabled]` work. Bind the text with
 * `v-model`. Enter inserts a line break and never submits the form. A text with CR or CRLF shows with LF, as the
 * element does, and the DOM is not rewritten for that. Inside a FormField it gets the id `<fieldId>-control`, the
 * Label names it, and its `aria-describedby` ends with the feedback wrapper that holds the hints and the FieldError. Native
 * attributes (`rows`, `cols`, `placeholder`, ...) and listeners fall through to the `<textarea>`.
 *
 * @example
 * <FormField><template #label><Label>Message</Label></template><Textarea v-model="message" rows="4" /></FormField>
 *
 * @cckPart root
 */
export interface TextareaProps {
  /** The `id`. Inside a FormField it defaults to `<fieldId>-control`; an explicit value wins and the Label follows it. */
  readonly id?: string | undefined;
  /**
   * The ids this control is described by. Inside a FormField the feedback wrapper id is added after them.
   *
   * @cckSemantic textarea.ariaDescribedBy
   * @remarks Written `aria-describedby` in a template; the prop is its camel-cased form.
   */
  readonly ariaDescribedby?: string | undefined;
  /**
   * The name `FormData` submits. You set it (for example `name="message"` next to `v-model`); no Vue forms library fills it in.
   *
   * @cckSemantic none
   * @remarks A native attribute in React and Vue; only Angular defaults it from the forms control.
   */
  readonly name?: string | undefined;
  /**
   * Disables the control. A disabling `fieldset` and the field's `disabled` add to it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Makes the control read-only; it stays focusable.
   *
   * @cckSemantic textarea.readOnly
   * @remarks Vue spells it as the native `readonly` attribute.
   * @defaultValue false
   */
  readonly readonly?: boolean | undefined;
  /**
   * Makes the control required (native `required`).
   *
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * Marks the control invalid. `aria-invalid` waits for `touched` or `submitted`.
   *
   * @defaultValue false
   */
  readonly invalid?: boolean | undefined;
  /**
   * An asynchronous validator is running.
   *
   * @defaultValue false
   */
  readonly pending?: boolean | undefined;
  /**
   * Hides the control (native `hidden`).
   *
   * @cckSemantic none
   * @remarks A native attribute in React and Vue; Angular declares it as an input.
   * @defaultValue false
   */
  readonly hidden?: boolean | undefined;
  /** Whether the user left the control. Given, it wins; otherwise it is set after the first blur. */
  readonly touched?: boolean | undefined;
  /** Whether the user edited the control. Given, it wins; otherwise it is set after the first edit. */
  readonly dirty?: boolean | undefined;
  /**
   * Whether a submit of the owner form was attempted. Given, it wins (bind it to the forms library's submit
   * state); otherwise a `submit` event of the form sets it, canceled ones included, and a reset clears it.
   */
  readonly submitted?: boolean | undefined;
  /**
   * The text, bound with `v-model`. `null` and `undefined` render as empty. Bound with a listener it is controlled:
   * a parent that does not accept a change keeps the old text. Unbound, the Textarea keeps its own text.
   *
   * @cckSemantic textarea.value
   * @remarks Vue's `v-model` (`modelValue`).
   * @defaultValue ''
   */
  readonly modelValue?: string | null | undefined;
  /**
   * The modifiers of `v-model` (`.trim`, `.number`, ...) Vue passes; the component only declares them so they do not reach the native element.
   *
   * @cckSemantic none
   * @remarks Vue-only: Vue fills it from `v-model.trim` and the like.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The initial text of a Textarea whose `v-model` is not bound, read once when it is created. Binding `modelValue`,
   * with or without a listener, ignores it. A listener on `update:modelValue` reports the changes of the Textarea
   * and does not make it controlled.
   *
   * @cckSemantic none
   * @remarks Vue's uncontrolled start value, as React's `defaultValue`; Angular binds it as a model.
   * @defaultValue ''
   */
  readonly defaultValue?: string | undefined;
}

/** The events of the Textarea. */
export interface TextareaEmits {
  /**
   * Emits with the new text for `v-model`, after a change the user makes and after a reset of the owner form that changes the text.
   *
   * @cckSemantic textarea.valueChange
   * @remarks The `v-model` update event of Vue is the only change event (as Reka UI), so it stands for the change event of the other frameworks: Angular emits `valueChangeDetails` and React calls `onValueChange`. It carries the value only.
   */
  'update:modelValue': [value: string];
}
