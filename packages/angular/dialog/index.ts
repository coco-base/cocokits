import { CckDialogRoot } from './dialog-root';
import { CckDialogClose } from './dialog-close';
import { CckDialogContent } from './dialog-content';
import { CckDialogDescription } from './dialog-description';
import { CckDialogPortal } from './dialog-portal';
import { CckDialogTitle } from './dialog-title';
import { CckDialogTrigger } from './dialog-trigger';

export { CckDialog } from './dialog';
export { CCK_DIALOG_DEFAULT_OPTIONS, CckDialogConfig } from './dialog-config';
export type { CckDialogAutoFocus, CckDialogRestoreFocus, CckDialogRole } from './dialog-config';
export { CckDialogRoot } from './dialog-root';
export type { DialogChangeDetails, DialogOpenChangeReason } from './dialog-root';
export { CckDialogClose } from './dialog-close';
export { CckDialogContent } from './dialog-content';
export { CckDialogDescription } from './dialog-description';
export { CckDialogPortal } from './dialog-portal';
export { CCK_DIALOG_DATA, CckDialogRef } from './dialog-ref';
export type { CckDialogState } from './dialog-ref';
export { CckDialogTitle } from './dialog-title';
export { CckDialogTrigger } from './dialog-trigger';

/**
 * Everything you need to write a Dialog in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckDialogImports]
 */
export const CckDialogImports = [
  CckDialogRoot,
  CckDialogTrigger,
  CckDialogPortal,
  CckDialogContent,
  CckDialogTitle,
  CckDialogDescription,
  CckDialogClose,
] as const;
