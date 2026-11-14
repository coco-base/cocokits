import { StrictMode, type ReactElement } from 'react';
import { Avatar, type AvatarFallbackProps, type AvatarImageProps, type AvatarRootProps } from '../index';

/** A stand-in for the detached image of the probe: the test decides when and how it finishes. */
export class FakeImage {
  static instances: FakeImage[] = [];
  src = '';
  crossOrigin: string | null = null;
  referrerPolicy = '';
  complete = false;
  naturalWidth = 0;
  private readonly listeners = new Map<string, Set<() => void>>();

  constructor() {
    FakeImage.instances.push(this);
  }

  addEventListener(type: string, listener: () => void): void {
    this.listeners.set(type, (this.listeners.get(type) ?? new Set()).add(listener));
  }

  removeEventListener(type: string, listener: () => void): void {
    this.listeners.get(type)?.delete(listener);
  }

  finish(type: 'load' | 'error'): void {
    for (const listener of this.listeners.get(type) ?? []) listener();
  }

  /** The last image that a probe made. */
  static get last(): FakeImage {
    const image = FakeImage.instances.at(-1);
    if (!image) throw new Error('no probe image was made');
    return image;
  }
}

/** An avatar with an image and a fallback, in StrictMode. */
export function Example({
  src = '/ada.webp',
  delayMs,
  image,
  fallback,
  ...root
}: AvatarRootProps & {
  readonly src?: string | undefined;
  readonly delayMs?: number | undefined;
  readonly image?: Partial<AvatarImageProps>;
  readonly fallback?: Partial<AvatarFallbackProps>;
}): ReactElement {
  return (
    <StrictMode>
      <Avatar.Root {...root}>
        <Avatar.Image src={src} alt="Ada Park" {...image} />
        <Avatar.Fallback delayMs={delayMs} {...fallback}>
          AP
        </Avatar.Fallback>
      </Avatar.Root>
    </StrictMode>
  );
}
