'use client';

import { cloneElement, isValidElement, type ReactElement, type Ref } from 'react';
import { avatarLabelAnatomy, getAvatarLabelProps } from '@cocokits/machines/avatar-label';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import type { AvatarLabelProps, AvatarLabelRenderProps, AvatarLabelState } from './avatar-label.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function AvatarLabelImpl({ name, description, render, ref, children, ...rest }: AvatarLabelProps): ReactElement {
  const parts = getAvatarLabelProps({ name, description });
  const themeAttrs = useThemeAttrs(avatarLabelAnatomy);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const content = (
    <>
      {children}
      {parts.text && (
        <span {...themeAttrs.text} className={parts.text.class}>
          {parts.name && (
            <span {...themeAttrs.name} className={parts.name.class}>
              {name}
            </span>
          )}
          {parts.description && (
            <span {...themeAttrs.description} className={parts.description.class}>
              {description}
            </span>
          )}
        </span>
      )}
    </>
  );
  const props = mergeProps(
    { ...themeAttrs.root, ...toReactProps(parts.root), ref: mergedRef, children: content },
    rest,
  ) as unknown as AvatarLabelRenderProps;
  // The part's children win over the element's own: the avatar and the text.
  const element = isValidElement<{ children?: undefined }>(render)
    ? cloneElement(render, { children: undefined })
    : render;
  return renderElement<AvatarLabelRenderProps, AvatarLabelState>(element, 'div', props, {
    hasName: parts.name !== null,
    hasDescription: parts.description !== null,
  });
}

/** The {@link AvatarLabel} component and its `displayName`. */
interface AvatarLabelComponent {
  (props: AvatarLabelProps): ReactElement;
  displayName: string;
}

/**
 * An avatar with the name of the person and a description beside it. It renders a `<div>` with the children you
 * wrote, then a `<span>` with the name and the description. A name or description that is not set or is empty is not
 * rendered, and neither is the `<span>` when both are missing.
 *
 * Write the avatar as the first child. The printed name names the person, so hide the avatar from screen readers
 * with `aria-hidden="true"`. Native `div` props pass through, and `ref` reaches the element.
 *
 * @example
 * <AvatarLabel name="Ada Park" description="Engineer">
 *   <Avatar.Root aria-hidden="true">
 *     <Avatar.Fallback>AP</Avatar.Fallback>
 *   </Avatar.Root>
 * </AvatarLabel>
 * @cckPart root
 * @param props - The AvatarLabel props.
 * @returns The rendered div.
 */
export const AvatarLabel: AvatarLabelComponent = Object.assign(AvatarLabelImpl, { displayName: 'AvatarLabel' });
