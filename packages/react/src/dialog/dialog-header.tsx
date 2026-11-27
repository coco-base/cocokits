'use client';

import type { ReactElement } from 'react';
import type { DialogPart, DialogSectionProps } from './dialog.types';
import { useDialogSection } from './use-dialog-section';

function DialogHeaderImpl(props: DialogSectionProps): ReactElement {
  return useDialogSection('header', props);
}

/**
 * The first block of the dialog: the title and the Close button belong here. It has no role, and the theme draws
 * the divider below it. It renders a `<div>` inside `Dialog.Content`.
 *
 * @example
 * <Dialog.Content>
 *   <Dialog.Header>...</Dialog.Header>
 * </Dialog.Content>
 * @cckPart header
 * @param props - The Header props.
 * @returns The rendered div.
 */
export const DialogHeader: DialogPart<DialogSectionProps> = Object.assign(DialogHeaderImpl, {
  displayName: 'Dialog.Header',
});
