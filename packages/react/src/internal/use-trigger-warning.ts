'use client';

import { useEffect, useRef } from 'react';
import { isDevelopment } from './dev';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/**
 * In development, warns once when a Content has no Trigger: a popover or tooltip needs an anchor. The check waits a
 * frame, because the Trigger registers itself during the first commit.
 *
 * @param part - The part that asks, such as `Popover.Content`.
 * @param trigger - The trigger element the Root knows now, `null` when there is none.
 */
export function useTriggerWarning(part: string, trigger: HTMLElement | null): void {
  const latest = useRef(trigger);
  useIsomorphicLayoutEffect(() => {
    latest.current = trigger;
  });
  useEffect(() => {
    if (!isDevelopment()) return undefined;
    const frame = requestAnimationFrame(() => {
      if (latest.current === null) {
        console.warn(
          `CocoKits: <${part}> has no trigger, so it has nothing to anchor to and never opens. Add the matching Trigger inside the same Root.`,
        );
      }
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [part]);
}
