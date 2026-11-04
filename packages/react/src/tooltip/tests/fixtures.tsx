import { StrictMode, type ReactElement } from 'react';
import { vi } from 'vitest';
import { Tooltip } from '../index';

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

/** A tooltip on an icon-only button, between two buttons of the page and followed by empty space. */
export function Example({
  onOpenChange,
  open,
  defaultOpen,
  delayDuration,
  disableHoverableContent,
  disabled,
  side,
}: {
  readonly onOpenChange?: (open: boolean, details: { reason: string; event: Event | null }) => void;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly delayDuration?: number;
  readonly disableHoverableContent?: boolean;
  readonly disabled?: boolean;
  readonly side?: 'top' | 'bottom' | 'start' | 'end';
}): ReactElement {
  return (
    <StrictMode>
      <button>before</button>
      <Tooltip.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        delayDuration={delayDuration}
        disableHoverableContent={disableHoverableContent}
        disabled={disabled}
      >
        <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
        <Tooltip.Content side={side}>Copy the link</Tooltip.Content>
      </Tooltip.Root>
      <button>after</button>
      <p>Empty space</p>
    </StrictMode>
  );
}

/** The visible tooltip content; the hidden description element carries the same role and is not it. */
export function tooltipContent(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.cck-tooltip__content');
}

/** The hidden description element of the trigger, `null` while there is none. */
export function tooltipDescription(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="tooltip"][hidden]');
}

/**
 * The accessible description of an element: the text of the elements `aria-describedby` names, hidden ones
 * included (accname 2.1 reads a directly referenced hidden node).
 */
export function accessibleDescription(element: Element): string {
  return (element.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ')
    .trim();
}
