import type { ChoiceControlProps } from '../internal/check-control.types';

/**
 * One standalone radio around a native `<input type="radio">` with its label. Radios with the same `name` form a
 * native group: the browser unchecks the others and moves focus with the arrow keys. The root is a `<div>` by default
 * and the content you write becomes the label. Bind the value with `v-model`.
 *
 * When the user checks another radio of the group, this radio's value becomes `false` and `update:modelValue` emits
 * with `false`. A parent that sets one radio's value and not the others gets no event for the
 * others: write every radio's `v-model` from one selected value. A radio without `name` has no group mate, so it warns
 * in development. Other native input attributes (`form`, ...) go to the `<input>`; `class`, `style` and
 * `hidden` stay on the root; `role`, `aria-invalid` and `aria-readonly` are reserved.
 *
 * Inside a `RadioGroup` the group owns the value: the radio is identified by its `value`, it is checked while the group
 * has that value, and its own `v-model`, `name` and events are ignored (it emits none). The group also gives the
 * `name`, the `tabindex` of the single tab stop, and its `disabled`, `required` and `form`.
 *
 * @example
 * <Radio v-model="isFree" name="plan" value="free">Free</Radio>
 *
 * @cckPart root
 * @cckPart wrapper
 * @cckPart inputWrapper
 * @cckPart input
 * @cckPart backdrop
 * @cckPart background
 * @cckPart label
 */
export interface RadioProps extends ChoiceControlProps {
  /**
   * The name that makes radios a group and that `FormData` submits. Give every radio of a group the same one. A
   * radio without a name warns in development. Ignored inside a `RadioGroup`, which gives the name.
   *
   * @cckSemantic *.name
   * @remarks A native attribute in React and Vue; Angular declares it as an input.
   */
  readonly name?: string | undefined;
  /**
   * The value `FormData` submits while the radio is checked; left out, the browser submits `on`. Inside a
   * `RadioGroup` it identifies the radio, and a radio without one can never be checked.
   *
   * @cckSemantic *.value
   * @remarks Angular names it `submitValue`, as on the Checkbox.
   */
  readonly value?: string | undefined;
  /**
   * Whether the radio is checked, bound with `v-model`. `null` and `undefined` render unchecked. It follows the
   * group: when the user checks another radio of the same `name`, it becomes `false`. Bound with a listener it is
   * controlled: a parent that does not accept a change keeps the old value. Unbound, the Radio keeps its own value. Ignored inside a `RadioGroup`.
   *
   * @cckSemantic radio.checked
   * @remarks Vue's `v-model` (`modelValue`).
   * @defaultValue false
   */
  readonly modelValue?: boolean | null | undefined;
  /**
   * The modifiers of `v-model` (`.trim`, `.number`, ...) Vue passes; the component only declares them so they do not reach the native element.
   *
   * @cckSemantic none
   * @remarks Vue-only: Vue fills it from `v-model.trim` and the like.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The initial checked state of a Radio whose `v-model` is not bound, read once when it is created. Binding `modelValue`,
   * with or without a listener, ignores it. A listener on `update:modelValue` reports the changes of the Radio
   * and does not make it controlled.
   *
   * @cckSemantic none
   * @remarks Vue's uncontrolled start value, as React's `defaultChecked`; Angular binds it as a model.
   * @defaultValue false
   */
  readonly defaultChecked?: boolean | undefined;
}

/** The events of the Radio. */
export interface RadioEmits {
  /**
   * Emits with the new checked value for `v-model`, after a change the user makes and after a reset of the owner form.
   *
   * @cckSemantic radio.checkedChange
   * @remarks The `v-model` update event of Vue is the only change event (as Reka UI), so it stands for the change event of the other frameworks: Angular emits `checkedChangeDetails` and React calls `onCheckedChange`. It carries the value only.
   */
  'update:modelValue': [checked: boolean];
}
