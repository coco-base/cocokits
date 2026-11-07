import { CckButton } from './button';
import { CckButtonAnchor } from './button-anchor';

export { CckButton } from './button';
export { CckButtonAnchor } from './button-anchor';

/**
 * Everything you need to write a Button in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckButtonImports]
 */
export const CckButtonImports = [CckButton, CckButtonAnchor] as const;
