import { CckRadio } from './radio';

export { CckRadio } from './radio';
export type { RadioChangeDetails, RadioChangeReason } from './radio';

/**
 * Everything you need to write a Radio in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckRadioImports]
 */
export const CckRadioImports = [CckRadio] as const;
