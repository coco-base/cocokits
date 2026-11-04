import { CckPopover } from './popover';
import { CckPopoverAnchor } from './popover-anchor';
import { CckPopoverArrow } from './popover-arrow';
import { CckPopoverClose } from './popover-close';
import { CckPopoverContent } from './popover-content';
import { CckPopoverDescription } from './popover-description';
import { CckPopoverPortal } from './popover-portal';
import { CckPopoverTitle } from './popover-title';
import { CckPopoverTrigger } from './popover-trigger';

export { CckPopover } from './popover';
export type { PopoverChangeDetails, PopoverOpenChangeReason } from './popover';
export { CckPopoverAnchor } from './popover-anchor';
export { CckPopoverArrow } from './popover-arrow';
export { CckPopoverClose } from './popover-close';
export { CckPopoverContent } from './popover-content';
export { CckPopoverDescription } from './popover-description';
export { CCK_POPOVER_DEFAULT_OPTIONS } from './popover-default-options';
export type { CckPopoverDefaultOptions } from './popover-default-options';
export { CckPopoverPortal } from './popover-portal';
export { CckPopoverTitle } from './popover-title';
export { CckPopoverTrigger } from './popover-trigger';

/** Everything needed to author a Popover: `imports: [CckPopoverImports]`. */
export const CckPopoverImports = [
  CckPopover,
  CckPopoverTrigger,
  CckPopoverAnchor,
  CckPopoverPortal,
  CckPopoverContent,
  CckPopoverArrow,
  CckPopoverTitle,
  CckPopoverDescription,
  CckPopoverClose,
] as const;
