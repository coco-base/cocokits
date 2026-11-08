'use client';

import { isValidElement, type ReactElement, type Ref } from 'react';
import { accordionAnatomy } from '@cocokits/machines/accordion';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { useAccordionContext, useAccordionItemContext } from './accordion-context';
import type { AccordionContentProps, AccordionItemState, AccordionPart, AccordionRenderProps } from './accordion.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes that state the item; a consumer value can never replace them. */
const RESERVED = ['id', 'role', 'aria-labelledby', 'hidden', 'data-state', 'data-disabled', 'data-orientation'];

function AccordionContentImpl({
  forceMount = false,
  render,
  ref,
  children,
  ...rest
}: AccordionContentProps): ReactElement | null {
  const root = useAccordionContext('Accordion.Content');
  const item = useAccordionItemContext('Accordion.Content');
  const themeAttrs = useThemeAttrs(accordionAnatomy).content;
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, item.contentRef);

  // The trigger points `aria-controls` at this element while it is rendered, also when force-mounted and closed.
  const { setForceMounted } = item;
  useIsomorphicLayoutEffect(() => {
    setForceMounted(forceMount);
    return () => {
      setForceMounted(false);
    };
  }, [forceMount, setForceMounted]);

  if (!item.present && !forceMount) return null;
  const ours = { ...themeAttrs, ...toReactProps(item.parts.content), ref: mergedRef };
  const props = mergeProps(ours, { ...withoutReserved(rest, RESERVED), children }) as unknown as AccordionRenderProps;
  return renderElement<AccordionRenderProps, AccordionItemState>(render, 'div', props, {
    open: item.open,
    disabled: item.disabled,
    orientation: root.orientation,
  });
}

/**
 * The body of one item. It renders a `<div role="region">` that its trigger names. Native `div` props pass through,
 * and `ref` reaches the element.
 *
 * Closed content is not rendered. With `forceMount`, it stays rendered with the native `hidden` attribute.
 *
 * After mount, it sets `--accordion-content-height` and `--accordion-content-width` for the open and close
 * animation. It stays rendered until the close animation has finished.
 *
 * @example
 * <Accordion.Content>Orders leave in two days.</Accordion.Content>
 * @cckPart content
 * @param props - The Content props.
 * @returns The rendered element, or nothing while the item is closed.
 */
export const AccordionContent: AccordionPart<AccordionContentProps> = Object.assign(AccordionContentImpl, {
  displayName: 'Accordion.Content',
});
