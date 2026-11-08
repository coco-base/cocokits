import { CckTabNavLink } from './tab-nav-link';
import { CckTabNavPanel } from './tab-nav-panel';
import { CckTabNav } from './tab-nav';

export { CckTabNav } from './tab-nav';
export { CckTabNavLink } from './tab-nav-link';
export { CckTabNavPanel } from './tab-nav-panel';

/**
 * Everything you need to write a Tab nav in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckTabNavImports]
 */
export const CckTabNavImports = [CckTabNav, CckTabNavLink, CckTabNavPanel] as const;
