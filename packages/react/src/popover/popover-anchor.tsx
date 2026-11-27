'use client';

import { isValidElement, useState, type ReactElement, type Ref } from 'react';
import { getPopoverProps, popoverAnatomy } from '@cocokits/machines/popover';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { usePopoverContext } from './popover-context';
import type { PopoverAnchorProps, PopoverPart, PopoverRenderProps, PopoverState } from './popover.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function PopoverAnchorImpl({ render, virtualRef, ref, ...rest }: PopoverAnchorProps): ReactElement | null {
  const context = usePopoverContext('Popover.Anchor');
  const { registerAnchor } = context;
  const themeAttrs = useThemeAttrs(popoverAnatomy).anchor;
  const { anchor } = getPopoverProps(
    { id: context.id, open: context.open, mounted: context.mounted },
    context.dispatch,
  );
  const [element, setElement] = useState<HTMLElement | null>(null);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, setElement);

  // The content is placed against the Anchor instead of the trigger while it is mounted.
  useIsomorphicLayoutEffect(() => {
    if (virtualRef) return registerAnchor(() => virtualRef.current);
    if (element) return registerAnchor(() => element);
    return undefined;
  }, [registerAnchor, virtualRef, element]);

  // A virtual reference stands in for the element: nothing is rendered.
  if (virtualRef) return null;
  const ours = { ...themeAttrs, ...toReactProps(anchor), ref: mergedRef };
  const props = mergeProps(ours, rest) as unknown as PopoverRenderProps;
  return renderElement<PopoverRenderProps, PopoverState>(render, 'div', props, { open: context.open });
}

/**
 * The element that the content lines up with, in place of the trigger. It renders a `<div>` with no role and no
 * ARIA. The trigger keeps `aria-expanded`, and the focus still returns to it.
 *
 * With `virtualRef`, it renders nothing, and the content lines up with the object that the ref holds. Only one
 * Anchor counts: the last one mounted.
 *
 * @example
 * <Popover.Anchor>
 *   <input aria-label="City" />
 *   <Popover.Trigger>Pick</Popover.Trigger>
 * </Popover.Anchor>
 * @cckPart anchor
 * @param props - The Anchor props.
 * @returns The rendered element, or nothing with `virtualRef`.
 */
export const PopoverAnchor: PopoverPart<PopoverAnchorProps, ReactElement | null> = Object.assign(PopoverAnchorImpl, {
  displayName: 'Popover.Anchor',
});
