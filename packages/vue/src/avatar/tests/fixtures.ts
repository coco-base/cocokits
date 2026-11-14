import { vi } from 'vitest';

type Listener = () => void;

/** A detached image the test controls: it never loads on its own. */
export class StubImage {
  static instances: StubImage[] = [];
  src = '';
  crossOrigin: string | null = null;
  referrerPolicy = '';
  complete = false;
  naturalWidth = 0;
  private readonly listeners = new Map<string, Set<Listener>>();

  constructor() {
    StubImage.instances.push(this);
  }

  addEventListener(type: string, listener: Listener): void {
    this.listeners.set(type, (this.listeners.get(type) ?? new Set()).add(listener));
  }

  removeEventListener(type: string, listener: Listener): void {
    this.listeners.get(type)?.delete(listener);
  }

  /** How many listeners are attached. */
  get listenerCount(): number {
    return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0);
  }

  /** Fires `load` or `error` on the image. */
  fire(type: 'load' | 'error'): void {
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener();
  }

  /** The probe made last. */
  static get last(): StubImage {
    const image = StubImage.instances.at(-1);
    if (!image) throw new Error('No image was probed');
    return image;
  }
}

/** Replaces the global `Image` with {@link StubImage}; undone by `vi.unstubAllGlobals()`. */
export function stubImage(): void {
  StubImage.instances = [];
  vi.stubGlobal('Image', StubImage);
}

export { mountView, pick, view } from '../../internal/tests/mount-helpers';
