import { CckCheckbox } from './checkbox';

export { CckCheckbox } from './checkbox';
export type { CheckboxChangeDetails, CheckboxChangeReason } from './checkbox';
export { CckCheckControlBase } from './check-control-base';
export type { CheckControlChangeDetails, CheckControlChangeReason, CheckControlParts } from './check-control-base';

/**
 * Everything you need to write a Checkbox in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckCheckboxImports]
 */
export const CckCheckboxImports = [CckCheckbox] as const;
