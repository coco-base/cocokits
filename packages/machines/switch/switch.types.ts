import type {
  CheckboxDecorativeProps,
  CheckboxInputProps,
  CheckboxLabelProps,
  CheckboxPartProps,
  CheckboxProps,
  CheckboxRootProps,
} from '../checkbox';
import type { FormFieldControlState } from '../form-field';

/** Inputs of `getSwitchProps`: the Checkbox inputs without `indeterminate`. A missing fact is `false`. */
export type SwitchProps = Omit<CheckboxProps, 'indeterminate'>;

/** Props of the root part: the Checkbox facts without `data-indeterminate`. */
export type SwitchRootProps = Omit<CheckboxRootProps, 'data-indeterminate'>;

/** Props of the native input: a checkbox input with `role="switch"`. */
export interface SwitchInputProps extends CheckboxInputProps {
  /** Always `'switch'`. */
  readonly role: 'switch';
}

/** What `getSwitchProps` returns. */
export interface SwitchParts {
  /** The root props. */
  readonly root: SwitchRootProps;
  /** The native label; it wraps the track and the content. */
  readonly label: CheckboxLabelProps;
  /** The track and hit area. It does not render the input. */
  readonly track: CheckboxPartProps;
  /** The native input. */
  readonly input: SwitchInputProps;
  /** Decorative thumb. */
  readonly thumb: CheckboxDecorativeProps;
  /** Decorative halo. */
  readonly backdrop: CheckboxDecorativeProps;
  /** What the Switch reports to its FormField: the effective id and facts, with `filled` = checked. */
  readonly control: FormFieldControlState;
}
