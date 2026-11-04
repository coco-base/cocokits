// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, fireEvent, screen } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as positioning from '@cocokits/cdk/positioning';
import { TooltipContent, TooltipRoot, TooltipTrigger } from '../index';
import { elementById, mountView, shownContent, settle, stubOverlayBrowser, tooltipContent } from './fixtures';

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
const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Copy link' });

function view(options: { rootProps?: () => Record<string, unknown>; contentProps?: Record<string, unknown> }) {
  return () => [
    h('div', { id: 'scroller' }, [
      h(TooltipRoot, options.rootProps?.() ?? {}, () => [
        h(TooltipTrigger, { 'aria-label': 'Copy link' }, () => 'Copy'),
        h(TooltipContent, options.contentProps ?? {}, () => 'Copy the link'),
      ]),
    ]),
    h('div', { id: 'elsewhere' }),
  ];
}

describe('Tooltip scroll close', () => {
  it('closes on a scroll of an ancestor of the trigger, with update:open', async () => {
    const onUpdate = vi.fn();
    mountView(view({ rootProps: () => ({ defaultOpen: true, 'onUpdate:open': onUpdate }) }));
    await settle();
    expect(tooltipContent()).not.toBeNull();
    await fireEvent.scroll(elementById('scroller'));
    await settle();
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(false);
    expect(trigger().getAttribute('data-state')).toBe('closed');
  });

  it('closes on a scroll of the document', async () => {
    mountView(view({ rootProps: () => ({ defaultOpen: true }) }));
    await settle();
    await fireEvent.scroll(document);
    await settle();
    expect(trigger().getAttribute('data-state')).toBe('closed');
  });

  it('stays open when an unrelated element or the content scrolls', async () => {
    mountView(view({ rootProps: () => ({ defaultOpen: true }) }));
    await settle();
    await fireEvent.scroll(elementById('elsewhere'));
    await fireEvent.scroll(shownContent());
    await settle();
    expect(tooltipContent()?.getAttribute('data-state')).toBe('open');
  });

  it('stops listening once the tooltip is closed', async () => {
    const onUpdate = vi.fn();
    mountView(view({ rootProps: () => ({ defaultOpen: true, 'onUpdate:open': onUpdate }) }));
    await settle();
    await fireEvent.scroll(document);
    await settle();
    await fireEvent.scroll(document);
    await settle();
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });
});

describe('Tooltip disabled', () => {
  it('closes at once without update:open, and an unbound tooltip stays closed when it turns enabled', async () => {
    const onUpdate = vi.fn();
    const disabled = ref(false);
    mountView(view({ rootProps: () => ({ defaultOpen: true, disabled: disabled.value, 'onUpdate:open': onUpdate }) }));
    await settle();
    expect(trigger().getAttribute('data-state')).toBe('open');
    disabled.value = true;
    await settle();
    expect(trigger().getAttribute('data-state')).toBe('closed');
    expect(tooltipContent()).toBeNull();
    expect(onUpdate).not.toHaveBeenCalled();
    disabled.value = false;
    await settle();
    expect(trigger().getAttribute('data-state')).toBe('closed');
    expect(tooltipContent()).toBeNull();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('opens again by a user cause after it turned enabled', async () => {
    const user = userEvent.setup();
    const disabled = ref(false);
    mountView(view({ rootProps: () => ({ defaultOpen: true, disabled: disabled.value }) }));
    await settle();
    disabled.value = true;
    await settle();
    disabled.value = false;
    await settle();
    expect(tooltipContent()).toBeNull();
    await user.tab();
    await settle();
    expect(tooltipContent()).not.toBeNull();
  });

  it('leaves a controlled open to the parent', async () => {
    const onUpdate = vi.fn();
    const disabled = ref(false);
    mountView(view({ rootProps: () => ({ open: true, disabled: disabled.value, 'onUpdate:open': onUpdate }) }));
    await settle();
    disabled.value = true;
    await settle();
    expect(onUpdate).not.toHaveBeenCalled();
    expect(trigger().getAttribute('data-state')).toBe('closed');
    disabled.value = false;
    await nextTick();
    await settle();
    expect(trigger().getAttribute('data-state')).toBe('open');
  });
});

describe('Tooltip content positioning', () => {
  it('passes the six positioning props to startOverlayPosition', async () => {
    mountView(
      view({
        rootProps: () => ({ open: true }),
        contentProps: {
          sideOffset: 12,
          alignOffset: 4,
          avoidCollisions: false,
          collisionPadding: { top: 1, left: 2 },
          sticky: 'always',
          hideWhenDetached: true,
        },
      }),
    );
    await settle();
    expect(lastOptions()).toMatchObject({
      sideOffset: 12,
      alignOffset: 4,
      avoidCollisions: false,
      collisionPadding: { top: 1, left: 2 },
      sticky: 'always',
      hideWhenDetached: true,
    });
  });

  it('passes none of them when unset, so the positioning defaults apply', async () => {
    mountView(view({ rootProps: () => ({ open: true }) }));
    await settle();
    const options = lastOptions();
    for (const key of [
      'sideOffset',
      'alignOffset',
      'avoidCollisions',
      'collisionPadding',
      'sticky',
      'hideWhenDetached',
    ])
      expect(key in options).toBe(false);
  });
});
