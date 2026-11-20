'use client';

import { useEffect, useRef, type ReactElement } from 'react';
import {
  avatarAnatomy,
  getAvatarProps,
  watchImageLoadingStatus,
  type AvatarImageLoadingStatus,
} from '@cocokits/machines/avatar';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps } from '../internal/merge-props';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useAvatarContext } from './avatar-context';
import type { AvatarImageProps, AvatarPart } from './avatar.types';

function AvatarImageImpl({
  src,
  crossOrigin,
  referrerPolicy,
  onLoadingStatusChange,
  ref,
  ...rest
}: AvatarImageProps): ReactElement {
  const { status, setStatus, registerImage } = useAvatarContext('Avatar.Image');
  const themeAttrs = useThemeAttrs(avatarAnatomy).image;
  const image = getAvatarProps({ status }).image;

  // Read by the probe, which must not restart when only the callback changes.
  const callback = useRef(onLoadingStatusChange);
  useIsomorphicLayoutEffect(() => {
    callback.current = onLoadingStatusChange;
  });

  useEffect(() => registerImage(), [registerImage]);

  const reported = useRef<AvatarImageLoadingStatus | null>(null);
  useEffect(() => {
    const stop = watchImageLoadingStatus({ src, crossOrigin, referrerPolicy }, (next) => {
      setStatus(next);
      if (reported.current !== next) {
        reported.current = next;
        callback.current?.(next);
      }
    });
    return () => {
      stop();
      setStatus('idle');
    };
  }, [src, crossOrigin, referrerPolicy, setStatus]);

  // An empty `src` is a supported input (status `error`); React warns when it reaches the DOM.
  const props = mergeProps(
    { ...themeAttrs, ...toReactProps(image) },
    { ...rest, src: src === '' ? undefined : src, crossOrigin, referrerPolicy },
  );
  // `hidden` is the base's promise: a `hidden={false}` of the consumer cannot show an image that has not loaded.
  return <img {...props} {...(image.hidden ? { hidden: true } : {})} ref={ref} />;
}

/**
 * The picture of an Avatar. It renders a native `<img>`, which stays in the DOM and is `hidden` until the picture
 * has loaded. It takes no `render`, because its element is fixed.
 *
 * After mount, and when `src`, `crossOrigin` or `referrerPolicy` changes, it probes the source with a detached
 * image and tells the root the status. Use one image in each root; in development a second one logs a `CocoKits:`
 * warning.
 *
 * Give it an `alt` with the person's name. Native `img` props pass through, and `ref` reaches the `<img>`.
 *
 * @example
 * <Avatar.Image src="/ada.webp" alt="Ada Park" />
 * @cckPart image
 * @param props - The Image props.
 * @returns The rendered img.
 */
export const AvatarImage: AvatarPart<AvatarImageProps> = Object.assign(AvatarImageImpl, {
  displayName: 'Avatar.Image',
});
