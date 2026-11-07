'use client';

import { isValidElement, type ReactElement, type Ref } from 'react';
import { dialogAnatomy, getDialogProps } from '@cocokits/machines/dialog';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { useDialogContext } from './dialog-context';
import type { DialogPart, DialogRenderProps, DialogState, DialogTitleProps } from './dialog.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function DialogTitleImpl({ render, ref, ...rest }: DialogTitleProps): ReactElement {
  const context = useDialogContext('Dialog.Title');
  const { countTitle } = context;
  const themeAttrs = useThemeAttrs(dialogAnatomy).title;
  const { title } = getDialogProps({ id: context.id, open: context.open }, context.dispatch);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);

  // The content is labelled by the Title while it is mounted.
  useIsomorphicLayoutEffect(() => {
    countTitle(1);
    return () => {
      countTitle(-1);
    };
  }, [countTitle]);

  const ours = { ...themeAttrs, ...toReactProps(title), ref: mergedRef };
  const props = mergeProps(ours, withoutReserved(rest, ['id'])) as unknown as DialogRenderProps;
  return renderElement<DialogRenderProps, DialogState>(render, 'h2', props, { open: context.open });
}

/**
 * The title that names the dialog. It renders an `<h2>`, and the content points to it with `aria-labelledby` while
 * it is mounted. Pass `render={<h3 />}` for another heading level.
 *
 * @example
 * <Dialog.Title>Delete project</Dialog.Title>
 * @cckPart title
 * @param props - The Title props.
 * @returns The rendered element.
 */
export const DialogTitle: DialogPart<DialogTitleProps> = Object.assign(DialogTitleImpl, {
  displayName: 'Dialog.Title',
});
