import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';
import type { CheckboxGroupOrientation } from '@cocokits/machines/checkbox-group';

export type { CheckboxGroupOrientation };

/**
 * A group of checkboxes with one list of checked values. It renders a `<div>` with `role="group"`. Bind the list with
 * `v-model`: it holds the `value` of every checked `Checkbox` inside the group.
 *
 * The group is not a form control. Each `Checkbox` inside is its own native control, so `FormData` submits one entry
 * for each checked box under the `name` of the group. Inside the group, the own `v-model` of a `Checkbox` is ignored,
 * and it gets the `name` and `disabled` of the group.
 *
 * Name the group. Inside a FormField, the Label of the field names it through `aria-labelledby`. Alone, give it
 * `aria-label` or `aria-labelledby`; they fall through to the root, as every native attribute does. In development,
 * the group warns when nothing names it.
 *
 * @example
 * <CheckboxGroup v-model="toppings" name="toppings" aria-label="Toppings">
 *   <Checkbox value="cheese">Cheese</Checkbox>
 *   <Checkbox value="olives">Olives</Checkbox>
 * </CheckboxGroup>
 *
 * @cckPart root
 */
export interface CheckboxGroupProps {
  /**
   * The `value` of every checked checkbox, bound with `v-model`. When not set, the group keeps its own list, which
   * starts as `defaultValue`.
   *
   * A value that matches no checkbox is kept. If you listen for changes and do not accept one, the old list stays.
   *
   * @cckSemantic checkbox-group.value
   * @cckParity Bound with `v-model`.
   * @defaultValue []
   */
  readonly modelValue?: readonly string[] | undefined;
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
   * The start list of a group whose `v-model` is not bound. It is read once, when the group is created, and a reset of
   * the form returns each checkbox to its own start state.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   * @defaultValue []
   */
  readonly defaultValue?: readonly string[] | undefined;
  /**
   * The native `name` of every checkbox in the group. A `name` on a checkbox wins. When not set, the group gives no
   * name.
   *
   * @cckSemantic checkbox-group.name
   */
  readonly name?: string | undefined;
  /**
   * Whether every checkbox is disabled. A disabled FormField around the group disables it too. The root gets
   * `data-disabled`.
   *
   * @cckSemantic checkbox-group.disabled
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * How the theme lays the checkboxes out. The root gets `data-orientation`.
   *
   * @cckSemantic checkbox-group.orientation
   * @defaultValue 'vertical'
   */
  readonly orientation?: CheckboxGroupOrientation | undefined;
  /**
   * The tag or component to render in place of the `<div>`. The part keeps its role, state and handlers. It is
   * ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the root merges onto the one child of the default slot, instead of rendering a `<div>`.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/** The events of the CheckboxGroup. */
export interface CheckboxGroupEmits {
  /**
   * Emits the new list for `v-model` when the user checks or unchecks a checkbox, and when a reset of the form
   * changes it. It is the only change event, and it carries the list only. It never fires when your code sets the
   * list.
   *
   * @cckSemantic checkbox-group.valueChange
   * @cckParity The `update:modelValue` event is the only change event; it carries the value only.
   */
  'update:modelValue': [value: string[]];
}
