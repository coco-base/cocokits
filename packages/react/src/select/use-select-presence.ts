'use client';

import { useRef, useState, type RefObject } from 'react';
import { createPresence, type Presence } from '@cocokits/cdk/presence';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';

/** What {@link useSelectPresence} returns. */
export interface SelectPresence {
  /** The list element, for the exit animation. */
  readonly contentRef: RefObject<HTMLDivElement | null>;
  /** Whether the list is in the document. */
  readonly mounted: boolean;
  /** Reports whether the list is in the document; the list calls it from a layout effect. */
  readonly setMounted: (mounted: boolean) => void;
  /** Whether the list must be rendered: open, or closed with its exit animation still running. */
  readonly keepMounted: boolean;
}

/**
 * Keeps the list in the document after the Select closes until the exit animation has finished, and learns
 * from the list whether it is in the document (the trigger's `aria-controls` follows that fact).
 *
 * @param isOpen - Whether the Select is open.
 * @returns The list ref, the mounted fact and its setter, and whether to keep the list rendered.
 */
export function useSelectPresence(isOpen: boolean): SelectPresence {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [exited, setExited] = useState(true);
  const presence = useRef<Presence | null>(null);
  useIsomorphicLayoutEffect(() => {
    const created = createPresence({
      getElement: () => contentRef.current,
      onStateChange: (next) => {
        setExited(next === 'unmounted');
      },
    });
    presence.current = created;
    return () => {
      created.destroy();
      presence.current = null;
    };
  }, []);
  // After the closed state is rendered, so the exit animation already exists when it is read.
  useIsomorphicLayoutEffect(() => {
    presence.current?.setOpen(isOpen);
  }, [isOpen]);
  return { contentRef, mounted, setMounted, keepMounted: isOpen || (mounted && !exited) };
}
