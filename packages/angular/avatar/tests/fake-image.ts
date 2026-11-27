import { vi } from 'vitest';

type Listener = () => void;

/** A stand-in for `Image` that the test finishes by hand. Install it with `installFakeImage`. */
export class FakeImage {
  static readonly all: FakeImage[] = [];
  complete = false;
  naturalWidth = 0;
  src = '';
  crossOrigin: string | null = null;
  referrerPolicy = '';
  private readonly listeners = new Map<string, Set<Listener>>();

  constructor() {
    FakeImage.all.push(this);
  }

  addEventListener(type: string, listener: Listener): void {
    this.listeners.set(type, (this.listeners.get(type) ?? new Set()).add(listener));
  }

  removeEventListener(type: string, listener: Listener): void {
    this.listeners.get(type)?.delete(listener);
  }

  listenerCount(): number {
    return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0);
  }

  /** The picture loads. */
  load(): void {
    this.complete = true;
    this.naturalWidth = 40;
    this.listeners.get('load')?.forEach((listener) => {
      listener();
    });
  }

  /** The picture fails. */
  fail(): void {
    this.complete = true;
    this.listeners.get('error')?.forEach((listener) => {
      listener();
    });
  }
}

/** Replaces the global `Image`; undo it with `vi.unstubAllGlobals()`. */
export function installFakeImage(): void {
  FakeImage.all.length = 0;
  vi.stubGlobal('Image', FakeImage);
}

/** The newest probe image. */
export function lastProbe(): FakeImage {
  const probe = FakeImage.all.at(-1);
  if (!probe) throw new Error('no probe image was made');
  return probe;
}
