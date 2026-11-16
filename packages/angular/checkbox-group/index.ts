import { CckCheckboxGroup } from './checkbox-group';

export { CckCheckboxGroup } from './checkbox-group';
export type { CheckboxGroupChangeDetails, CheckboxGroupChangeReason, CheckboxGroupOrientation } from './checkbox-group';

/**
 * Everything you need to write a Checkbox group in a template. Add it to the `imports` of your component, with the checkboxes.
 * @example
 * imports: [CckCheckboxGroupImports, CckCheckboxImports]
 */
export const CckCheckboxGroupImports = [CckCheckboxGroup] as const;
