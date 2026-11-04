// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { createSSRApp, h, ref, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startOverlayPosition, type OverlayPositionOptions } from '@cocokits/cdk/positioning';
import { PopoverArrow, PopoverClose, PopoverContent, PopoverRoot, PopoverTrigger } from '../index';
import { byId, mountView, popoverView, settle, stubOverlayBrowser } from './fixtures';

vi.mock('@cocokits/cdk/positioning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@cocokits/cdk/positioning')>();
  return { ...actual, startOverlayPosition: vi.fn(actual.startOverlayPosition) };
});

let mounted: App | undefined;
beforeEach(() => {
  stubOverlayBrowser();
  vi.mocked(startOverlayPosition).mockClear();
});
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Share' });
const lastOptions = (): OverlayPositionOptions => {
  const call = vi.mocked(startOverlayPosition).mock.calls.at(-1);
  if (!call) throw new Error('Positioning never started.');
  return call[0];
};

async function open(): Promise<void> {
  await userEvent.click(trigger());
  await settle();
}

describe('PopoverArrow', () => {
  const withArrow = (arrowProps: Record<string, unknown> = {}, arrowSlots?: Record<string, () => unknown>) =>
    popoverView({ inner: () => [h('p', 'Link copied'), h(PopoverArrow, arrowProps, arrowSlots)] });

  it('renders inside the content a decorative span that holds the triangle', async () => {
    mountView(withArrow());
    await open();
    const arrow = document.querySelector<HTMLElement>('.cck-popover__arrow');
    expect(arrow?.tagName).toBe('SPAN');
    expect(arrow?.closest('[role="dialog"]')).not.toBeNull();
    expect(arrow?.getAttribute('aria-hidden')).toBe('true');
    expect(arrow?.hasAttribute('hidden')).toBe(false);
    const svg = arrow?.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 30 10');
    expect(svg?.getAttribute('width')).toBe('10');
    expect(svg?.getAttribute('height')).toBe('5');
    expect(svg?.querySelector('polygon')?.getAttribute('points')).toBe('0,0 30,0 15,10');
  });

  it('lets children replace the triangle and `as` choose the element', async () => {
    mountView(withArrow({ as: 'div' }, { default: () => h('circle', { r: 2 }) }));
    await open();
    const arrow = document.querySelector('.cck-popover__arrow');
    expect(arrow?.tagName).toBe('DIV');
    expect(arrow?.querySelector('polygon')).toBeNull();
    expect(arrow?.querySelector('circle')).not.toBeNull();
  });

  it('hands its element to the positioning and hides with `hidden` while it cannot point', async () => {
    mountView(withArrow());
    await open();
    const options = lastOptions();
    const arrow = document.querySelector<HTMLElement>('.cck-popover__arrow');
    expect(options.getArrow?.()).toBe(arrow);
    options.onArrowHiddenChange?.(true);
    await settle();
    expect(arrow?.hasAttribute('hidden')).toBe(true);
    options.onArrowHiddenChange?.(false);
    await settle();
    expect(arrow?.hasAttribute('hidden')).toBe(false);
  });

  it('passes no arrow to the positioning without a PopoverArrow', async () => {
    mountView(popoverView({}));
    await open();
    expect(lastOptions().getArrow?.() ?? null).toBeNull();
  });

  it('passes `arrowPadding` and `hideShiftedArrow` only when set', async () => {
    mountView(popoverView({}));
    await open();
    expect(lastOptions()).not.toHaveProperty('arrowPadding');
    expect(lastOptions()).not.toHaveProperty('hideShiftedArrow');
    cleanup();
    mountView(popoverView({ contentProps: { arrowPadding: 8, hideShiftedArrow: false } }));
    await open();
    expect(lastOptions()).toMatchObject({ arrowPadding: 8, hideShiftedArrow: false });
  });
});

describe('Popover positioning props', () => {
  it('passes nothing for an unset option', async () => {
    mountView(popoverView({}));
    await open();
    const keys = Object.keys(lastOptions());
    for (const name of [
      'collisionBoundary',
      'updatePositionStrategy',
      'sideFlip',
      'alignFlip',
      'prioritizePosition',
      'disableUpdateOnLayoutShift',
      'sideOffset',
    ]) {
      expect(keys).not.toContain(name);
    }
  });

  it('passes every set option to the positioning', async () => {
    const boundary = document.body.appendChild(document.createElement('div'));
    mountView(
      popoverView({
        contentProps: {
          collisionBoundary: [boundary, null],
          updatePositionStrategy: 'always',
          sideFlip: false,
          alignFlip: false,
          prioritizePosition: true,
          disableUpdateOnLayoutShift: true,
        },
      }),
    );
    await open();
    expect(lastOptions()).toMatchObject({
      collisionBoundary: [boundary],
      updatePositionStrategy: 'always',
      sideFlip: false,
      alignFlip: false,
      prioritizePosition: true,
      disableUpdateOnLayoutShift: true,
    });
  });

  it('does not restart the positioning when an inline boundary list renders again with the same elements', async () => {
    const boundary = document.body.appendChild(document.createElement('div'));
    const tick = ref(0);
    mountView(() => [h('span', tick.value), ...popoverView({ contentProps: { collisionBoundary: [boundary] } })()]);
    await open();
    const starts = vi.mocked(startOverlayPosition).mock.calls.length;
    tick.value += 1;
    await settle();
    expect(vi.mocked(startOverlayPosition).mock.calls.length).toBe(starts);
  });
});

