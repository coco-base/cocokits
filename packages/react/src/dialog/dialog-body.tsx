'use client';

import type { ReactElement } from 'react';
import type { DialogPart, DialogSectionProps } from './dialog.types';
import { useDialogSection } from './use-dialog-section';

function DialogBodyImpl(props: DialogSectionProps): ReactElement {
  return useDialogSection('body', props);
}

/**
 * The middle block of the dialog: the content that scrolls. It has no role. It renders a `<div>` inside
 * `Dialog.Content`.
 *
 * @example
 * <Dialog.Content>
 *   <Dialog.Body>...</Dialog.Body>
 * </Dialog.Content>
 * @cckPart body
 * @param props - The Body props.
 * @returns The rendered div.
 */
export const DialogBody: DialogPart<DialogSectionProps> = Object.assign(DialogBodyImpl, {
  displayName: 'Dialog.Body',
});
