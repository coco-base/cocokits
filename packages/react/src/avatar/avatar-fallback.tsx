'use client';

import { cloneElement, isValidElement, useEffect, useState, type ReactElement, type Ref } from 'react';
import { avatarAnatomy, getAvatarProps } from '@cocokits/machines/avatar';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { useAvatarContext } from './avatar-context';
import type { AvatarFallbackProps, AvatarFallbackState, AvatarPart, AvatarRenderProps } from './avatar.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function AvatarFallbackImpl({ delayMs, render, ref, children, ...rest }: AvatarFallbackProps): ReactElement {
  const { status } = useAvatarContext('Avatar.Fallback');
  const themeAttrs = useThemeAttrs(avatarAnatomy).fallback;
  // The delay the timer has run out for; derived, so a new `delayMs` hides the fallback again without an effect.
  const [elapsed, setElapsed] = useState<number | undefined>(undefined);
  const delayPassed = delayMs === undefined || elapsed === delayMs;

  useEffect(() => {
    if (delayMs === undefined) return undefined;
    const timer = setTimeout(() => {
      setElapsed(delayMs);
    }, delayMs);
    return () => {
      clearTimeout(timer);
      setElapsed(undefined);
    };
  }, [delayMs]);

  const { fallback } = getAvatarProps({ status, delayPassed });
  const hidden = fallback.hidden === true;
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const merged = mergeProps({ ...themeAttrs, ...toReactProps(fallback), ref: mergedRef }, { ...rest, children });
  // `hidden` is the base's promise: neither a `hidden` prop nor the element given to `render` can turn it off.
  const props = (hidden ? { ...merged, hidden: true } : merged) as unknown as AvatarRenderProps;
  // The part's `hidden` wins over the one of the element given to `render`.
  const element =
    hidden && isValidElement<{ hidden?: undefined }>(render) ? cloneElement(render, { hidden: undefined }) : render;
  return renderElement<AvatarRenderProps, AvatarFallbackState>(element, 'span', props, { status, hidden });
}

/**
 * What shows while the picture is not loaded: initials, an icon or any content. It renders a `<span>`, which stays in
 * the DOM and is `hidden` once the picture has loaded, or until `delayMs` has passed.
 *
 * It has no role. A reader hears the image or the fallback, never both. Name initials or an icon with `role="img"`
 * and an `aria-label` on the root; an `SvgIcon` takes a `label` or stays decorative.
 *
 * Native `span` props pass through, and `ref` reaches the element.
 *
 * @example
 * <Avatar.Fallback delayMs={600}>AP</Avatar.Fallback>
 * @cckPart fallback
 * @param props - The Fallback props.
 * @returns The rendered element.
 */
export const AvatarFallback: AvatarPart<AvatarFallbackProps> = Object.assign(AvatarFallbackImpl, {
  displayName: 'Avatar.Fallback',
});
