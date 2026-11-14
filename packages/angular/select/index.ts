import { CckSelect } from './select';
import { CckSelectOption } from './select-option';
import { CckSelectOptionGroup, CckSelectOptionGroupLabel } from './select-option-group';
import { CckSelectSeparator } from './select-separator';
import { CckSelectTrigger } from './select-trigger';

export { CckSelect } from './select';
export type { CckSelectChange } from './select';
export { CCK_SELECT_CONFIG } from './select-types';
export type {
  CckSelectConfig,
  CckSelectItem,
  CckSelectOptionRef,
  SelectOpenChangeDetails,
  SelectOpenChangeReason,
  SelectTriggerContext,
  SelectValueChangeReason,
} from './select-types';
export { CckSelectOption } from './select-option';
export { CckSelectOptionGroup, CckSelectOptionGroupLabel } from './select-option-group';
export { CckSelectSeparator } from './select-separator';
export { CckSelectTrigger } from './select-trigger';

/**
 * Everything you need to write a Select in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckSelectImports]
 */
export const CckSelectImports = [
  CckSelect,
  CckSelectOption,
  CckSelectOptionGroup,
  CckSelectOptionGroupLabel,
  CckSelectSeparator,
  CckSelectTrigger,
] as const;
