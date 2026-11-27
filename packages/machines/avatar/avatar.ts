import { avatarAnatomy } from './avatar.anatomy';
import type { AvatarImageLoadingStatus, AvatarParts, AvatarProps, ImageProbe, ImageSourceInput } from './avatar.types';

/**
 * Computes the props of every Avatar part. Pure: no DOM, same result on server and client.
 *
 * @param props - The image status and whether the fallback delay has passed.
 * @returns The part props. The image is `hidden` until `loaded`; the fallback is `hidden` once `loaded` or before the delay.
 */
export function getAvatarProps({ status, delayPassed = true }: AvatarProps): AvatarParts {
  const classes = avatarAnatomy.classes;
  const loaded = status === 'loaded';
  return {
    root: { class: classes.root },
    image: { class: classes.image, ...(loaded ? {} : { hidden: true as const }) },
    fallback: { class: classes.fallback, ...(loaded || !delayPassed ? { hidden: true as const } : {}) },
  };
}

/**
 * Probes a picture with a detached image and reports its status. Call it after mount and call the
 * returned function on a change of the source and on unmount.
 *
 * No or empty `src` reports `error`. An image that is already `complete` reports `loaded` when it has
 * a width and `error` otherwise. Any other reports `loading`, then `loaded` or `error`.
 *
 * @param source - `src`, `crossOrigin` and `referrerPolicy`.
 * @param onStatus - Called with each status, never with `idle`.
 * @param createImage - Makes the detached image; defaults to `new Image()`.
 * @returns A function that removes the listeners.
 */
export function watchImageLoadingStatus(
  { src, crossOrigin, referrerPolicy }: ImageSourceInput,
  onStatus: (status: AvatarImageLoadingStatus) => void,
  createImage: () => ImageProbe = () => new Image(),
): () => void {
  if (!src) {
    onStatus('error');
    return () => undefined;
  }
  const image = createImage();
  const onLoad = (): void => {
    onStatus('loaded');
  };
  const onError = (): void => {
    onStatus('error');
  };
  const stop = (): void => {
    image.removeEventListener('load', onLoad);
    image.removeEventListener('error', onError);
  };
  if (crossOrigin) image.crossOrigin = crossOrigin;
  if (referrerPolicy) image.referrerPolicy = referrerPolicy;
  image.src = src;
  if (image.complete) {
    onStatus(image.naturalWidth > 0 ? 'loaded' : 'error');
    return () => undefined;
  }
  image.addEventListener('load', onLoad);
  image.addEventListener('error', onError);
  onStatus('loading');
  return stop;
}
