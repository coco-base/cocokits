import type {
  ChoiceControlBaseProps,
  ChoiceControlChangeDetails,
  ChoiceControlChangeReason,
  ChoiceControlState,
  ChoiceRootProps,
} from '../internal/choice-control.types';

/** Why the checked value of a Switch changed: the user toggled it (`'user'`) or the owner form was reset (`'form-reset'`). */
export type SwitchChangeReason = ChoiceControlChangeReason;

/** What `onCheckedChange` receives besides the value: the reason and the event behind it. */
export type SwitchChangeDetails = ChoiceControlChangeDetails;

/** The public state of the Switch, passed to the function form of `render`: the checked value and the resolved facts. */
export type SwitchState = ChoiceControlState;

/** The props the function form of `render` receives for the root of a Switch. */
export type SwitchRenderProps = ChoiceRootProps;

/**
 * Props of the {@link Switch}. The root takes `className`, `style`, `hidden` and `render`; every other
 * native `input` attribute passes through to the native input, and `ref` reaches the input.
 */
export type SwitchProps = ChoiceControlBaseProps<SwitchState>;
