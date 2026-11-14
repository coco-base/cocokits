import type { ReactNode } from 'react';
import type { RenderProp } from '../internal/render-element';
import type {
  ChoiceBaseProps,
  ChoiceRootProps,
  ChoiceControlChangeDetails,
  ChoiceControlChangeReason,
} from '../internal/choice-control.types';

/** Why the checked value of a Radio changed. */
export type RadioChangeReason = ChoiceControlChangeReason;

/** What `onCheckedChange` receives besides the value: the `reason` and the `event` behind the change. */
export type RadioChangeDetails = ChoiceControlChangeDetails;

/** The state of the Radio that the function form of `render` receives. */
export interface RadioState {
  /** Whether the Radio is checked. */
  readonly checked: boolean;
  /** Whether the Radio is disabled, by its own prop or by a disabled `fieldset` around it. */
  readonly disabled: boolean;
  /** Whether the Radio is required. */
  readonly required: boolean;
}

/**
 * Props of the {@link Radio}. The root takes `className`, `style`, `hidden` and `render`. Every other native `input`
 * prop passes through to the native input, and `ref` reaches the input.
 *
 * A Radio has no read-only state, no form state and no `FormField` support.
 */
export interface RadioProps extends Omit<
  ChoiceBaseProps<RadioState>,
  'name' | 'onCheckedChange' | 'aria-invalid' | 'aria-readonly'
> {
  /**
   * The caption that names the Radio. When not set, name the Radio with `aria-label` or `aria-labelledby`.
   *
   * @example
   * <Radio name="plan" value="pro">Pro</Radio>
   */
  readonly children?: ReactNode;
  /**
   * The name that makes radios a group, and that `FormData` sends. Give every radio of a group the same name.
   *
   * When not set, the radio has no group, and it warns in development. Inside a `RadioGroup`, the name of the
   * group applies in its place.
   *
   * @cckSemantic *.name
   * @cckParity A native attribute of the element.
   */
  readonly name?: string | undefined;
  /**
   * Whether the Radio is hidden. It sets the native `hidden` on the root. When not set, the Radio shows.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   */
  readonly hidden?: boolean | undefined;
  /**
   * Called after the user checks the Radio, or checks another radio of its group, and after a reset of its form. It
   * receives the new state and a details object with the `reason` and the `event`.
   *
   * The `event` is the native `change` event. In a group, the radio that lost the check calls it before the one that
   * gained it. It is never called when you change `checked` yourself, and never inside a `RadioGroup`.
   *
   * @example
   * const [plan, setPlan] = useState('free');
   * <Radio name="plan" value="pro" checked={plan === 'pro'} onCheckedChange={(checked) => checked && setPlan('pro')}>
   *   Pro
   * </Radio>
   * @cckSemantic *.checkedChange
   * @cckParity The change callback of this component.
   */
  readonly onCheckedChange?: ((checked: boolean, details: RadioChangeDetails) => void) | undefined;
  // The text comes from `ChoiceBaseProps`; this line only names the render props and state of this control.
  readonly render?: RenderProp<RadioRenderProps, RadioState> | undefined;
}

/** The root props that the function form of `render` receives for a Radio. */
export type RadioRenderProps = ChoiceRootProps;
