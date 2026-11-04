import { CckTabNavLink } from './tab-nav-link';
import { CckTabNavPanel } from './tab-nav-panel';
import { CckTabNav } from './tab-nav';

export { CckTabNav } from './tab-nav';
export { CckTabNavLink } from './tab-nav-link';
export { CckTabNavPanel } from './tab-nav-panel';

/** Everything needed to author TabNav: `imports: [CckTabNavImports]`. */
export const CckTabNavImports = [CckTabNav, CckTabNavLink, CckTabNavPanel] as const;
