import type { Component } from 'vue';
import type { AsTag, Direction } from '@cocokits/vue-core';
import type { RadioGroupOrientation } from '@cocokits/machines/radio-group';

export type { RadioGroupOrientation };

/**
 * A set of Radios with one value. The arrow keys move the focus and the check, the group is one tab stop, and the
 * value works in a native form: the radios' own inputs are the form controls and share the group's `name`. Bind the
 * value with `v-model`; `null` checks no radio. The items are `Radio` components identified by their `value`; inside a
 * group a Radio's own `v-model` and `name` are ignored and it emits nothing.
 *
 * Name the group with `aria-labelledby` (a visible caption) or `aria-label`; they fall through to the root like every
 * native attribute. The root is a `div` with the `radiogroup` role by default.
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
   * The value of the checked radio, bound with `v-model`; `null` checks none. A value that matches no radio is kept
   * and checks none. Bound with a listener it is controlled: a parent that does not accept a change keeps the old
   * value. Unbound, the group keeps its own value.
   *
   * @cckSemantic radio-group.value
   * @remarks Vue's `v-model` (`modelValue`).
   * @defaultValue null
   */
  readonly modelValue?: string | null | undefined;
  /**
   * The modifiers of `v-model` Vue passes; the component only declares them so they do not reach the DOM.
   *
   * @cckSemantic none
   * @remarks Vue-only: Vue fills it from `v-model.trim` and the like.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The checked radio of a group whose `v-model` is not bound, read once when the group is created. Binding
   * `modelValue` ignores it. A form reset returns to the value the group had when it was created.
   *
   * @cckSemantic none
   * @remarks Vue's uncontrolled start value, as React's `defaultValue`; Angular binds `value` as a model.
   */
  readonly defaultValue?: string | undefined;
  /**
   * The shared native `name` of the radios, which `FormData` submits with the checked radio's `value`. Left out, a
   * stable name is generated. It is not rendered on the root.
   *
   * @cckSemantic radio-group.name
   * @defaultValue generated
   * @remarks A generated name keeps the radios one native group on the server and before hydration.
   */
  readonly name?: string | undefined;
  /**
   * Disables every radio and removes the tab stop. A radio's own `disabled` and a disabling `fieldset` add to it.
   *
   * @cckSemantic radio-group.disabled
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Makes every radio required (native `required`), so submit is blocked until one is checked. A radio's own
   * `required` adds to it.
   *
   * @cckSemantic radio-group.required
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * The `form` attribute (the id of the owner form) for the radios that have none of their own. It is not
   * rendered on the root.
   *
   * @cckSemantic radio-group.form
   */
  readonly form?: string | undefined;
  /**
   * Limits the arrow keys to one axis: `horizontal` moves with Left and Right, `vertical` with Up and Down; the
   * other axis does nothing. Unset, both axes move.
   *
   * @cckSemantic radio-group.orientation
   * @defaultValue both axes
   */
  readonly orientation?: RadioGroupOrientation | undefined;
  /**
   * Whether the arrow keys wrap from the last radio to the first and back; `false` stops at the end.
   *
   * @cckSemantic radio-group.loop
   * @defaultValue true
   */
  readonly loop?: boolean | undefined;
  /**
   * The text direction of the group: Left and Right swap in `rtl`, and the root renders the `dir` attribute only
   * when you pass one. Without it the nearest `provideDirection` applies, else `'ltr'`.
   *
   * @cckSemantic none
   * @remarks Angular reads `Directionality` (no input).
   */
  readonly dir?: Direction | undefined;
  /**
   * The tag or component to render, in place of the `div`. The part keeps its role, state and handlers. Ignored
   * with `asChild`.
   *
   * @cckSemantic none
   * @remarks Vue's element override (Reka).
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the root merges onto its first element or component child instead of rendering a `div`.
   *
   * @cckSemantic none
   * @remarks Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/** The events of the RadioGroup. */
export interface RadioGroupEmits {
  /**
   * Emits with the new value for `v-model`, after a check the user makes and after a reset of the owner form that
   * changes the value; never when the parent sets the value. It carries the value only: to know the reason or the
   * event, listen to the native `change` of the inputs (it bubbles to the root) and to the form's `reset`.
   *
   * @cckSemantic radio-group.valueChange
   * @remarks The `v-model` update event of Vue is the group's only event (as Reka UI), so it stands for the change
   * event of the other frameworks: Angular emits `valueChangeDetails` and React calls `onValueChange`.
   */
  'update:modelValue': [value: string | null];
}
