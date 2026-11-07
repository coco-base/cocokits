// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { createSSRApp, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startOverlayPosition, type OverlayPositionOptions } from '@cocokits/cdk/positioning';
import { item, mountView, selectRoot, settle, stubOverlayBrowser } from './fixtures';

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

const trigger = (): HTMLElement => screen.getByRole('combobox', { name: 'Dish' });
const list = (): HTMLElement | null => document.querySelector('.cck-select__content');
const lastOptions = (): OverlayPositionOptions => {
  const call = vi.mocked(startOverlayPosition).mock.calls.at(-1);
  if (!call) throw new Error('Positioning never started.');
  return call[0];
};

async function open(): Promise<void> {
  await userEvent.click(trigger());
  await settle();
}

describe('SelectContent positioning props', () => {
  it('passes nothing for an unset option', async () => {
    mountView(() => selectRoot());
    await open();
    expect(Object.keys(lastOptions()).sort()).toEqual(
      ['align', 'getAnchor', 'getContent', 'getDirection', 'onPlacementChange', 'side'].sort(),
    );
  });

  it('passes every set option to the positioning', async () => {
    const boundary = document.body.appendChild(document.createElement('div'));
    mountView(() =>
      selectRoot(
        {},
        {
          content: {
            sideOffset: 6,
            alignOffset: 3,
            avoidCollisions: false,
            collisionPadding: { top: 10 },
            sticky: 'always',
            hideWhenDetached: true,
            collisionBoundary: [boundary],
            updatePositionStrategy: 'always',
            sideFlip: false,
            alignFlip: false,
            prioritizePosition: true,
            disableUpdateOnLayoutShift: true,
          },
        },
      ),
    );
    await open();
    expect(lastOptions()).toMatchObject({
      sideOffset: 6,
      alignOffset: 3,
      avoidCollisions: false,
      collisionPadding: { top: 10 },
      sticky: 'always',
      hideWhenDetached: true,
      collisionBoundary: [boundary],
      updatePositionStrategy: 'always',
      sideFlip: false,
      alignFlip: false,
      prioritizePosition: true,
      disableUpdateOnLayoutShift: true,
    });
    expect(lastOptions()).not.toHaveProperty('getArrow');
  });

  it('hides the list while the anchor is detached, as it reports', async () => {
    mountView(() => selectRoot({}, { content: { hideWhenDetached: true } }));
    await open();
    lastOptions().onAnchorHiddenChange?.(true);
    await settle();
    expect(list()?.hasAttribute('hidden')).toBe(true);
    lastOptions().onAnchorHiddenChange?.(false);
    await settle();
    expect(list()?.hasAttribute('hidden')).toBe(false);
  });
});

describe('SelectContent forceMount', () => {
  const makeApp = (): App =>
    createSSRApp({
      render: () => h('div', [selectRoot({}, { content: { forceMount: true }, items: () => [item('Cake')] })]),
    });

  it('renders no list on the server', async () => {
    const html = await renderToString(makeApp());
    expect(html).not.toContain('cck-select__content');
    expect(html).not.toContain('role="listbox"');
  });

  it('hydrates without a mismatch and keeps the closed list in the document, hidden', async () => {
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
    expect(list()?.hasAttribute('hidden')).toBe(true);
    expect(list()?.getAttribute('data-state')).toBe('closed');
    expect(startOverlayPosition).not.toHaveBeenCalled();
    expect(container.querySelector('[role="combobox"]')?.getAttribute('aria-controls')).toBe(list()?.id);
  });

  it('shows the same element when it opens and hides it again after it closes', async () => {
    mountView(() => selectRoot({}, { content: { forceMount: true } }));
    await settle();
    const element = list();
    expect(element?.hasAttribute('hidden')).toBe(true);
    await open();
    expect(list()).toBe(element);
    expect(element?.hasAttribute('hidden')).toBe(false);
    expect(startOverlayPosition).toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(list()).toBe(element);
    expect(element?.hasAttribute('hidden')).toBe(true);
    expect(element?.getAttribute('data-state')).toBe('closed');
  });

  it('removes the list on close without forceMount', async () => {
    mountView(() => selectRoot());
    await open();
    expect(list()).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(list()).toBeNull();
  });
});
