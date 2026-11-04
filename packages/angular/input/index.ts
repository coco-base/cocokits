import { CckInput } from './input';

export { CckInput } from './input';
export type { InputChangeDetails, InputChangeReason } from './input';
export { CckTextControlBase } from './text-control-base';

/** Everything needed to author an Input: `imports: [CckInputImports]`. */
export const CckInputImports = [CckInput] as const;
