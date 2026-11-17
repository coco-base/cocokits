import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { CheckboxGroupChangeReason, CheckboxGroupOrientation } from '@cocokits/machines/checkbox-group';
import type { ChangeDetails } from '@cocokits/shared';
import type { RenderProp } from '../internal/render-element';

export type { CheckboxGroupChangeReason, CheckboxGroupOrientation };

/** What `onValueChange` receives besides the value: the `reason` and the `event` behind the change. */
export type CheckboxGroupChangeDetails = ChangeDetails<CheckboxGroupChangeReason>;

/** The state of the CheckboxGroup that the function form of `render` receives. */
export interface CheckboxGroupState {
  /** The `value` of every checked checkbox. */
  readonly value: readonly string[];
  /** Whether the group is disabled, by its own prop or by its FormField. */
  readonly disabled: boolean;
  /** How the checkboxes are laid out. */
  readonly orientation: CheckboxGroupOrientation;
}

/**
 * The props that the function form of `render` receives: the native props merged with the props of the group. Pass
 * all of them, `children` and `ref` included, to one element.
 */
export interface CheckboxGroupRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-disabled` and `data-orientation`. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the `ref` of the group, the `ref` of the rendered element and the `ref` of the group itself. */
  readonly ref: RefCallback<HTMLElement>;
}

/**
 * Props of the {@link CheckboxGroup}. Native `div` props pass through to the root, and `ref` reaches it. Name the
 * group with a `Label` inside a `FormField`, or with `aria-label` or `aria-labelledby`.
 */
export interface CheckboxGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'defaultValue'> {
  /**
   * The checkboxes of the group: any markup that holds `Checkbox` elements, each with a `value`. When not set, the
   * group is empty.
   *
   * @example
   * <CheckboxGroup aria-label="Toppings">
   *   <Checkbox value="cheese">Cheese</Checkbox>
   *   <Checkbox value="olives">Olives</Checkbox>
   * </CheckboxGroup>
   *
   * @cckSemantic checkbox-group.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The `value` of every checked checkbox, in the order the user checked them. Setting it makes the group controlled.
   *
   * @remarks
   * If you do not update it after `onValueChange`, the old list stays.
   *
   * @cckSemantic checkbox-group.value
   * @defaultValue []
   */
  readonly value?: readonly string[] | undefined;
  /**
   * The start list of a group that you do not control with `value`. A form reset restores it. When not set, no
   * checkbox is checked at the start.
   *
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultValue?: readonly string[] | undefined;
  /**
   * Called after the user checks or unchecks a checkbox, and after a form reset that changes the list. It receives
   * the new list and a details object with the `reason` and the `event`. It is never called when you change
   * `value` yourself.
   *
   * @example
   * const [toppings, setToppings] = useState<readonly string[]>(['cheese']);
   * <CheckboxGroup aria-label="Toppings" value={toppings} onValueChange={(value) => setToppings(value)}>
   *   ...
   * </CheckboxGroup>
   *
   * @cckSemantic checkbox-group.valueChange
   * @cckParity The change callback of this component.
   */
  readonly onValueChange?: ((value: readonly string[], details: CheckboxGroupChangeDetails) => void) | undefined;
  /**
   * Whether every checkbox is disabled. A disabled `FormField` also disables the group.
   *
   * @cckSemantic checkbox-group.disabled
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The `name` that every checkbox of the group sends with the form. A `name` on a checkbox wins. When not set, the
   * checkboxes send no name.
   *
   * @cckSemantic checkbox-group.name
   * @defaultValue ''
   */
  readonly name?: string | undefined;
  /**
   * How the theme lays the checkboxes out. The group renders it as `data-orientation`.
   *
   * @cckSemantic checkbox-group.orientation
   * @defaultValue 'vertical'
   */
  readonly orientation?: CheckboxGroupOrientation | undefined;
  /**
   * Replaces the `<div>` of the group. Pass an element, or a function of the merged props and the
   * {@link CheckboxGroupState}. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the group renders a `<div>`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<CheckboxGroupRenderProps, CheckboxGroupState> | undefined;
}
