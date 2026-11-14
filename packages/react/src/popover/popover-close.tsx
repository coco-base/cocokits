'use client';

import { isValidElement, type MouseEvent, type ReactElement, type Ref } from 'react';
import { popoverAnatomy, getPopoverProps } from '@cocokits/machines/popover';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { nonNativeButtonProps, useElementKind } from '../internal/button-kind';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { usePopoverContext } from './popover-context';
import type { PopoverCloseProps, PopoverPart, PopoverRenderProps, PopoverState } from './popover.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function PopoverCloseImpl({ render, nativeButton = true, ref, ...rest }: PopoverCloseProps): ReactElement {
  const context = usePopoverContext('Popover.Close');
  const themeAttrs = useThemeAttrs(popoverAnatomy).close;
  const { close } = getPopoverProps({ id: context.id, open: context.open, mounted: context.mounted }, context.dispatch);
  const machineProps = withoutReserved(toReactProps(close), nativeButton ? ['onClick'] : ['onClick', 'type']);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useElementKind(
    'Popover.Close',
    nativeButton,
    useMergedRef<HTMLElement>(ref, elementRef, undefined),
  );

  const ours = {
    ...themeAttrs,
    ...machineProps,
    ...(nativeButton ? {} : nonNativeButtonProps()),
    onClick: (event: MouseEvent<HTMLElement>) => {
      close.onClick(event.nativeEvent);
    },
    ref: mergedRef,
  };
  const props = mergeProps(ours, rest) as unknown as PopoverRenderProps;
  return renderElement<PopoverRenderProps, PopoverState>(render, 'button', props, { open: context.open });
}

/**
 * A button that closes the popover. It renders a `<button type="button">`; put it inside the content. Native button
 * props pass through, and `ref` reaches the element.
 *
 * A Close button with only an icon needs `aria-label` or `aria-labelledby`.
 *
 * To render another element or component, use `render`. An element that is not a `<button>` also needs
 * `nativeButton={false}`.
 *
 * @example
 * <Popover.Close>Done</Popover.Close>
 * @cckPart close
 * @param props - The Close props.
 * @returns The rendered element.
 */
export const PopoverClose: PopoverPart<PopoverCloseProps> = Object.assign(PopoverCloseImpl, {
  displayName: 'Popover.Close',
});
