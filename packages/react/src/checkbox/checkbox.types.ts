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
  // The text comes from `ChoiceBaseProps`. This block names the details type and gives an example of this control.
  /**
   * @example
   * const [accepted, setAccepted] = useState(false);
   * <Checkbox
   *   checked={accepted}
   *   onCheckedChange={(checked, details) => {
   *     if (details.reason === 'user') setAccepted(checked);
   *   }}
   * >
   *   Accept the terms
   * </Checkbox>
   * @cckSemantic *.checkedChange
   * @cckParity The change callback of this component.
   */
  readonly onCheckedChange?: ((checked: boolean, details: CheckboxChangeDetails) => void) | undefined;
  // The text comes from `ChoiceBaseProps`; this line only names the render props and state of this control.
  readonly render?: RenderProp<CheckboxRenderProps, CheckboxState> | undefined;
}
