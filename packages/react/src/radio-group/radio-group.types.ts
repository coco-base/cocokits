import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { RadioGroupChangeReason, RadioGroupOrientation } from '@cocokits/machines/radio-group';
import type { ChangeDetails, Direction } from '@cocokits/shared';

export type { RadioGroupChangeReason, RadioGroupOrientation };

/** What `onValueChange` receives besides the value: the `reason` and the `event` behind the change. */
export type RadioGroupChangeDetails = ChangeDetails<RadioGroupChangeReason>;

/** The state of the RadioGroup that the function form of `render` receives. */
export interface RadioGroupState {
  /** The value of the checked radio, or `null` while no radio is checked. */
  readonly value: string | null;
  /** Whether the group is disabled. */
  readonly disabled: boolean;
  /** Whether the group is required. */
  readonly required: boolean;
  /** The axis of the arrow keys, or `undefined` while the arrow keys of both axes move. */
  readonly orientation: RadioGroupOrientation | undefined;
}

/**
 * The props that the function form of `render` receives: the native props merged with the props of the group. Pass
 * all of them, `ref` included, to one element.
 */
export interface RadioGroupRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-disabled` and `data-orientation`. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the `ref` of the group, the `ref` of the rendered element and the `ref` of the group itself. */
  readonly ref: RefCallback<HTMLElement>;
}

/**
 * Props of the {@link RadioGroup}. Native `div` props pass through to the root. Name the group with
 * `aria-labelledby` for a visible caption, or with `aria-label`, and describe it with `aria-describedby`.
 */
export interface RadioGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'defaultValue' | 'dir'> {
  /**
   * The radios of the group: any markup that holds `Radio` elements. When not set, the group is empty.
   *
   * @example
   * <RadioGroup aria-label="Plan">
   *   <Radio value="free">Free</Radio>
   *   <Radio value="pro">Pro</Radio>
   * </RadioGroup>
   *
   * @cckSemantic radio-group.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The value of the checked radio. Setting it makes the group controlled, and `null` checks no radio. If you do not
   * update it after `onValueChange`, the old value stays.
   *
   * A value that matches no radio stays and checks no radio. When not set, the group keeps its own value, which
   * starts as `defaultValue`.
   *
   * @cckSemantic radio-group.value
   */
  readonly value?: string | null | undefined;
  /**
   * The start value of a group that you do not control with `value`. A form reset restores it. When not set, no
   * radio is checked at the start.
   *
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultValue?: string | undefined;
  /**
   * Called after the user checks a radio, and after a form reset that changes the value. It receives the new value
   * and a details object with the `reason` and the `event`.
   *
   * The user can check a radio with a click, a click on its label, Space or an arrow key. It is never called when you
   * change `value` yourself. The radios inside call no change of their own.
   *
   * @example
   * <RadioGroup aria-label="Plan" value={plan} onValueChange={(value) => setPlan(value)}>
   *   ...
   * </RadioGroup>
   *
   * @cckSemantic radio-group.valueChange
   * @cckParity The change callback of this component.
   */
  readonly onValueChange?: ((value: string | null, details: RadioGroupChangeDetails) => void) | undefined;
  /**
   * The `name` that every radio of the group sends with the form. It is not written on the root. When not set, the
   * group makes a name that is the same on the server and the client.
   *
   * @cckSemantic radio-group.name
   * @defaultValue generated
   */
  readonly name?: string | undefined;
  /**
   * Whether every radio is disabled. The group then has no tab stop. A radio can also be disabled by its own
   * `disabled`.
   *
   * @cckSemantic radio-group.disabled
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether a radio must be checked before the form can submit. It sets the native `required` on every input, and
   * `aria-required` on the root.
   *
   * @cckSemantic radio-group.required
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * The `id` of the form that the radios belong to, for each radio without its own `form`. It is not written on the
   * root. When not set, the form around the group owns the radios.
   *
   * @cckSemantic radio-group.form
   */
  readonly form?: string | undefined;
  /**
   * The axis of the arrow keys that move between the radios. When not set, the arrow keys of both axes move.
   *
   * @cckSemantic radio-group.orientation
   * @defaultValue both axes
   */
  readonly orientation?: RadioGroupOrientation | undefined;
  /**
   * Whether the arrow keys move from the last radio to the first, and from the first to the last.
   *
   * @cckSemantic radio-group.loop
   * @defaultValue true
   */
  readonly loop?: boolean | undefined;
  /**
   * The text direction of the group and everything inside it. In `rtl`, Left and Right swap. When not set, the
   * nearest `DirectionProvider` applies, and then `'ltr'`.
   *
   * Only a `dir` you pass is written on the element.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly dir?: Direction | undefined;
  /**
   * Replaces the `<div>` of the group. Pass an element, or a function of the merged props and the
   * {@link RadioGroupState}. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the group renders a `<div>`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: ReactElement | ((props: RadioGroupRenderProps, state: RadioGroupState) => ReactElement) | undefined;
}
