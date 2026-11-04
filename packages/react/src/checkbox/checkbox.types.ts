import type {
  ChoiceControlBaseProps,
  ChoiceControlChangeDetails,
  ChoiceControlChangeReason,
  ChoiceControlState,
  ChoiceRootProps,
} from '../internal/choice-control.types';

/** Why the checked value of a Checkbox changed: the user toggled it (`'user'`) or the owner form was reset (`'form-reset'`). */
export type CheckboxChangeReason = ChoiceControlChangeReason;

/** What `onCheckedChange` receives besides the value: the reason and the event behind it. */
export type CheckboxChangeDetails = ChoiceControlChangeDetails;

/**
 * The public state of the Checkbox, passed to the function form of `render`: the checked value, the mixed
 * state and the resolved facts.
 */
export interface CheckboxState extends ChoiceControlState {
  /** Whether the Checkbox shows the mixed state. */
  readonly indeterminate: boolean;
}

/** The props the function form of `render` receives for the root of a Checkbox. */
export type CheckboxRenderProps = ChoiceRootProps;

/**
 * Props of the {@link Checkbox}. The root takes `className`, `style`, `hidden` and `render`; every other
 * native `input` attribute passes through to the native input, and `ref` reaches the input.
 */
export interface CheckboxProps extends ChoiceControlBaseProps<CheckboxState> {
  /**
   * Whether the Checkbox shows the mixed state. One-way: the Checkbox never changes it, so the parent that
   * owns the mixed state recomputes it in `onCheckedChange`. `data-indeterminate` renders on the server;
   * the DOM property is set after mount.
   *
   * @defaultValue false
   */
  readonly indeterminate?: boolean | undefined;
}
