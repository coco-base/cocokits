// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { defineComponent, h, ref, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideDirection } from '@cocokits/vue-core';
import { TooltipContent, TooltipRoot, TooltipTrigger } from '../../tooltip';
import { PopoverContent, PopoverRoot, PopoverTrigger } from '../index';
import { mountView, dialog as popover, settle, stubOverlayBrowser } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('dir');
});

const tooltip = (): HTMLElement | null => document.querySelector<HTMLElement>('.cck-tooltip__content');

/** An open Tooltip on a button inside an open Popover, both driven by the page like `v-model:open`. */
function stack(order: string[]): () => VNode[] {
  const popoverOpen = ref(true);
  const tooltipOpen = ref(true);
  return () => [
    h('button', 'after'),
    h(
      PopoverRoot,
      {
        open: popoverOpen.value,
        'onUpdate:open': (open: boolean) => {
          if (!open && popoverOpen.value) order.push('popover');
          popoverOpen.value = open;
        },
      },
      () => [
        h(PopoverTrigger, null, () => 'Share'),
        h(PopoverContent, { 'aria-label': 'Share link' }, () => [
          h('p', 'Anyone with the link can view.'),
          h(
            TooltipRoot,
            {
              open: tooltipOpen.value,
              'onUpdate:open': (open: boolean) => {
                if (!open && tooltipOpen.value) order.push('tooltip');
                tooltipOpen.value = open;
              },
            },
            () => [h(TooltipTrigger, null, () => 'Copy'), h(TooltipContent, null, () => 'Copy the link')],
          ),
        ]),
      ],
    ),
  ];
}

describe('Tooltip over a Popover', () => {
  it('closes both on a press outside, the tooltip first', async () => {
    const order: string[] = [];
    mountView(stack(order));
    await settle();
    expect(tooltip()).not.toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'after' }));
    await settle();
    expect(order).toEqual(['tooltip', 'popover']);
  });

  it('closes only the tooltip on a press inside the popover', async () => {
    const order: string[] = [];
    mountView(stack(order));
    await settle();
    await userEvent.click(screen.getByText('Anyone with the link can view.'));
    await settle();
    expect(order).toEqual(['tooltip']);
  });
});

describe('Popover direction', () => {
  it('follows a dir change on the page while open', async () => {
    const dir = ref<'ltr' | 'rtl'>('ltr');
    const Page = defineComponent({
      setup() {
        provideDirection(dir);
        return () => [
          h(PopoverRoot, { open: true }, () => [
            h(PopoverTrigger, null, () => 'Share'),
            h(PopoverContent, { 'aria-label': 'Share link', side: 'start' }, () =>
              h(
                'button',
                {
                  onClick: () => {
                    document.documentElement.setAttribute('dir', 'rtl');
                    dir.value = 'rtl';
                  },
                },
                'flip',
              ),
            ),
          ]),
        ];
      },
    });
    mountView(() => h(Page));
    await settle();
    const host = document.querySelector('[popover]');
    expect(host?.getAttribute('dir')).toBe('ltr');
    await userEvent.click(screen.getByRole('button', { name: 'flip' }));
    await settle();
    expect(host?.getAttribute('dir')).toBe('rtl');
    expect(popover()?.getAttribute('data-side')).toBe('start');
  });
});

describe('Popover initial focus', () => {
  it('prefers a later [autofocus] element over the first tabbable', async () => {
    mountView(() =>
      h(PopoverRoot, null, () => [
        h(PopoverTrigger, null, () => 'Share'),
        h(PopoverContent, { 'aria-label': 'Share link' }, () => [
          h('button', 'first'),
          h('button', { autofocus: true }, 'second'),
        ]),
      ]),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    await settle();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'second' }));
  });
});
