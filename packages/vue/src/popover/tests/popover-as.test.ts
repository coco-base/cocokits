// @vitest-environment jsdom
import { cleanup, screen, waitFor } from '@testing-library/vue';
import { defineComponent, h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideDirection } from '@cocokits/vue-core';
import { placedRightOfAnchor, stubLayout } from '../../internal/tests/stub-layout';
import { PopoverContent, PopoverRoot, PopoverTrigger } from '../index';
import { mountView, settle, stubOverlayBrowser } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const Section = defineComponent({
  inheritAttrs: false,
  setup:
    (_props, { attrs, slots }) =>
    () =>
      h('section', attrs, slots.default?.()),
});

describe('Popover as', () => {
  it('renders the default element of the trigger and the content', async () => {
    mountView(() => [
      h(PopoverRoot, { open: true }, () => [
        h(PopoverTrigger, null, () => 'Share'),
        h(PopoverContent, { 'aria-label': 'Share' }, () => 'Body'),
      ]),
    ]);
    await settle();
    expect(screen.getByText('Share').localName).toBe('button');
    expect(screen.getByRole('dialog').localName).toBe('div');
  });

  it('renders another tag or a component given to as, keeping the role and the ids', async () => {
    mountView(() => [
      h(PopoverRoot, { open: true }, () => [
        h(PopoverTrigger, { as: 'div' }, () => 'Share'),
        h(PopoverContent, { as: Section, 'aria-label': 'Share' }, () => 'Body'),
      ]),
    ]);
    await settle();
    const content = screen.getByRole('dialog');
    expect(content.localName).toBe('section');
    expect(screen.getByText('Share').getAttribute('aria-controls')).toBe(content.id);
  });
});

describe('Popover dir', () => {
  const Provided = defineComponent({
    setup(_props, { slots }) {
      provideDirection('ltr');
      return () => slots.default?.();
    },
  });
  const host = (): HTMLElement | null => screen.getByRole('dialog').closest('[popover]');

  it('puts the own dir on the portal host, ahead of the provider', async () => {
    mountView(() => [
      h(Provided, null, () =>
        h(PopoverRoot, { open: true }, () => [
          h(PopoverTrigger, null, () => 'Share'),
          h(PopoverContent, { dir: 'rtl', 'aria-label': 'Share' }, () => 'Body'),
        ]),
      ),
    ]);
    await settle();
    expect(host()?.getAttribute('dir')).toBe('rtl');
  });

  it.each([
    { dir: 'rtl' as const, provided: 'ltr' as const, right: true },
    { dir: 'ltr' as const, provided: 'rtl' as const, right: false },
  ])(
    'places side="start" $dir of the trigger by the own dir inside a $provided provider',
    async ({ dir, provided, right }) => {
      stubLayout(() => screen.queryByTestId('trigger'));
      const Inside = defineComponent({
        setup(_props, { slots }) {
          provideDirection(provided);
          return () => slots.default?.();
        },
      });
      mountView(() => [
        h(Inside, null, () =>
          h(PopoverRoot, { open: true }, () => [
            h(PopoverTrigger, { 'data-testid': 'trigger' }, () => 'Share'),
            h(PopoverContent, { dir, side: 'start', 'aria-label': 'Share' }, () => 'Body'),
          ]),
        ),
      ]);
      await settle();
      await waitFor(() => {
        expect(placedRightOfAnchor(screen.getByRole('dialog'))).toBe(right);
      });
    },
  );

  it('puts the provided direction on the host without an own dir', async () => {
    mountView(() => [
      h(Provided, null, () =>
        h(PopoverRoot, { open: true }, () => [
          h(PopoverTrigger, null, () => 'Share'),
          h(PopoverContent, { 'aria-label': 'Share' }, () => 'Body'),
        ]),
      ),
    ]);
    await settle();
    expect(host()?.getAttribute('dir')).toBe('ltr');
  });
});
