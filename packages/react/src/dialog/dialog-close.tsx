'use client';

import { isValidElement, type MouseEvent, type ReactElement, type Ref } from 'react';
import { dialogAnatomy, getDialogProps } from '@cocokits/machines/dialog';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { nonNativeButtonProps, useElementKind } from '../internal/button-kind';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { useDialogContext } from './dialog-context';
import type { DialogCloseProps, DialogPart, DialogRenderProps, DialogState } from './dialog.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function DialogCloseImpl({ render, nativeButton = true, ref, ...rest }: DialogCloseProps): ReactElement {
  const context = useDialogContext('Dialog.Close');
  const themeAttrs = useThemeAttrs(dialogAnatomy).close;
  const { close } = getDialogProps({ id: context.id, open: context.open, mounted: context.mounted }, context.dispatch);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useElementKind('Dialog.Close', nativeButton, useMergedRef<HTMLElement>(ref, elementRef, undefined));

  const ours = {
    ...themeAttrs,
    ...toReactProps({ class: close.class, ...(nativeButton ? { type: close.type } : {}) }),
    ...(nativeButton ? {} : nonNativeButtonProps()),
    onClick: (event: MouseEvent<HTMLElement>) => {
      close.onClick(event.nativeEvent);
    },
    ref: mergedRef,
  };
  const props = mergeProps(ours, rest) as unknown as DialogRenderProps;
  return renderElement<DialogRenderProps, DialogState>(render, 'button', props, { open: context.open });
}

/**
 * A button that closes the dialog. It renders a `<button type="button">`; put it inside the content. Native button
 * props pass through, and `ref` reaches the element.
 *
 * To render another element or component, use `render`. An element that is not a `<button>` also needs
 * `nativeButton={false}`.
 *
 * @example
 * <Dialog.Close>Cancel</Dialog.Close>
 * @cckPart close
 * @param props - The Close props.
 * @returns The rendered element.
 */
export const DialogClose: DialogPart<DialogCloseProps> = Object.assign(DialogCloseImpl, {
  displayName: 'Dialog.Close',
});
