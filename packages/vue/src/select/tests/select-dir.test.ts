// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen, waitFor } from '@testing-library/vue';
import { defineComponent, h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideDirection } from '@cocokits/vue-core';
import { placedRightOfAnchor, stubLayout } from '../../internal/tests/stub-layout';
import { item, mountView, selectRoot, stubOverlayBrowser } from './fixtures';

beforeEach(() => {
  stubOverlayBrowser();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Select dir', () => {
  function mountSelect(
    rootProps: Record<string, unknown>,
    provided?: 'ltr' | 'rtl',
    content: Record<string, unknown> = {},
  ) {
    const Provide = defineComponent({
      setup(_props, { slots }) {
        if (provided) provideDirection(provided);
        return () => slots.default?.();
      },
    });
    return mountView(() =>
      h(Provide, null, () =>
        selectRoot(rootProps, { items: () => [item('Cake'), item('Pizza')], content: { side: 'start', ...content } }),
      ),
    );
  }
  const root = (container: Element): Element | null => container.querySelector('.cck-select');

  it('reaches the portaled list inside an ltr provider, and renders the own dir on the root', async () => {
    const user = userEvent.setup();
    const { container } = mountSelect({ dir: 'rtl' }, 'ltr');
    expect(root(container)?.getAttribute('dir')).toBe('rtl');
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const list = await screen.findByRole('listbox');
    expect(list.closest('[popover]')?.getAttribute('dir')).toBe('rtl');
  });

  it.each([
    { dir: 'rtl' as const, provided: 'ltr' as const, right: true },
    { dir: 'ltr' as const, provided: 'rtl' as const, right: false },
  ])(
    'places side="start" $dir of the trigger by the own dir inside a $provided provider',
    async ({ dir, provided, right }) => {
      stubLayout(() => document.querySelector('[role="combobox"]'));
      const user = userEvent.setup();
      mountSelect({ dir }, provided);
      await user.tab();
      await user.keyboard('{ArrowDown}');
      const list = await screen.findByRole('listbox');
      await waitFor(() => {
        expect(placedRightOfAnchor(list)).toBe(right);
      });
    },
  );

  it('follows the provider without dir, and renders no dir attribute', async () => {
    const user = userEvent.setup();
    const { container } = mountSelect({}, 'rtl');
    expect(root(container)?.hasAttribute('dir')).toBe(false);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const list = await screen.findByRole('listbox');
    expect(list.closest('[popover]')?.getAttribute('dir')).toBe('rtl');
  });

  it('is ltr without dir and provider', async () => {
    const user = userEvent.setup();
    const { container } = mountSelect({});
    expect(root(container)?.hasAttribute('dir')).toBe(false);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const list = await screen.findByRole('listbox');
    expect(list.closest('[popover]')?.getAttribute('dir')).toBe('ltr');
  });
});
