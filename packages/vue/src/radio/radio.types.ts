import type { ChoiceControlProps } from '../internal/check-control.types';

/**
 * One radio around a native `<input type="radio">` with its label. It renders a `<div>`, and the content you write
 * becomes the label. Bind the value with `v-model`.
 *
 * Radios with the same `name` form a native group: the browser unchecks the others and moves the focus with the
 * arrow keys. When the user checks another radio of the group, the value of this radio becomes `false`, and
 * `update:modelValue` emits `false`.
 *
 * A parent that sets the value of one radio gets no event for the others. So write the `v-model` of every radio from
 * one selected value. A radio without `name` has no group, so it warns in development.
 *
 * Other native input attributes, such as `form`, go to the `<input>`. `class`, `style` and `hidden` stay on the root.
 * `role`, `aria-invalid` and `aria-readonly` are reserved.
 *
 * Inside a `RadioGroup`, the group owns the value. The radio is checked while the group has its `value`. Its own
 * `v-model`, `name` and events are ignored, and it emits nothing. The group also gives the `name`, the `tabindex` of
 * the single Tab stop, and its `disabled`, `required` and `form`.
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
   * The name that makes radios a group and that `FormData` submits. Give every radio of a group the same name.
   * When not set, the radio has no group and warns in development.
   *
   * It is ignored inside a `RadioGroup`, which gives the name.
   *
   * @cckSemantic *.name
   * @cckParity A native attribute of the element.
   */
  readonly name?: string | undefined;
  /**
   * The value that `FormData` submits while the radio is checked. When not set, the browser submits `on`.
   *
   * Inside a `RadioGroup` it identifies the radio, and a radio without one can never be checked.
   *
   * @cckSemantic *.value
   * @cckParity A native attribute of the element.
   */
  readonly value?: string | undefined;
  /**
   * Whether the radio is checked, bound with `v-model`. `null` renders unchecked. When not set, the Radio keeps its
   * own value, which starts as `defaultChecked`.
   *
   * When the user checks another radio with the same `name`, it becomes `false`. If you listen for changes and do
   * not accept one, the old value stays. It is ignored inside a `RadioGroup`.
   *
   * @cckSemantic radio.checked
   * @cckParity Bound with `v-model`.
   * @defaultValue false
   */
  readonly modelValue?: boolean | null | undefined;
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
   * The start checked state of a Radio whose `v-model` is not bound. It is read once, when the Radio is created.
   *
   * A bound `modelValue` ignores it, with or without a listener. A listener on `update:modelValue` alone reports the
   * changes and does not make the Radio controlled.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   * @defaultValue false
   */
  readonly defaultChecked?: boolean | undefined;
}

/** The events of the Radio. */
export interface RadioEmits {
  /**
   * Emits the new checked value for `v-model` when the user changes it and when the form of the control resets.
   * It is the only change event, and it carries the value only.
   *
   * @cckSemantic radio.checkedChange
   * @cckParity The `update:modelValue` event is the only change event; it carries the value only.
   */
  'update:modelValue': [checked: boolean];
}
