import { CckRadioGroup } from './radio-group';

export { CckRadioGroup } from './radio-group';
export type {
  CckRadioGroupRegistration,
  RadioGroupChangeDetails,
  RadioGroupChangeReason,
  RadioGroupOrientation,
} from './radio-group';

/** Everything needed to author a Radio group: `imports: [CckRadioGroupImports]`. Add `CckRadioImports` for the radios. */
export const CckRadioGroupImports = [CckRadioGroup] as const;
