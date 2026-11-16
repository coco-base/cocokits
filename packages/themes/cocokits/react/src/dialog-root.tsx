'use client';

import { useMemo, type ReactElement } from 'react';
import { Dialog as BaseDialog, type DialogRootProps as BaseDialogRootProps } from '@cocokits/react/dialog';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { DialogThemeContext } from './theme-contexts';

type DialogOptions = CocokitsThemeConfig['components']['dialog'];

/** The `size` values of the cocokits theme. */
export type DialogSize = DialogOptions['size']['values'][number];

/** Props of the themed {@link Dialog.Root}: the base props plus the cocokits `size`. */
export interface DialogRootProps extends BaseDialogRootProps {
  /**
   * Width, padding and gap of the window, drawn on the content. The `Dialog.Content` of this dialog reads it.
   */
  readonly size?: DialogSize | null | undefined;
}

function ThemedDialogRoot({ size, ...props }: DialogRootProps): ReactElement {
  const parent = useMemo(() => ({ size }), [size]);
  return (
    <DialogThemeContext value={parent}>
      <BaseDialog.Root {...props} />
    </DialogThemeContext>
  );
}

/** The themed {@link Dialog.Root} component and its `displayName`. */
export interface DialogRootComponent {
  (props: DialogRootProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Dialog root. It renders the base root and keeps `size` for its `Dialog.Content`, which draws it. It
 * renders no element and no attribute itself. The option resolves in order: the prop, then the `ThemeProvider`
 * override, then the config default; `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <Dialog.Root size="lg">
 *   <Dialog.Trigger>Open</Dialog.Trigger>
 *   <Dialog.Content><Dialog.Title>Delete project</Dialog.Title></Dialog.Content>
 * </Dialog.Root>
 * @cckPart root
 */
export const DialogRoot: DialogRootComponent = Object.assign(ThemedDialogRoot, { displayName: 'Dialog.Root' });
