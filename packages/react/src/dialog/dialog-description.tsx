'use client';

import { isValidElement, type ReactElement, type Ref } from 'react';
import { dialogAnatomy, getDialogProps } from '@cocokits/machines/dialog';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { useDialogContext } from './dialog-context';
import type { DialogDescriptionProps, DialogPart, DialogRenderProps, DialogState } from './dialog.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function DialogDescriptionImpl({ render, ref, ...rest }: DialogDescriptionProps): ReactElement {
  const context = useDialogContext('Dialog.Description');
  const { countDescription } = context;
  const themeAttrs = useThemeAttrs(dialogAnatomy).description;
  const { description } = getDialogProps({ id: context.id, open: context.open }, context.dispatch);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);

  // The content is described by the Description while it is mounted.
  useIsomorphicLayoutEffect(() => {
    countDescription(1);
    return () => {
      countDescription(-1);
    };
  }, [countDescription]);

  const ours = { ...themeAttrs, ...toReactProps(description), ref: mergedRef };
  const props = mergeProps(ours, withoutReserved(rest, ['id'])) as unknown as DialogRenderProps;
  return renderElement<DialogRenderProps, DialogState>(render, 'p', props, { open: context.open });
}

/**
 * The text that describes the dialog. It renders a `<p>`, which the content points to with `aria-describedby`
 * while the description is mounted.
 *
 * @example
 * <Dialog.Description>You cannot undo this.</Dialog.Description>
 * @cckPart description
 * @param props - The Description props.
 * @returns The rendered element.
 */
export const DialogDescription: DialogPart<DialogDescriptionProps> = Object.assign(DialogDescriptionImpl, {
  displayName: 'Dialog.Description',
});
