import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/vue';
import { defineComponent, h, ref, type Component, type Ref, type VNode } from 'vue';
import { vi } from 'vitest';
import { PopoverClose, PopoverContent, PopoverRoot, PopoverTrigger } from '../index';

export { mountView, view } from '../../internal/tests/mount-helpers';

/** The element with the id; fails the test when there is none. */
export function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`No element has the id ${id}`);
  return element;
}

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

/** Lets the portal host, the post-render effects and the animation frame (focus move) settle. */
export async function settle(): Promise<void> {
  for (let round = 0; round < 3; round += 1) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

/** A popover with a trigger, a content with a Close and a button after the popover. */
export function popoverView(options: {
  open?: Ref<boolean>;
  rootProps?: Record<string, unknown>;
  contentProps?: Record<string, unknown>;
  inner?: () => VNode | VNode[];
}): () => VNode[] {
  const state = options.open;
  return () => [
    h('button', { id: 'before' }, 'before'),
    h(
      PopoverRoot,
      {
        ...(state ? { open: state.value, 'onUpdate:open': (value: boolean) => (state.value = value) } : {}),
        ...options.rootProps,
      },
      () => [
        h(PopoverTrigger, null, () => 'Share'),
        h(PopoverContent, { 'aria-label': 'Share', ...options.contentProps }, () =>
          options.inner ? options.inner() : [h('p', 'Link copied'), h(PopoverClose, null, () => 'Close')],
        ),
      ],
    ),
    h('button', { id: 'after' }, 'after'),
  ];
}

/** A component that holds a controlled `open` ref and renders {@link popoverView}. */
export function controlled(openRef: Ref<boolean> = ref(false)): { Component: Component; open: Ref<boolean> } {
  return {
    open: openRef,
    Component: defineComponent({ setup: () => popoverView({ open: openRef }) }),
  };
}

/** The button that opens the popover. */
export const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Share' });

/** The open popover content, or null. */
export const dialog = (): HTMLElement | null => screen.queryByRole('dialog');

/** Opens the popover with a click on the trigger and waits for the update. */
export async function open(): Promise<void> {
  await userEvent.click(trigger());
  await settle();
}
