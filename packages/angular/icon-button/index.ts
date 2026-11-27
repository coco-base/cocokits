import { CckIconButton } from './icon-button';
import { CckIconButtonAnchor } from './icon-button-anchor';

export { CckIconButton } from './icon-button';
export { CckIconButtonAnchor } from './icon-button-anchor';

/**
 * Everything you need to write an Icon button in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckIconButtonImports]
 */
export const CckIconButtonImports = [CckIconButton, CckIconButtonAnchor] as const;
