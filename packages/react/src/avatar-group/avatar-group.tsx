'use client';

import { cloneElement, isValidElement, type ReactElement, type Ref } from 'react';
import { avatarGroupAnatomy, getAvatarGroupProps } from '@cocokits/machines/avatar-group';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import type { AvatarGroupProps, AvatarGroupRenderProps, AvatarGroupState } from './avatar-group.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function AvatarGroupImpl({ render, ref, children, ...rest }: AvatarGroupProps): ReactElement {
  const parts = getAvatarGroupProps();
  const themeAttrs = useThemeAttrs(avatarGroupAnatomy);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const props = mergeProps(
    { ...themeAttrs.root, ...toReactProps(parts.root), ref: mergedRef, children },
    rest,
  ) as unknown as AvatarGroupRenderProps;
  // The part's children win over the element's own: the group renders the children it is given.
  const element = isValidElement<{ children?: undefined }>(render)
    ? cloneElement(render, { children: undefined })
    : render;
  return renderElement<AvatarGroupRenderProps, AvatarGroupState>(element, 'div', props, {});
}

/** The {@link AvatarGroup} component and its `displayName`. */
interface AvatarGroupComponent {
  (props: AvatarGroupProps): ReactElement;
  displayName: string;
}

/**
 * Several avatars that overlap. It renders a `<div>` with the children as you wrote them. Native `div` props pass
 * through, and `ref` reaches the element.
 *
 * Each avatar must be a direct child, because the theme sets the overlap and the size of
 * `.cck-avatar-group > .cck-avatar`. It has no role; add `role="group"` and an `aria-label` to name the group.
 *
 * @example
 * <AvatarGroup role="group" aria-label="Team">
 *   <Avatar.Root>
 *     <Avatar.Fallback>AP</Avatar.Fallback>
 *   </Avatar.Root>
 *   <Avatar.Root>
 *     <Avatar.Fallback>BK</Avatar.Fallback>
 *   </Avatar.Root>
 * </AvatarGroup>
 * @cckPart root
 * @param props - The AvatarGroup props.
 * @returns The rendered div.
 */
export const AvatarGroup: AvatarGroupComponent = Object.assign(AvatarGroupImpl, { displayName: 'AvatarGroup' });
