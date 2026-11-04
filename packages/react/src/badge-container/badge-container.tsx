'use client';

import { cloneElement, isValidElement, type ReactElement, type Ref } from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { badgeContainerAnatomy, getBadgeContainerProps } from '@cocokits/machines/badge-container';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import type { BadgeContainerProps, BadgeContainerRenderProps, BadgeContainerState } from './badge-container.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function BadgeContainerImpl({ position, render, ref, children, ...rest }: BadgeContainerProps): ReactElement {
  const parts = getBadgeContainerProps({ position });
  const themeAttrs = useThemeAttrs(badgeContainerAnatomy);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const props = mergeProps(
    {
      ...themeAttrs.root,
      ...toReactProps(parts.root),
      ref: mergedRef,
      children,
    },
    rest,
  ) as unknown as BadgeContainerRenderProps;
  // The part's children win over the element's own: the container renders the children it is given.
  const element = isValidElement<{ children?: undefined }>(render)
    ? cloneElement(render, { children: undefined })
    : render;
  return renderElement<BadgeContainerRenderProps, BadgeContainerState>(element, 'div', props, {
    position: parts.root['data-position'],
  });
}

/** The {@link BadgeContainer} component and its `displayName`. */
interface BadgeContainerComponent {
  (props: BadgeContainerProps): ReactElement;
  displayName: string;
}

/**
 * Renders a `<div>` by default that pins its Badge to a corner of the element it wraps (`position`, as
 * `data-position` on the root). The Badge must be a direct child of the container: the theme
 * positions `.cck-badge-container[data-position] > .cck-badge`. The children render unchanged, in
 * the order the author wrote them. Native div attributes pass through, and `ref` reaches the div.
 *
 * @example
 * <BadgeContainer position="top-right"><Button>Inbox</Button><Badge content={2} /></BadgeContainer>
 * @cckPart root
 * @param props - The BadgeContainer props.
 * @returns The rendered div.
 */
export const BadgeContainer: BadgeContainerComponent = Object.assign(BadgeContainerImpl, {
  displayName: 'BadgeContainer',
});
