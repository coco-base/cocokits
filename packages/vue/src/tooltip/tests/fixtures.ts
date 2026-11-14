import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/vue';
import { h, nextTick, type VNode } from 'vue';
import { vi } from 'vitest';
import { TooltipContent, TooltipRoot, TooltipTrigger } from '../index';

export { mountView, view } from '../../internal/tests/mount-helpers';

/** The browser features jsdom lacks and the overlay needs: the top layer and the resize observer. */
export function stubOverlayBrowser(): void {
  // jsdom hides a `[popover]` that was never shown; the stub shows it like the browser does.
  HTMLElement.prototype.showPopover = function showPopover(this: HTMLElement): void {
    this.style.display = 'block';
  };
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
}

/** Lets the portal host, the post-render effects and the animation frame settle (real timers only). */
export async function settle(): Promise<void> {
  for (let round = 0; round < 3; round += 1) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

/** A tooltip on an icon-only button, between two buttons of the page. */
export function tooltipView(options: {
  /** The props of the root; a function is read on every render, so a test can drive them with refs. */
  rootProps?: Record<string, unknown> | (() => Record<string, unknown>);
  contentProps?: Record<string, unknown>;
}): () => VNode[] {
  return () => [
    h('button', { id: 'before' }, 'before'),
    h(TooltipRoot, typeof options.rootProps === 'function' ? options.rootProps() : (options.rootProps ?? {}), () => [
      h(TooltipTrigger, { 'aria-label': 'Copy link' }, () => 'Copy'),
      h(TooltipContent, options.contentProps ?? {}, () => 'Copy the link'),
    ]),
    h('button', { id: 'after' }, 'after'),
  ];
}

/** The element with the id; throws while there is none. */
export function elementById(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`No element with the id ${id}.`);
  return element;
}

/** The visible tooltip content, `null` while there is none; the hidden description element has the same role. */
export function tooltipContent(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.cck-tooltip__content');
}

/** The visible tooltip content; throws while there is none. */
export function shownContent(): HTMLElement {
  const content = tooltipContent();
  if (!content) throw new Error('The tooltip content is not in the document.');
  return content;
}

/** The hidden description element of the trigger, `null` while there is none. */
export function tooltipDescription(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="tooltip"][hidden]');
}

/**
 * The accessible description of an element: the text of the elements `aria-describedby` names, hidden ones
 * included (accname reads a directly referenced hidden node).
 */
export function accessibleDescription(element: Element): string {
  return (element.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ')
    .trim();
}

/** The button that triggers the tooltip. */
export const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Copy link' });

/** Whether the tooltip content is in the document. */
export const isOpen = (): boolean => tooltipContent() !== null;

/** A user whose delays run on the fake clock. */
export const setup = (): ReturnType<typeof userEvent.setup> =>
  userEvent.setup({ delay: null, advanceTimers: (ms) => vi.advanceTimersByTime(ms) });

/** Advances the fake clock and lets Vue and the portal flush. */
export const elapse = async (ms: number): Promise<void> => {
  await vi.advanceTimersByTimeAsync(ms);
  for (let round = 0; round < 3; round += 1) {
    await nextTick();
    await vi.advanceTimersByTimeAsync(0);
  }
};
