// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { defineComponent, h, nextTick, ref, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as positioning from '@cocokits/cdk/positioning';
import { PopoverAnchor, PopoverContent, PopoverRoot, PopoverTrigger } from '../index';
import { mountView, settle, stubOverlayBrowser, trigger } from './fixtures';

vi.mock('@cocokits/cdk/positioning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@cocokits/cdk/positioning')>();
  return { ...actual, startOverlayPosition: vi.fn(actual.startOverlayPosition) };
});
const start = vi.mocked(positioning.startOverlayPosition);

beforeEach(() => {
  stubOverlayBrowser();
  start.mockClear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

type Options = Parameters<typeof positioning.startOverlayPosition>[0];
function lastOptions(): Options {
  const call = start.mock.calls.at(-1);
  if (!call) throw new Error('positioning was not started');
  return call[0];
}

function view(options: {
  anchor?: () => VNode | VNode[] | null;
  contentProps?: Record<string, unknown>;
  open?: boolean;
}): () => VNode[] {
  return () => [
    h(PopoverRoot, { open: options.open ?? true }, () => [
      options.anchor?.() ?? null,
      h(PopoverTrigger, null, () => 'Share'),
      h(PopoverContent, { 'aria-label': 'Share', ...options.contentProps }, () => 'Link copied'),
    ]),
  ];
}

describe('PopoverAnchor', () => {
  it('renders a div with the anchor class and no role', () => {
    mountView(view({ open: false, anchor: () => h(PopoverAnchor, { id: 'row' }, () => 'row') }));
    const anchor = document.getElementById('row');
    expect(anchor?.tagName).toBe('DIV');
    expect(anchor?.classList.contains('cck-popover__anchor')).toBe(true);
    expect(anchor?.hasAttribute('role')).toBe(false);
  });

  it('places the content against the anchor', async () => {
    mountView(view({ anchor: () => h(PopoverAnchor, { id: 'row' }, () => 'row') }));
    await settle();
    expect(lastOptions().getAnchor()).toBe(document.getElementById('row'));
  });

  it('places the content against the trigger without an anchor', async () => {
    mountView(view({}));
    await settle();
    expect(lastOptions().getAnchor()).toBe(trigger());
  });

  it('places the content against the trigger again when the anchor unmounts while open', async () => {
    const shown = ref(true);
    mountView(view({ anchor: () => (shown.value ? h(PopoverAnchor, { id: 'row' }, () => 'row') : null) }));
    await settle();
    expect(lastOptions().getAnchor()).toBe(document.getElementById('row'));
    shown.value = false;
    await settle();
    expect(lastOptions().getAnchor()).toBe(trigger());
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });

  it('uses the last anchor mounted', async () => {
    mountView(
      view({
        anchor: () => [h(PopoverAnchor, { id: 'one' }, () => '1'), h(PopoverAnchor, { id: 'two' }, () => '2')],
      }),
    );
    await settle();
    expect(lastOptions().getAnchor()).toBe(document.getElementById('two'));
  });

  it('prefers its reference over its own element', async () => {
    const virtual = { getBoundingClientRect: () => new DOMRect(1, 2, 3, 4) };
    mountView(view({ anchor: () => h(PopoverAnchor, { id: 'row', reference: virtual }, () => 'row') }));
    await settle();
    expect(lastOptions().getAnchor()).toBe(virtual);
  });

  it('prefers the reference of the content over the anchor', async () => {
    const virtual = { getBoundingClientRect: () => new DOMRect(1, 2, 3, 4) };
    const other = { getBoundingClientRect: () => new DOMRect(5, 6, 7, 8) };
    mountView(
      view({
        anchor: () => h(PopoverAnchor, { id: 'row', reference: virtual }, () => 'row'),
        contentProps: { reference: other },
      }),
    );
    await settle();
    expect(lastOptions().getAnchor()).toBe(other);
  });

  it('keeps aria-expanded on the trigger and closes on a press on the anchor', async () => {
    const open = ref(true);
    mountView(() => [
      h(PopoverRoot, { open: open.value, 'onUpdate:open': (value: boolean) => (open.value = value) }, () => [
        h(PopoverAnchor, { id: 'row' }, () => 'row'),
        h(PopoverTrigger, null, () => 'Share'),
        h(PopoverContent, { 'aria-label': 'Share' }, () => 'Link copied'),
      ]),
    ]);
    await settle();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById('row')?.hasAttribute('aria-expanded')).toBe(false);
    await userEvent.click(screen.getByText('row'));
    await settle();
    expect(open.value).toBe(false);
  });
});

describe('PopoverContent positioning props', () => {
  it('passes nothing for unset props, so the positioning defaults apply', async () => {
    mountView(view({}));
    await settle();
    const options = lastOptions();
    for (const key of [
      'sideOffset',
      'alignOffset',
      'avoidCollisions',
      'collisionPadding',
      'sticky',
      'hideWhenDetached',
    ]) {
      expect(options).not.toHaveProperty(key);
    }
  });

  it('passes the six props to the positioning', async () => {
    mountView(
      view({
        contentProps: {
          sideOffset: 12,
          alignOffset: 3,
          avoidCollisions: false,
          collisionPadding: { top: 4 },
          sticky: 'always',
          hideWhenDetached: true,
        },
      }),
    );
    await settle();
    expect(lastOptions()).toMatchObject({
      sideOffset: 12,
      alignOffset: 3,
      avoidCollisions: false,
      collisionPadding: { top: 4 },
      sticky: 'always',
      hideWhenDetached: true,
    });
  });

  it('does not restart for an equal padding object written inline', async () => {
    const tick = ref(0);
    const Parent = defineComponent({
      setup: () => () => [
        h('span', tick.value),
        h(PopoverRoot, { open: true }, () => [
          h(PopoverTrigger, null, () => 'Share'),
          h(PopoverContent, { 'aria-label': 'Share', collisionPadding: { top: 1, left: 2 } }, () => 'x'),
        ]),
      ],
    });
    mountView(() => h(Parent));
    await settle();
    const calls = start.mock.calls.length;
    tick.value += 1;
    await nextTick();
    await settle();
    expect(start.mock.calls.length).toBe(calls);
  });

  it('renders hidden while the anchor is reported hidden, and not otherwise', async () => {
    mountView(view({ contentProps: { hideWhenDetached: true } }));
    await settle();
    const options = lastOptions();
    // jsdom has no layout, so the real measure may already report the anchor hidden; set both states explicitly.
    options.onAnchorHiddenChange?.(false);
    await nextTick();
    expect(screen.getByRole('dialog').hasAttribute('hidden')).toBe(false);
    options.onAnchorHiddenChange?.(true);
    await nextTick();
    expect(screen.getByRole('dialog', { hidden: true }).hasAttribute('hidden')).toBe(true);
  });
});
