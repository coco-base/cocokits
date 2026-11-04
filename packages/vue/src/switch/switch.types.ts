import type { CheckControlProps } from '../internal/check-control.types';

/**
 * A switch around a native `<input type="checkbox" role="switch">` with its label. It behaves as the Checkbox
 * without `indeterminate`: bind the value with `v-model`; the input is the form control, so `FormData`, `required`,
 * reset, the `form` attribute and `fieldset[disabled]` are native. The label wraps the track and the content you
 * write. Other native input attributes and listeners go to the `<input>`; `class`, `style` and `hidden` stay on the root; `role` is reserved.
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
   * Whether the switch is on, bound with `v-model`. `null` and `undefined` render off. Bound with a listener it is
   * controlled: a parent that does not accept a change keeps the old value. Unbound, the Switch keeps its own value.
   *
   * @cckSemantic switch.checked
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
   * The initial checked state of a Switch whose `v-model` is not bound, read once when it is created. Binding `modelValue`,
   * with or without a listener, ignores it. A listener on `update:modelValue` reports the changes of the Switch
   * and does not make it controlled.
   *
   * @cckSemantic none
   * @remarks Vue's uncontrolled start value, as React's `defaultChecked`; Angular binds it as a model.
   * @defaultValue false
   */
  readonly defaultChecked?: boolean | undefined;
}

/** The events of the Switch. */
export interface SwitchEmits {
  /**
   * Emits with the new checked value for `v-model`, after a change the user makes and after a reset of the owner form.
   *
   * @cckSemantic switch.checkedChange
   * @remarks The `v-model` update event of Vue is the only change event (as Reka UI), so it stands for the change event of the other frameworks: Angular emits `checkedChangeDetails` and React calls `onCheckedChange`. It carries the value only.
   */
  'update:modelValue': [checked: boolean];
}
