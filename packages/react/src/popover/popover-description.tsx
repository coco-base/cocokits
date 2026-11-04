'use client';

import { isValidElement, type ReactElement, type Ref } from 'react';
import { popoverAnatomy, getPopoverProps } from '@cocokits/machines/popover';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { usePopoverContext } from './popover-context';
import type { PopoverDescriptionProps, PopoverPart, PopoverRenderProps, PopoverState } from './popover.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function PopoverDescriptionImpl({ render, ref, ...rest }: PopoverDescriptionProps): ReactElement {
  const context = usePopoverContext('Popover.Description');
  const { countDescription } = context;
  const themeAttrs = useThemeAttrs(popoverAnatomy).description;
  const { description } = getPopoverProps({ id: context.id, open: context.open }, context.dispatch);
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
  const props = mergeProps(ours, withoutReserved(rest, ['id'])) as unknown as PopoverRenderProps;
  return renderElement<PopoverRenderProps, PopoverState>(render, 'p', props, { open: context.open });
}

/**
 * Renders the `<p>` that describes the popover; the content refers to it with `aria-describedby` while it is
 * mounted.
 *
 * @example
 * <Popover.Description>Anyone with the link can view.</Popover.Description>
 * @cckPart description
 * @param props - The Description props.
 * @returns The rendered element.
 */
export const PopoverDescription: PopoverPart<PopoverDescriptionProps> = Object.assign(PopoverDescriptionImpl, {
  displayName: 'Popover.Description',
});
