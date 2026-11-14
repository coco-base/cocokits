import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * A text box for entering several values. Each value the user confirms with Enter becomes a removable chip in front
 * of the text box. Bind the values with `v-model`.
 *
 * @remarks Enter adds the trimmed text, clears the text box and keeps the form from submitting. A text that is already in the
 * list is not added twice. Enter on an empty text box does nothing, so the form submits as usual. Tab reaches each
 * remove button, then the text box. A remove button removes the chip and moves the focus to the text box.
 *
 * Inside a FormField the text box is the control of the field: the Label names it, and the hints and errors describe
 * it. Outside a FormField, give the list `aria-label` or `aria-labelledby`; they go to the text box, as do `id`,
 * `aria-describedby` and `placeholder`. Every other attribute stays on the root.
 *
 * With `name`, the form submits one entry per chip, and `form` ties the entries to another form. A reset of the form
 * restores `defaultValue`. `required` blocks a submit while the list is empty, and the text box carries
 * `aria-required`. The text box itself never has a name.
 *
 * @example
 * <ChipList v-model="toppings" name="toppings" aria-label="Toppings" />
 *
 * @cckPart root
 * @cckPart input
 */
export interface ChipListProps {
  /**
   * The `id` of the text box. When not set, the text box has no id outside a FormField and `<fieldId>-control`
   * inside one. The Label of the field follows the id you set.
   */
  readonly id?: string | undefined;
  /**
   * The ids of the elements that describe the text box. Inside a FormField, the ids of its hints and then of its
   * errors come after them. When not set, only the hints and errors of the field describe the text box.
   *
   * @cckSemantic *.ariaDescribedBy
   * @remarks Write it as `aria-describedby` in a template. The prop is its camel-case form.
   */
  readonly ariaDescribedby?: string | undefined;
  /**
   * The `aria-label` of the text box, for a list with no Label. When not set, the Label of the field or
   * `ariaLabelledby` names it.
   *
   * @cckSemantic *.ariaLabel
   * @remarks Write it as `aria-label` in a template. The prop is its camel-case form.
   */
  readonly ariaLabel?: string | undefined;
  /**
   * The ids of the elements that name the text box. It is the `aria-labelledby` of the text box. When not set, the
   * Label of the field or `ariaLabel` names it.
   *
   * @cckSemantic *.ariaLabelledBy
   * @remarks Write it as `aria-labelledby` in a template. The prop is its camel-case form.
   */
  readonly ariaLabelledby?: string | undefined;
  /**
   * The text shown in the text box while it is empty. It is the `placeholder` of the text box.
   *
   * @defaultValue ''
   */
  readonly placeholder?: string | undefined;
  /**
   * The name under which the form submits the values: one entry per chip. The text box never has a name. When not
   * set, the form does not submit the list.
   *
   * @cckSemantic chip-list.name
   * @cckParity A native attribute of the hidden inputs that carry the values.
   */
  readonly name?: string | undefined;
  /**
   * The id of the form the entries belong to, when it is not the form around the list. When not set, the entries
   * belong to the form around the list.
   *
   * @cckSemantic chip-list.form
   * @cckParity A native attribute of the hidden inputs that carry the values.
   */
  readonly form?: string | undefined;
  /**
   * Whether leaving the text box adds the text as a chip, as Enter does.
   *
   * @defaultValue false
   */
  readonly addOnBlur?: boolean | undefined;
  /**
   * Whether the list is disabled. The text box and every remove button are natively disabled. A disabled `fieldset`
   * around it and the `disabled` of the field disable it too.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the list is read-only. The text box is focusable and read-only, and the remove buttons are disabled.
   *
   * @cckSemantic chip-list.readOnly
   * @cckParity Spelled as the native `readonly` attribute.
   * @defaultValue false
   */
  readonly readonly?: boolean | undefined;
  /**
   * Whether the list is required. A submit is blocked while the list is empty, and the text box carries
   * `aria-required`.
   *
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * Whether the list is invalid. `aria-invalid` appears only after `touched` or `submitted`.
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
   * Whether the list is hidden. It sets the native `hidden` attribute on the root.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   * @defaultValue false
   */
  readonly hidden?: boolean | undefined;
  /** Whether the user left the list. When not set, the list sets it after focus first leaves it. */
  readonly touched?: boolean | undefined;
  /** Whether the user added or removed a value. When not set, the list sets it after the first change. */
  readonly dirty?: boolean | undefined;
  /**
   * Whether the user tried to submit the form of the list. Bind it to the submit state of your forms library. When
   * not set, a `submit` event of the form sets it, a canceled one too, and a reset clears it.
   */
  readonly submitted?: boolean | undefined;
  /**
   * The values, bound with `v-model`, in the order they were added. When not set, the list keeps its own values,
   * which start as `defaultValue`.
   *
   * If you listen for changes and do not accept one, the old values stay. A value you set that holds duplicates or
   * empty texts is shown as given; only what the user types is checked.
   *
   * @cckSemantic chip-list.value
   * @cckParity Bound with `v-model`.
   * @defaultValue []
   */
  readonly modelValue?: readonly string[] | undefined;
  /**
   * The modifiers of `v-model`. The framework fills it. The component declares it so the modifiers do not reach the
   * native element.
   *
   * @internal
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The start values of a list whose `v-model` is not bound. It is read once, when the list is created, and a reset of
   * the form restores it.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   * @defaultValue []
   */
  readonly defaultValue?: readonly string[] | undefined;
  /**
   * The tag or component to render as the root. The text box is always a native `<input>`. It is ignored with
   * `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`. The text box is always a native `<input>`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the root merges onto the one child of the default slot. The list puts its chips and its text box inside
   * the child, in place of the child's own children.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/** The events of the ChipList. */
export interface ChipListEmits {
  /**
   * Emits the new values for `v-model` when the user adds or removes a chip, and when a reset of the form restores
   * the default. It is the only change event, and it carries the values only. It never fires when your code sets
   * the values.
   *
   * @cckSemantic chip-list.valueChange
   * @cckParity The `update:modelValue` event is the only change event; it carries the value only.
   */
  'update:modelValue': [value: string[]];
}
