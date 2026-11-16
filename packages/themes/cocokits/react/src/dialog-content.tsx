'use client';

import { useContext, type ReactElement } from 'react';
import { Dialog as BaseDialog, type DialogContentProps } from '@cocokits/react/dialog';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import { DialogThemeContext } from './theme-contexts';

function ThemedDialogContent(props: DialogContentProps): ReactElement {
  const root = useContext(DialogThemeContext); // a portal keeps the context
  return (
    <ThemeOptionsProvider componentName="dialog" options={{ size: root.size }}>
      <BaseDialog.Content {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Dialog.Content} component and its `displayName`. */
export interface DialogContentComponent {
  (props: DialogContentProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Dialog content. It renders the base content and supplies the `size` of its `Dialog.Root` to it, which
 * renders `data-size` on the window. The option resolves in order: the `size` of the root, then the `ThemeProvider`
 * override, then the config default; `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <Dialog.Content><Dialog.Title>Delete project</Dialog.Title></Dialog.Content>
 * @cckPart content
 */
export const DialogContent: DialogContentComponent = Object.assign(ThemedDialogContent, {
  displayName: 'Dialog.Content',
});
