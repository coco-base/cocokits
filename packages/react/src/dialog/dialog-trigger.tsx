'use client';

import { isValidElement, type MouseEvent, type ReactElement, type Ref } from 'react';
import { dialogAnatomy, getDialogProps } from '@cocokits/machines/dialog';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { nonNativeButtonProps, useElementKind } from '../internal/button-kind';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { useDialogContext } from './dialog-context';
import type { DialogPart, DialogRenderProps, DialogState, DialogTriggerProps } from './dialog.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes that state the open state; a consumer value can never replace them. */
const RESERVED = ['aria-expanded', 'aria-controls', 'aria-haspopup', 'data-state'];

function DialogTriggerImpl({ render, nativeButton = true, ref, ...rest }: DialogTriggerProps): ReactElement {
  const context = useDialogContext('Dialog.Trigger');
  const themeAttrs = useThemeAttrs(dialogAnatomy).trigger;
  const { trigger } = getDialogProps(
    { id: context.id, open: context.open, mounted: context.mounted },
    context.dispatch,
  );
  const machineProps = withoutReserved(toReactProps(trigger), nativeButton ? ['onClick'] : ['onClick', 'type']);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useElementKind(
    'Dialog.Trigger',
    nativeButton,
    useMergedRef<HTMLElement>(ref, elementRef, context.setTrigger),
  );

  const ours = {
    ...themeAttrs,
    ...machineProps,
    ...(nativeButton ? {} : nonNativeButtonProps()),
    onClick: (event: MouseEvent<HTMLElement>) => {
      // A dialog that is not modal leaves the trigger usable while it is open: a press toggles it.
      if (!context.modal && context.open) {
        if (!event.nativeEvent.defaultPrevented) context.dispatch({ type: 'CLOSE.CLICK', event: event.nativeEvent });
        return;
      }
      trigger.onClick(event.nativeEvent);
    },
    ref: mergedRef,
  };
  const props = mergeProps(ours, withoutReserved(rest, RESERVED)) as unknown as DialogRenderProps;
  return renderElement<DialogRenderProps, DialogState>(render, 'button', props, { open: context.open });
}

/**
 * The button that opens the dialog. It renders a `<button type="button">` with `aria-haspopup="dialog"` and
 * `aria-expanded`. Native button props pass through, and `ref` reaches the element.
 *
 * It has `aria-controls` while the content is mounted. When the Root is not `modal`, it also closes the dialog.
 *
 * To render another element or component, use `render`. An element that is not a `<button>` also needs
 * `nativeButton={false}`.
 *
 * @example
 * <Dialog.Trigger>Delete project</Dialog.Trigger>
 * @cckPart trigger
 * @param props - The Trigger props.
 * @returns The rendered element.
 */
export const DialogTrigger: DialogPart<DialogTriggerProps> = Object.assign(DialogTriggerImpl, {
  displayName: 'Dialog.Trigger',
});
