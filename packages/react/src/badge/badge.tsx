'use client';

import { cloneElement, isValidElement, type ReactElement, type Ref } from 'react';
import { useThemeAttrs, toReactProps } from '@cocokits/react-core';
import { badgeAnatomy, getBadgeProps } from '@cocokits/machines/badge';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import type { BadgeProps, BadgeRenderProps, BadgeState } from './badge.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function BadgeImpl({ content, max, hide, render, ref, ...rest }: BadgeProps): ReactElement {
  const parts = getBadgeProps({ content, max, hide });
  const themeAttrs = useThemeAttrs(badgeAnatomy);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const children = (
    <>
      {parts.content && (
        <span {...themeAttrs.content} className={parts.content.class}>
          {parts.content.text}
        </span>
      )}
      {parts.maxIndicator && (
        <span {...themeAttrs.maxIndicator} className={parts.maxIndicator.class}>
          {parts.maxIndicator.text}
        </span>
      )}
    </>
  );
  const props = mergeProps(
    { ...themeAttrs.root, ...toReactProps(parts.root), ref: mergedRef, children },
    rest,
  ) as unknown as BadgeRenderProps;
  // `hidden` is the base's promise: neither a `hidden` prop nor the element given to `render` can turn it off.
  const hidden = parts.root.hidden !== undefined;
  const withHidden = hidden ? { ...props, hidden: true as const } : props;
  const state: BadgeState = {
    empty: parts.root['data-empty'] !== undefined,
    truncated: parts.root['data-truncated'] !== undefined,
    hidden,
  };
  // The part's children win over the element's own: the Badge's parts.
  const element = isValidElement<{ children?: undefined; hidden?: undefined }>(render)
    ? cloneElement(render, hidden ? { children: undefined, hidden: undefined } : { children: undefined })
    : render;
  return renderElement<BadgeRenderProps, BadgeState>(element, 'span', withHidden, state);
}

/** The {@link Badge} component and its `displayName`. */
interface BadgeComponent {
  (props: BadgeProps): ReactElement;
  displayName: string;
}

/**
 * A small count or text, such as the number of new messages. It renders a `<span>`, which is empty without
 * content. A number above `max` shows as `max` and a `+`.
 *
 * Native `span` props pass through, and `ref` reaches the element.
 *
 * It has no role. Screen readers read its text in place, so inside a Button it is part of the name of the button.
 * An empty Badge has no text, so put its meaning in the name of the host. For example, write
 * `aria-label="Notifications, 2 new"` on a Button with only an icon.
 *
 * @example
 * <button type="button">
 *   Inbox <Badge content={5} max={99} />
 * </button>
 * @cckPart root
 * @param props - The Badge props.
 * @returns The rendered span.
 */
export const Badge: BadgeComponent = Object.assign(BadgeImpl, { displayName: 'Badge' });
