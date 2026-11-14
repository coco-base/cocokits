import type { Component } from 'vue';
import type { AsTag, Direction } from '@cocokits/vue-core';
import type { RadioGroupOrientation } from '@cocokits/machines/radio-group';

export type { RadioGroupOrientation };

/**
 * A set of Radios with one value. It renders a `<div>` with the `radiogroup` role. Bind the value with `v-model`;
 * `null` checks no radio.
 *
 * The arrow keys move the focus and the check, and the group is one Tab stop. The value works in a native form: the
 * inputs of the radios are the form controls, and they share the `name` of the group.
 *
 * The items are `Radio` components, each known by its `value`. Inside a group, the own `v-model` and `name` of a
 * Radio are ignored, and it emits nothing.
 *
 * Name the group with `aria-labelledby` for a visible caption, or with `aria-label`. They fall through to the root,
 * as every native attribute does.
 *
 * @example
 * <span id="plan-label">Plan</span>
 * <RadioGroup v-model="plan" aria-labelledby="plan-label">
 *   <Radio value="free">Free</Radio>
 *   <Radio value="pro">Pro</Radio>
 * </RadioGroup>
 *
 * @cckPart root
 */
export interface RadioGroupProps {
  /**
   * The value of the checked radio, bound with `v-model`. `null` checks none. When not set, the group keeps its own
   * value, which starts as `defaultValue`.
   *
   * A value that matches no radio is kept and checks none. If you listen for changes and do not accept one, the old
   * value stays.
   *
   * @cckSemantic radio-group.value
   * @cckParity Bound with `v-model`.
   * @defaultValue null
   */
  readonly modelValue?: string | null | undefined;
  /**
   * The modifiers of `v-model`, as in `v-model.trim`. The framework fills it. The component declares it so the
   * modifiers do not reach the DOM.
   *
   * @internal
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The start value of a group whose `v-model` is not bound. It is read once, when the group is created. When not
   * set, no radio starts checked.
   *
   * A bound `modelValue` ignores it. A form reset returns to the value the group had when it was created.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   */
  readonly defaultValue?: string | undefined;
  /**
   * The native `name` of all the radios. `FormData` submits it with the `value` of the checked radio. When not set,
   * the group generates a stable name.
   *
   * It is not rendered on the root. A generated name keeps the radios one native group on the server and before hydration.
   *
   * @cckSemantic radio-group.name
   * @defaultValue generated
   */
  readonly name?: string | undefined;
  /**
   * Whether every radio is disabled. It also removes the Tab stop. The `disabled` of a radio and a disabled
   * `fieldset` disable radios too.
   *
   * @cckSemantic radio-group.disabled
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether a radio must be checked. It sets the native `required` on every radio, so a submit is blocked until one
   * is checked. The `required` of a radio adds to it.
   *
   * @cckSemantic radio-group.required
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * The id of the form that the radios belong to, for the radios that set no `form` of their own. Use it when the
   * group is outside its form. When not set, the form around the group owns the radios.
   *
   * It is not rendered on the root.
   *
   * @cckSemantic radio-group.form
   */
  readonly form?: string | undefined;
  /**
   * The one axis the arrow keys move on. The keys of the other axis do nothing. When not set, both axes move.
   *
   * @cckSemantic radio-group.orientation
   * @defaultValue both axes
   */
  readonly orientation?: RadioGroupOrientation | undefined;
  /**
   * Whether the arrow keys go from the last radio to the first and back. With `false`, they stop at the end.
   *
   * @cckSemantic radio-group.loop
   * @defaultValue true
   */
  readonly loop?: boolean | undefined;
  /**
   * The text direction of the group. ArrowLeft and ArrowRight swap in `rtl`. When not set, the nearest direction
   * provider applies, and then `'ltr'`.
   *
   * Only a `dir` you pass is written on the root element.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly dir?: Direction | undefined;
  /**
   * The tag or component to render, in place of the `<div>`. The part keeps its role, state and handlers. It is
   * ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the root merges onto its first element or component child, instead of rendering a `<div>`.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/** The events of the RadioGroup. */
export interface RadioGroupEmits {
  /**
   * Emits the new value for `v-model` when the user checks a radio, and when a reset of the form changes the value.
   * It never emits when the parent sets the value.
   *
   * It is the only change event, and it carries the value only. For the reason or the event, listen to the native
   * `change` of the inputs and to the `reset` of the form. The `change` bubbles to the root.
   *
   * @cckSemantic radio-group.valueChange
   * @cckParity The `update:modelValue` event is the group's only change event; it carries the value only.
   */
  'update:modelValue': [value: string | null];
}
