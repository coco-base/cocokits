import { CckMenu } from './menu';
import { CckMenuContent } from './menu-content';
import { CckMenuItem } from './menu-item';
import { CckMenuPortal } from './menu-portal';
import { CckMenuTrigger } from './menu-trigger';

export { CckMenu } from './menu';
export type { MenuChangeDetails, MenuOpenChangeReason } from './menu';
export { CckMenuContent } from './menu-content';
export { CckMenuItem } from './menu-item';
export { CckMenuPortal } from './menu-portal';
export { CckMenuTrigger } from './menu-trigger';

/**
 * Everything you need to write a Menu in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckMenuImports]
 */
export const CckMenuImports = [CckMenu, CckMenuTrigger, CckMenuPortal, CckMenuContent, CckMenuItem] as const;
