import type { InputType } from '@cocokits/machines/input';

/**
 * A native `<input>` for a line of text: `text`, `email`, `password`, `search`, `tel` or `url`. It is a real form
 * control, so `FormData`, constraint validation, the `form` attribute, implicit submission and `fieldset[disabled]`
 * work. Bind the text with `v-model`.
 *
 * The Label of its FormField names it. Outside a FormField, add `aria-label` or `aria-labelledby`, or a `<label for>`
 * with text.
 *
 * Inside a FormField, it gets the id `<fieldId>-control`, and the Label names it. Its `aria-describedby` ends with
 * the ids of the hints, then of the errors. Native attributes and listeners fall through to the `<input>`.
 *
 * @example
 * <FormField>
 *   <template #label><Label>Email</Label></template>
 *   <Input v-model="email" type="email" />
 * </FormField>
 *
 * @cckPart root
 */
export interface InputProps {
  /**
   * The `id` of the Input. When not set, the Input has no id outside a FormField and `<fieldId>-control` inside
   * one. The Label of the field follows the id you set.
   */
  readonly id?: string | undefined;
  /**
   * The ids of the elements that describe the control. Inside a FormField, the ids of its hints and then of its
   * errors come after them. When not set, only the hints and errors of the field describe the control.
   *
   * @cckSemantic input.ariaDescribedBy
   * @remarks Write it as `aria-describedby` in a template. The prop is its camel-case form.
   */
  readonly ariaDescribedby?: string | undefined;
  /**
   * The type of text. Any other value renders `text`.
   *
   * @cckValue text - Plain text.
   * @cckValue email - An email address. The browser checks its form.
   * @cckValue password - A password. The browser hides the characters.
   * @cckValue search - A search term.
   * @cckValue tel - A phone number. Phones show a number keypad.
   * @cckValue url - A web address. The browser checks its form.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   * @defaultValue 'text'
   */
  readonly type?: InputType | undefined;
  /**
   * The name that `FormData` submits, for example `name="email"` next to `v-model`. A forms library that spreads its
   * field attributes onto the Input can pass it. When not set, the form does not submit the Input.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   */
  readonly name?: string | undefined;
  /**
   * Whether the control is disabled. A disabled `fieldset` around it and the `disabled` of the field disable it too.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the control is read-only. It stays focusable.
   *
   * @cckSemantic input.readOnly
   * @cckParity Spelled as the native `readonly` attribute.
   * @defaultValue false
   */
  readonly readonly?: boolean | undefined;
  /**
   * Whether the control is required. It sets the native `required` attribute.
   *
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * Whether the control is invalid. `aria-invalid` appears only after `touched` or `submitted`.
   *
   * @defaultValue false
   */
  readonly invalid?: boolean | undefined;
  /**
   * Whether an asynchronous validator is running.
   *
   * @defaultValue false
   */
  readonly pending?: boolean | undefined;
  /**
   * Whether the control is hidden. It sets the native `hidden` attribute.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   * @defaultValue false
   */
  readonly hidden?: boolean | undefined;
  /** Whether the user left the control. When not set, the control sets it after the first blur. */
  readonly touched?: boolean | undefined;
  /** Whether the user edited the control. When not set, the control sets it after the first edit. */
  readonly dirty?: boolean | undefined;
  /**
   * Whether the user tried to submit the form of the control. Bind it to the submit state of your forms library.
   * When not set, a `submit` event of the form sets it, a canceled one too, and a reset clears it.
   */
  readonly submitted?: boolean | undefined;
  /**
   * The text, bound with `v-model`. `null` renders as empty. When not set, the Input keeps its own text, which
   * starts as `defaultValue`.
   *
   * If you listen for changes and do not accept one, the old text stays.
   *
   * @cckSemantic input.value
   * @cckParity Bound with `v-model`.
   * @defaultValue ''
   */
  readonly modelValue?: string | null | undefined;
  /**
   * The modifiers of `v-model`, as in `v-model.trim`. The framework fills it. The component declares it so the
   * modifiers do not reach the native element.
   *
   * @internal
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The start text of an Input whose `v-model` is not bound. It is read once, when the Input is created.
   *
   * A bound `modelValue` ignores it, with or without a listener. A listener on `update:modelValue` alone reports the
   * changes and does not make the Input controlled.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   * @defaultValue ''
   */
  readonly defaultValue?: string | undefined;
}

/** The events of the Input. */
export interface InputEmits {
  /**
   * Emits the new text for `v-model` when the user changes it, and when a reset of the form changes it. It is the
   * only change event, and it carries the value only.
   *
   * @cckSemantic input.valueChange
   * @cckParity The `update:modelValue` event is the only change event; it carries the value only.
   */
  'update:modelValue': [value: string];
}
