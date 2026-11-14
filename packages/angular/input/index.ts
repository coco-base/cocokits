import { CckInput } from './input';

export { CckInput } from './input';
export type { InputChangeDetails, InputChangeReason } from './input';
export { CckTextControlBase } from './text-control-base';

/**
 * Everything you need to write an Input in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckInputImports]
 */
export const CckInputImports = [CckInput] as const;
