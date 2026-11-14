import { customRef, type ComponentPublicInstance, type ShallowRef } from 'vue';
import { rootElementOf } from './root-element';

/** What {@link liveElementRef} returns. */
export interface LiveElement {
  /**
   * The element the followed part currently renders, read at the moment of use, `null` when there is none.
   * Reading it in a watcher or a computed tracks it: they run again when the child swaps its root.
   */
  readonly element: ShallowRef<HTMLElement | null>;
  /** Follows the part of this instance (a function ref); `null` stops following. */
  readonly follow: (instance: ComponentPublicInstance | null) => void;
}

/**
 * The element of a part, kept live. A part that renders a composed child (`asChild`) can see the child swap
 * its own root without rendering itself, so the element is read from the instance on every access, not stored
 * when the part mounts. A swap replaces a node in the parent, which a `MutationObserver` reports, so the readers
 * that tracked the element run again.
 *
 * @internal
 * @returns The live element and the function that sets the instance to follow.
 */
export function liveElementRef(): LiveElement {
  let followed: ComponentPublicInstance | null = null;
  let current: Element | null = null;
  let observer: MutationObserver | undefined;
  let changed = (): void => undefined;

  function look(): void {
    const next = rootElementOf(followed);
    observer?.disconnect();
    const parent = next?.parentNode;
    if (parent && typeof MutationObserver !== 'undefined') {
      observer ??= new MutationObserver(() => {
        if (rootElementOf(followed) !== current) look();
      });
      observer.observe(parent, { childList: true });
    }
    if (next !== current) {
      current = next;
      changed();
    }
  }

  const element = customRef<HTMLElement | null>((track, trigger) => {
    changed = trigger;
    return {
      get: () => {
        track();
        return rootElementOf(followed) as HTMLElement | null;
      },
      set: () => undefined,
    };
  });
  return {
    element,
    follow: (instance) => {
      followed = instance;
      if (instance) look();
      else {
        observer?.disconnect();
        current = null;
        changed();
      }
    },
  };
}
