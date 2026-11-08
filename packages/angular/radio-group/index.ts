import { CckRadioGroup } from './radio-group';

export { CckRadioGroup } from './radio-group';
export type {
  CckRadioGroupRegistration,
  RadioGroupChangeDetails,
  RadioGroupChangeReason,
  RadioGroupOrientation,
} from './radio-group';

/**
 * Everything you need to write a Radio group in a template. Add it to the `imports` of your component. Add `CckRadioImports` for the radios too.
 * @example
 * imports: [CckRadioGroupImports, CckRadioImports]
 */
export const CckRadioGroupImports = [CckRadioGroup] as const;
