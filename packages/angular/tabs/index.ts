import { CckTab } from './tab';
import { CckTabContent } from './tab-content';
import { CckTabLabel } from './tab-label';
import { CckTabs } from './tabs';

export { CckTabs } from './tabs';
export type { CckTabChangeEvent } from './tabs';
export { CckTab } from './tab';
export { CckTabLabel } from './tab-label';
export { CckTabContent } from './tab-content';
export { CCK_TABS_CONFIG } from './tabs-config';
export type { CckTabsConfig } from './tabs-config';

/**
 * Everything you need to write Tabs in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckTabsImports]
 */
export const CckTabsImports = [CckTabs, CckTab, CckTabLabel, CckTabContent] as const;
