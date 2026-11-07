import type { ReactNode } from 'react';
import type { RenderProp } from '../internal/render-element';
import type {
  ChoiceControlBaseProps,
  ChoiceControlChangeDetails,
  ChoiceControlChangeReason,
  ChoiceControlState,
  ChoiceRootProps,
} from '../internal/choice-control.types';

/** Why the checked value of a Checkbox changed. */
export type CheckboxChangeReason = ChoiceControlChangeReason;

/** What `onCheckedChange` receives besides the value: the `reason` and the `event` behind the change. */
export type CheckboxChangeDetails = ChoiceControlChangeDetails;

/**
 * The state of the Checkbox that the function form of `render` receives. It holds the checked value, the mixed
 * state and the state of the control.
 */
export interface CheckboxState extends ChoiceControlState {
  /** Whether the Checkbox shows the mixed state. */
  readonly indeterminate: boolean;
}

/** The root props that the function form of `render` receives for a Checkbox. */
export type CheckboxRenderProps = ChoiceRootProps;

/**
 * Props of the {@link Checkbox}. The root takes `className`, `style`, `hidden` and `render`. Every other native
 * `input` prop passes through to the native input, and `ref` reaches the input.
 */
export interface CheckboxProps extends ChoiceControlBaseProps<CheckboxState> {
  /**
   * The caption that names the Checkbox. When not set, name the Checkbox with `aria-label` or `aria-labelledby`.
   *
   * @example
   * <Checkbox>Accept the terms</Checkbox>
   */
  readonly children?: ReactNode;
  /**
   * Whether the Checkbox shows the mixed state. The Checkbox never changes it, so you set it again in
   * `onCheckedChange`.
   *
   * The server render has `data-indeterminate`. The DOM property is set after mount.
   *
   * @defaultValue false
   */
  readonly indeterminate?: boolean | undefined;
  /**
   * Called after the user checks or unchecks the Checkbox, and after a reset of its form. It receives the new state
   * and a details object with the `reason` and the `event`.
   *
   * The `event` is the native `change` event, or the `reset` event after a reset. It is never called when you
   * change `checked` yourself.
   *
   * @example
   * <Checkbox onCheckedChange={(checked, details) => details.reason === 'user' && setAccepted(checked)}>
   *   Accept the terms
   * </Checkbox>
   * @cckSemantic *.checkedChange
   * @cckParity The change callback of this component.
   */
  readonly onCheckedChange?: ((checked: boolean, details: CheckboxChangeDetails) => void) | undefined;
  /**
   * Replaces the root element. Pass an element, or a function of the root props and the {@link CheckboxState}. The
   * caption and the inner parts stay.
   *
   * When not set, the root is a `<div>`. The `ref` reaches the input, not the root. The element form keeps the
   * `ref` of the element, and the function form receives no `ref`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<CheckboxRenderProps, CheckboxState> | undefined;
}
