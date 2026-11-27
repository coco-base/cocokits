import { CckTextarea } from './textarea';

export { CckTextarea } from './textarea';
export type { TextareaChangeDetails, TextareaChangeReason } from './textarea';

/**
 * Everything you need to write a Textarea in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckTextareaImports]
 */
export const CckTextareaImports = [CckTextarea] as const;
