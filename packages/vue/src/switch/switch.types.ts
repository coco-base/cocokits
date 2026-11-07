import type { CheckControlProps } from '../internal/check-control.types';

/**
 * A switch around a native `<input type="checkbox" role="switch">` with its label. It works as the Checkbox
 * without `indeterminate`. Bind the value with `v-model`.
 *
 * The input is the form control, so `FormData`, `required`, reset, the `form` attribute and `fieldset[disabled]` are
 * native. The label holds the track and the content you write. Other native input attributes and listeners go to
 * the `<input>`. `class`, `style` and `hidden` stay on the root, and `role` is reserved.
 *
 * @example
 * <Switch v-model="notify">Email notifications</Switch>
 *
 * @cckPart root
 * @cckPart label
 * @cckPart track
 * @cckPart input
 * @cckPart thumb
 * @cckPart backdrop
 */
export interface SwitchProps extends CheckControlProps {
  /**
   * Whether the switch is on, bound with `v-model`. `null` renders off. When not set, the Switch keeps its own
   * value, which starts as `defaultChecked`.
   *
   * If you listen for changes and do not accept one, the old value stays.
   *
   * @cckSemantic switch.checked
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
   * The start checked state of a Switch whose `v-model` is not bound. It is read once, when the Switch is created.
   *
   * A bound `modelValue` ignores it, with or without a listener. A listener on `update:modelValue` alone reports the
   * changes and does not make the Switch controlled.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   * @defaultValue false
   */
  readonly defaultChecked?: boolean | undefined;
}

/** The events of the Switch. */
export interface SwitchEmits {
  /**
   * Emits the new checked value for `v-model` when the user changes it and when the form of the control resets.
   * It is the only change event, and it carries the value only.
   *
   * @cckSemantic switch.checkedChange
   * @cckParity The `update:modelValue` event is the only change event; it carries the value only.
   */
  'update:modelValue': [checked: boolean];
}
