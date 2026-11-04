import { StrictMode, type ReactElement } from 'react';
import { vi } from 'vitest';
import { Popover } from '../index';

/**
 * jsdom has no top layer: emulate `:modal` (a dialog with `data-modal`) and `showPopover`, which the portal host
 * needs. Call it in `beforeEach`; `vi.restoreAllMocks()` in `afterEach` undoes the spy.
 */
export function stubTopLayer(): void {
  const matches = Reflect.get(Element.prototype, 'matches') as (this: Element, selector: string) => boolean;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    if (selector === ':modal') return this.localName === 'dialog' && this.hasAttribute('data-modal');
    return matches.call(this, selector);
  });
  // jsdom hides `[popover]` until it is shown; showing it makes the content reachable by role.
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    this.style.display = 'block';
  };
}

/** A popover with a trigger and a content that holds two buttons, between two buttons of the page. */
export function Example({
  onOpenChange,
  open,
  defaultOpen,
}: {
  readonly onOpenChange?: (open: boolean, details: { reason: string; event: Event | null }) => void;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
}): ReactElement {
  return (
    <StrictMode>
      <button>before</button>
      <Popover.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="Share link">
          <p>Anyone with the link can view.</p>
          <button>copy</button>
          <Popover.Close>Done</Popover.Close>
        </Popover.Content>
      </Popover.Root>
      <button>after</button>
    </StrictMode>
  );
}

/** Resolves after the next animation frame, where deferred focus runs. */
export const nextFrame = (): Promise<void> =>
  new Promise((resolve) =>
    requestAnimationFrame(() => {
      resolve();
    }),
  );
