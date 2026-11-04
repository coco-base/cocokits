import { CckTextarea } from './textarea';

export { CckTextarea } from './textarea';
export type { TextareaChangeDetails, TextareaChangeReason } from './textarea';

/** Everything needed to author a Textarea: `imports: [CckTextareaImports]`. */
export const CckTextareaImports = [CckTextarea] as const;
