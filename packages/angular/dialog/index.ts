import { CckDialogRoot } from './dialog-root';
import { CckDialogBody } from './dialog-body';
import { CckDialogClose } from './dialog-close';
import { CckDialogContent } from './dialog-content';
import { CckDialogDescription } from './dialog-description';
import { CckDialogFooter } from './dialog-footer';
import { CckDialogHeader } from './dialog-header';
import { CckDialogTitle } from './dialog-title';
import { CckDialogTrigger } from './dialog-trigger';

export { CckDialog } from './dialog';
export { CCK_DIALOG_DEFAULT_OPTIONS, CckDialogConfig } from './dialog-config';
export type { CckDialogAutoFocus, CckDialogRestoreFocus, CckDialogRole } from './dialog-config';
export { CckDialogRoot } from './dialog-root';
export type { DialogChangeDetails, DialogOpenChangeReason } from './dialog-root';
export { CckDialogBody } from './dialog-body';
export { CckDialogClose } from './dialog-close';
export { CckDialogContent } from './dialog-content';
export { CckDialogDescription } from './dialog-description';
export { CckDialogFooter } from './dialog-footer';
export { CckDialogHeader } from './dialog-header';
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
  CckDialogContent,
  CckDialogTitle,
  CckDialogDescription,
  CckDialogClose,
  CckDialogHeader,
  CckDialogBody,
  CckDialogFooter,
] as const;
