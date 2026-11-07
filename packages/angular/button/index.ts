import { CckButton } from './button';
import { CckButtonAnchor } from './button-anchor';

export { CckButton } from './button';
export { CckButtonAnchor } from './button-anchor';

/** Everything needed to author a Button: `imports: [CckButtonImports]`. */
export const CckButtonImports = [CckButton, CckButtonAnchor] as const;