describe('Popover modal', () => {
  it('is not modal by default: no aria-modal, nothing inert', async () => {
    mountView(popoverView({}));
    await open();
    expect(screen.getByRole('dialog').hasAttribute('aria-modal')).toBe(false);
    expect(byId('before').closest('[inert]')).toBeNull();
  });

  it('makes everything outside inert while open and restores it after the close', async () => {
    mountView(popoverView({ rootProps: { modal: true } }));
    await open();
    const content = screen.getByRole('dialog');
    expect(content.getAttribute('aria-modal')).toBe('true');
    expect(byId('before').closest('[inert]')).not.toBeNull();
    expect(byId('after').closest('[inert]')).not.toBeNull();
    expect(content.closest('[inert]')).toBeNull();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(document.querySelector('[inert]')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('wraps Tab inside the content', async () => {
    mountView(
      popoverView({
        rootProps: { modal: true },
        inner: () => [h('input', { 'aria-label': 'Name' }), h(PopoverClose, null, () => 'Close')],
      }),
    );
    await open();
    const input = screen.getByRole('textbox', { name: 'Name' });
    const close = screen.getByRole('button', { name: 'Close' });
    expect(document.activeElement).toBe(input);
    await userEvent.tab();
    expect(document.activeElement).toBe(close);
    await userEvent.tab();
    expect(document.activeElement).toBe(input);
    expect(screen.queryByRole('dialog')).not.toBeNull();
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(close);
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });

  it('closes on a press outside and releases the page', async () => {
    mountView(popoverView({ rootProps: { modal: true } }));
    await open();
    await userEvent.click(document.body);
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.querySelector('[inert]')).toBeNull();
  });

  it('keeps the mode it opened with until the next open', async () => {
    const modal = ref(false);
    mountView(() => popoverView({ rootProps: { modal: modal.value } })());
    await open();
    modal.value = true;
    await settle();
    expect(screen.getByRole('dialog').hasAttribute('aria-modal')).toBe(false);
    expect(document.querySelector('[inert]')).toBeNull();
  });

  it('does not make a popover opened from inside it inert', async () => {
    mountView(() => [
      h(PopoverRoot, { modal: true }, () => [
        h(PopoverTrigger, null, () => 'Share'),
        h(PopoverContent, { 'aria-label': 'Share' }, () =>
          h(PopoverRoot, null, () => [
            h(PopoverTrigger, null, () => 'Inner'),
            h(PopoverContent, { 'aria-label': 'Inner' }, () => h('p', 'inner text')),
          ]),
        ),
      ]),
    ]);
    await open();
    await userEvent.click(screen.getByRole('button', { name: 'Inner' }));
    await settle();
    const inner = screen.getByRole('dialog', { name: 'Inner' });
    expect(inner.closest('[inert]')).toBeNull();
  });
});

describe('Popover forceMount', () => {
  const makeApp = (): App =>
    createSSRApp({
      render: () =>
        h(PopoverRoot, null, () => [
          h(PopoverTrigger, null, () => 'Share'),
          h(PopoverContent, { forceMount: true, 'aria-label': 'Share' }, () => 'Link copied'),
        ]),
    });

  it('renders no content on the server and no guards', async () => {
    const html = await renderToString(makeApp());
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('Link copied');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('tabindex');
  });

  it('hydrates without a mismatch, then keeps the closed content in the document, hidden', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp());
    const serverHtml = container.innerHTML;
    mounted = makeApp();
    mounted.mount(container);
    expect(container.innerHTML).toBe(serverHtml);
    await settle();
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    const content = document.querySelector<HTMLElement>('[role="dialog"]');
    expect(content?.hasAttribute('hidden')).toBe(true);
    expect(content?.getAttribute('data-state')).toBe('closed');
    expect(container.querySelector('button')?.getAttribute('aria-controls')).toBe(content?.id);
  });

  it('keeps the element and its state across open and close, with no guards or positioning while closed', async () => {
    mountView(popoverView({ contentProps: { forceMount: true }, inner: () => h('input', { 'aria-label': 'Name' }) }));
    await settle();
    const content = document.querySelector<HTMLElement>('[role="dialog"]');
    expect(content?.hasAttribute('hidden')).toBe(true);
    expect(content?.previousElementSibling).toBeNull();
    expect(content?.nextElementSibling).toBeNull();
    expect(startOverlayPosition).not.toHaveBeenCalled();
    await open();
    expect(document.querySelector('[role="dialog"]')).toBe(content);
    expect(content?.hasAttribute('hidden')).toBe(false);
    expect(content?.getAttribute('data-state')).toBe('open');
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Name' });
    input.value = 'kept';
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(document.querySelector('[role="dialog"]')).toBe(content);
    expect(content?.hasAttribute('hidden')).toBe(true);
    expect(content?.previousElementSibling).toBeNull();
    expect(content?.contains(input)).toBe(true);
    expect(input.value).toBe('kept');
    expect(document.activeElement).toBe(trigger());
  });

  it('removes the content on close without forceMount', async () => {
    mountView(popoverView({}));
    await open();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
