'use client';

import { isValidElement, type ReactElement, type Ref } from 'react';
import { popoverAnatomy, getPopoverProps } from '@cocokits/machines/popover';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { usePopoverContext } from './popover-context';
import type { PopoverPart, PopoverRenderProps, PopoverState, PopoverTitleProps } from './popover.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function PopoverTitleImpl({ render, ref, ...rest }: PopoverTitleProps): ReactElement {
  const context = usePopoverContext('Popover.Title');
  const { countTitle } = context;
  const themeAttrs = useThemeAttrs(popoverAnatomy).title;
  const { title } = getPopoverProps({ id: context.id, open: context.open }, context.dispatch);
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
  const props = mergeProps(ours, withoutReserved(rest, ['id'])) as unknown as PopoverRenderProps;
  return renderElement<PopoverRenderProps, PopoverState>(render, 'h2', props, { open: context.open });
}

/**
 * The title that names the popover. It renders an `<h2>`, and the content points to it with `aria-labelledby` while
 * it is mounted. Pass `render={<h3 />}` for another heading level.
 *
 * @example
 * <Popover.Title>Share this page</Popover.Title>
 * @cckPart title
 * @param props - The Title props.
 * @returns The rendered element.
 */
export const PopoverTitle: PopoverPart<PopoverTitleProps> = Object.assign(PopoverTitleImpl, {
  displayName: 'Popover.Title',
});
