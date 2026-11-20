import { CckMenu } from './menu';
import { CckMenuCheckboxItem } from './menu-checkbox-item';
import { CckMenuContent } from './menu-content';
import { CckMenuGroup, CckMenuGroupLabel, CckMenuRadioGroup } from './menu-group';
import { CckMenuItem } from './menu-item';
import {
  CckMenuItemIndicator,
  CckMenuItemLeading,
  CckMenuItemShortcut,
  CckMenuItemSupportingText,
  CckMenuItemTrailing,
} from './menu-item-parts';
import { CckMenuPortal } from './menu-portal';
import { CckMenuRadioItem } from './menu-radio-item';
import { CckMenuSub } from './menu-sub';
import { CckMenuSubContent } from './menu-sub-content';
import { CckMenuSubTrigger } from './menu-sub-trigger';
import { CckMenuTrigger } from './menu-trigger';

export { CckMenu } from './menu';
export type { MenuChangeDetails, MenuOpenChangeReason } from './menu';
export { CckMenuCheckboxItem } from './menu-checkbox-item';
export type { MenuCheckboxItemChangeDetails, MenuCheckboxItemChangeReason } from './menu-checkbox-item';
export { CckMenuContent } from './menu-content';
export { CckMenuGroup, CckMenuGroupLabel, CckMenuRadioGroup } from './menu-group';
export type { MenuRadioGroupChangeDetails, MenuRadioGroupChangeReason } from './menu-group';
export { CckMenuItem } from './menu-item';
export {
  CckMenuItemIndicator,
  CckMenuItemLeading,
  CckMenuItemShortcut,
  CckMenuItemSupportingText,
  CckMenuItemTrailing,
} from './menu-item-parts';
export { CckMenuPortal } from './menu-portal';
export { CckMenuRadioItem } from './menu-radio-item';
export { CckMenuSub } from './menu-sub';
export { CckMenuSubContent } from './menu-sub-content';
export { CckMenuSubTrigger } from './menu-sub-trigger';
export { CckMenuTrigger } from './menu-trigger';

/**
 * Everything you need to write a Menu in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckMenuImports]
 */
export const CckMenuImports = [
  CckMenu,
  CckMenuTrigger,
  CckMenuPortal,
  CckMenuContent,
  CckMenuItem,
  CckMenuCheckboxItem,
  CckMenuRadioGroup,
  CckMenuRadioItem,
  CckMenuItemIndicator,
  CckMenuItemLeading,
  CckMenuItemTrailing,
  CckMenuItemSupportingText,
  CckMenuItemShortcut,
  CckMenuGroup,
  CckMenuGroupLabel,
  CckMenuSub,
  CckMenuSubTrigger,
  CckMenuSubContent,
] as const;
