import type { ReactNode } from 'react';
import type { RenderProp } from '../internal/render-element';
import type {
  ChoiceControlBaseProps,
  ChoiceControlChangeDetails,
  ChoiceControlChangeReason,
  ChoiceControlState,
  ChoiceRootProps,
} from '../internal/choice-control.types';

/** Why the checked value of a Switch changed. */
export type SwitchChangeReason = ChoiceControlChangeReason;

/** What `onCheckedChange` receives besides the value: the `reason` and the `event` behind the change. */
export type SwitchChangeDetails = ChoiceControlChangeDetails;

/** The state of the Switch that the function form of `render` receives: the checked value and the state of the control. */
export type SwitchState = ChoiceControlState;

/** The root props that the function form of `render` receives for a Switch. */
export type SwitchRenderProps = ChoiceRootProps;

/**
 * Props of the {@link Switch}. The root takes `className`, `style`, `hidden` and `render`. Every other native
 * `input` prop passes through to the native input, and `ref` reaches the input.
 */
export interface SwitchProps extends ChoiceControlBaseProps<SwitchState> {
  /**
   * The caption that names the Switch. When not set, name the Switch with `aria-label` or `aria-labelledby`.
   *
   * @example
   * <Switch>Email notifications</Switch>
   */
  readonly children?: ReactNode;
  /**
   * Called after the user checks or unchecks the Switch, and after a reset of its form. It receives the new state
   * and a details object with the `reason` and the `event`.
   *
   * The `event` is the native `change` event, or the `reset` event after a reset. It is never called when you
   * change `checked` yourself.
   *
   * @example
   * <Switch onCheckedChange={(checked, details) => details.reason === 'user' && setNotify(checked)}>
   *   Email notifications
   * </Switch>
   * @cckSemantic *.checkedChange
   * @cckParity The change callback of this component.
   */
  readonly onCheckedChange?: ((checked: boolean, details: SwitchChangeDetails) => void) | undefined;
  /**
   * Replaces the root element. Pass an element, or a function of the root props and the {@link SwitchState}. The
   * caption and the inner parts stay.
   *
   * When not set, the root is a `<div>`. The `ref` reaches the input, not the root. The element form keeps the
   * `ref` of the element, and the function form receives no `ref`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<SwitchRenderProps, SwitchState> | undefined;
}
