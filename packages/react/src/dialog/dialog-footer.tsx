'use client';

import type { ReactElement } from 'react';
import type { DialogPart, DialogSectionProps } from './dialog.types';
import { useDialogSection } from './use-dialog-section';

function DialogFooterImpl(props: DialogSectionProps): ReactElement {
  return useDialogSection('footer', props);
}

/**
 * The last block of the dialog: the actions, such as the Cancel and Confirm buttons. It has no role, and the theme
 * puts the buttons in one row. It renders a `<div>` inside `Dialog.Content`.
 *
 * @example
 * <Dialog.Content>
 *   <Dialog.Footer>...</Dialog.Footer>
 * </Dialog.Content>
 * @cckPart footer
 * @param props - The Footer props.
 * @returns The rendered div.
 */
export const DialogFooter: DialogPart<DialogSectionProps> = Object.assign(DialogFooterImpl, {
  displayName: 'Dialog.Footer',
});
