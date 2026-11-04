import type {
  ChoiceBaseProps,
  ChoiceRootProps,
  ChoiceControlChangeDetails,
  ChoiceControlChangeReason,
} from '../internal/choice-control.types';

/**
 * Why the checked value of a Radio changed: the user checked it or another radio of its group (`'user'`), or
 * the owner form was reset (`'form-reset'`).
 */
export type RadioChangeReason = ChoiceControlChangeReason;

/** What `onCheckedChange` receives besides the value: the reason and the event behind it. */
export type RadioChangeDetails = ChoiceControlChangeDetails;

/** The public state of the Radio, passed to the function form of `render`. */
export interface RadioState {
  /** Whether the Radio is checked. */
  readonly checked: boolean;
  /** Whether the Radio is disabled by a prop or an ancestor fieldset. */
  readonly disabled: boolean;
  /** Whether the Radio is required. */
  readonly required: boolean;
}

/**
 * Props of the {@link Radio}. The root takes `className`, `style`, `hidden` and `render`; every other native `input`
 * attribute passes through to the native input, and `ref` reaches the input. A Radio has no read-only state, no
 * form state facts and no FormField contract.
 */
export interface RadioProps extends Omit<
  ChoiceBaseProps<RadioState>,
  'name' | 'onCheckedChange' | 'aria-invalid' | 'aria-readonly'
> {
  /**
   * The name that makes radios a group and that `FormData` submits. Give every radio of a group the same one.
   * A radio without it has no group mate and warns in development. Inside a `RadioGroup` it is ignored: the
   * group's name applies.
   *
   * @cckSemantic *.name
   * @remarks A native attribute in React and Vue.
   */
  readonly name?: string | undefined;
  /**
   * Hides the control (native `hidden` on the root).
   *
   * @cckSemantic none
   * @remarks A native attribute in React and Vue; in Angular a `hidden` attribute on the host hides the root.
   */
  readonly hidden?: boolean | undefined;
  /**
   * Called after every change the user makes, from the input's native `change` event, also the uncheck that
   * another radio of the group causes, and after a reset of the owner form; never when the parent sets
   * `checked`. In a group the radio that lost the check reports before the one that gained it. Inside a
   * `RadioGroup` it is never called: the group reports the change.
   *
   * @cckSemantic *.checkedChange
   * @remarks React's change callback; Angular emits `checkedChangeDetails` and Vue emits `checkedChange`.
   */
  readonly onCheckedChange?: ((checked: boolean, details: RadioChangeDetails) => void) | undefined;
}

/** The props the function form of `render` receives for the root of a Radio. */
export type RadioRenderProps = ChoiceRootProps;
