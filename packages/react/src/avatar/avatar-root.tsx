'use client';

import { isValidElement, useCallback, useMemo, useRef, useState, type ReactElement, type Ref } from 'react';
import { avatarAnatomy, getAvatarProps, type AvatarImageLoadingStatus } from '@cocokits/machines/avatar';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { isDevelopment } from '../internal/dev';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { AvatarContext, type AvatarContextValue } from './avatar-context';
import type { AvatarPart, AvatarRenderProps, AvatarRootProps, AvatarState } from './avatar.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function AvatarRootImpl({ render, ref, children, ...rest }: AvatarRootProps): ReactElement {
  const themeAttrs = useThemeAttrs(avatarAnatomy).root;
  const [status, setStatus] = useState<AvatarImageLoadingStatus>('idle');
  const images = useRef(0);
  const warned = useRef(false);

  const registerImage = useCallback((): (() => void) => {
    images.current += 1;
    if (images.current > 1 && !warned.current && isDevelopment()) {
      warned.current = true;
      console.warn('CocoKits: an Avatar has more than one Avatar.Image. Use one Avatar.Image in each Avatar.Root.');
    }
    return () => {
      images.current -= 1;
    };
  }, []);

  const context = useMemo<AvatarContextValue>(() => ({ status, setStatus, registerImage }), [status, registerImage]);

  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const parts = getAvatarProps({ status });
  const props = mergeProps({ ...themeAttrs, ...toReactProps(parts.root), ref: mergedRef }, { ...rest, children });
  return (
    <AvatarContext.Provider value={context}>
      {renderElement<AvatarRenderProps, AvatarState>(render, 'span', props as unknown as AvatarRenderProps, {
        status,
      })}
    </AvatarContext.Provider>
  );
}

/**
 * A person as a picture, or, when there is no picture or it fails to load, as a fallback. It renders a `<span>` and
 * holds an `Avatar.Image` and an `Avatar.Fallback`.
 *
 * It has no role. Give the image an `alt` with the person's name. For initials or an icon, put `role="img"` and an
 * `aria-label` on the root. When the name is printed beside the avatar, hide the avatar with `aria-hidden="true"`.
 *
 * Native `span` props pass through, and `ref` reaches the element.
 *
 * @example
 * <Avatar.Root>
 *   <Avatar.Image src="/ada.webp" alt="Ada Park" />
 *   <Avatar.Fallback>AP</Avatar.Fallback>
 * </Avatar.Root>
 * @cckPart root
 * @param props - The Root props.
 * @returns The rendered element inside the provider.
 */
export const AvatarRoot: AvatarPart<AvatarRootProps> = Object.assign(AvatarRootImpl, {
  displayName: 'Avatar.Root',
});
