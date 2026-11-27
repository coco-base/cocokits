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
  // The text comes from `ChoiceBaseProps`. This block names the details type and gives an example of this control.
  /**
   * @example
   * const [notify, setNotify] = useState(true);
   * <Switch
   *   checked={notify}
   *   onCheckedChange={(checked, details) => {
   *     if (details.reason === 'user') setNotify(checked);
   *   }}
   * >
   *   Email notifications
   * </Switch>
   * @cckSemantic *.checkedChange
   * @cckParity The change callback of this component.
   */
  readonly onCheckedChange?: ((checked: boolean, details: SwitchChangeDetails) => void) | undefined;
  // The text comes from `ChoiceBaseProps`; this line only names the render props and state of this control.
  readonly render?: RenderProp<SwitchRenderProps, SwitchState> | undefined;
}
