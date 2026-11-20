/**
 * Whether the picture of an Avatar is ready. The root owns it and its image writes it.
 *
 * @cckValue idle - Nothing probed yet: the server render, the first client render, and an unmounted image.
 * @cckValue loading - The source is being fetched.
 * @cckValue loaded - The source loaded; the image shows and the fallback hides.
 * @cckValue error - There is no source, or it failed to load; the fallback shows.
 */
export type AvatarImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

/** Inputs of `getAvatarProps`. */
export interface AvatarProps {
  /** The loading status of the picture. */
  readonly status: AvatarImageLoadingStatus;
  /**
   * Whether the fallback delay has passed. Pass `true` when `delayMs` is unset.
   * @defaultValue true
   */
  readonly delayPassed?: boolean | undefined;
}

/** Props of the root part. */
export interface AvatarRootProps {
  /** The `cck-avatar` block class. */
  readonly class: string;
}

/** Props of the image part. */
export interface AvatarImageProps {
  /** The `cck-avatar__image` class. */
  readonly class: string;
  /** The native `hidden` attribute; present while the status is not `loaded`. */
  readonly hidden?: true | undefined;
}

/** Props of the fallback part. */
export interface AvatarFallbackProps {
  /** The `cck-avatar__fallback` class. */
  readonly class: string;
  /** The native `hidden` attribute; present while the status is `loaded`, or before the delay has passed. */
  readonly hidden?: true | undefined;
}

/** What `getAvatarProps` returns. */
export interface AvatarParts {
  /** The root props. */
  readonly root: AvatarRootProps;
  /** The image props. */
  readonly image: AvatarImageProps;
  /** The fallback props. */
  readonly fallback: AvatarFallbackProps;
}

/** The source an image probe reads. Only these three reach the probe. */
export interface ImageSourceInput {
  /** The picture address; unset or empty gives `error`. */
  readonly src?: string | null | undefined;
  /** The CORS mode, copied to the probe. */
  readonly crossOrigin?: string | null | undefined;
  /** The referrer policy, copied to the probe. */
  readonly referrerPolicy?: string | null | undefined;
}

/** The part of an `HTMLImageElement` the probe uses. */
export interface ImageProbe {
  src: string;
  crossOrigin: string | null;
  referrerPolicy: string;
  readonly complete: boolean;
  readonly naturalWidth: number;
  addEventListener(type: 'load' | 'error', listener: () => void): void;
  removeEventListener(type: 'load' | 'error', listener: () => void): void;
}
