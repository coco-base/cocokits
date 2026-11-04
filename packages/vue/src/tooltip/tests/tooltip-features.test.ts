// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { createSSRApp, h, ref, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startOverlayPosition, type OverlayPositionOptions } from '@cocokits/cdk/positioning';
import { TooltipArrow, TooltipContent, TooltipRoot, TooltipTrigger } from '../index';
import { mountView, settle, stubOverlayBrowser, tooltipView } from './fixtures';

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

const lastOptions = (): OverlayPositionOptions => {
  const call = vi.mocked(startOverlayPosition).mock.calls.at(-1);
  if (!call) throw new Error('Positioning never started.');
  return call[0];
};
const content = (): HTMLElement | null => document.querySelector('.cck-tooltip__content');

describe('TooltipArrow', () => {
  const view =
    (contentProps: Record<string, unknown> = {}) =>
    () => [
      h(TooltipRoot, { open: true }, () => [
        h(TooltipTrigger, { 'aria-label': 'Copy link' }, () => 'Copy'),
        h(TooltipContent, contentProps, () => ['Copy the link', h(TooltipArrow)]),
      ]),
    ];

  it('renders inside the content a decorative span that holds the triangle', async () => {
    mountView(view());
    await settle();
    const arrow = document.querySelector<HTMLElement>('.cck-tooltip__arrow');
    expect(arrow?.tagName).toBe('SPAN');
    expect(arrow?.closest('.cck-tooltip__content')).toBe(content());
    expect(arrow?.getAttribute('aria-hidden')).toBe('true');
    expect(arrow?.querySelector('svg polygon')?.getAttribute('points')).toBe('0,0 30,0 15,10');
  });

  it('hands its element to the positioning and hides with `hidden` while it cannot point', async () => {
    mountView(view({ arrowPadding: 4 }));
    await settle();
    const options = lastOptions();
    const arrow = document.querySelector<HTMLElement>('.cck-tooltip__arrow');
    expect(options.getArrow?.()).toBe(arrow);
    expect(options.arrowPadding).toBe(4);
    options.onArrowHiddenChange?.(true);
    await settle();
    expect(arrow?.hasAttribute('hidden')).toBe(true);
    options.onArrowHiddenChange?.(false);
    await settle();
    expect(arrow?.hasAttribute('hidden')).toBe(false);
  });
});

describe('Tooltip positioning props', () => {
  it('passes nothing for an unset option', async () => {
    mountView(tooltipView({ rootProps: { open: true } }));
    await settle();
    const keys = Object.keys(lastOptions());
    for (const name of ['collisionBoundary', 'updatePositionStrategy', 'sideFlip', 'alignFlip', 'prioritizePosition']) {
      expect(keys).not.toContain(name);
    }
  });

  it('passes every set option to the positioning', async () => {
    const boundary = document.body.appendChild(document.createElement('div'));
    mountView(
      tooltipView({
        rootProps: { open: true },
        contentProps: {
          collisionBoundary: boundary,
          updatePositionStrategy: 'always',
          sideFlip: false,
          alignFlip: false,
          prioritizePosition: true,
          disableUpdateOnLayoutShift: true,
        },
      }),
    );
    await settle();
    expect(lastOptions()).toMatchObject({
      collisionBoundary: [boundary],
      updatePositionStrategy: 'always',
      sideFlip: false,
      alignFlip: false,
      prioritizePosition: true,
      disableUpdateOnLayoutShift: true,
    });
  });
});

describe('TooltipTrigger reference', () => {
  it('places the content against the reference, while the events stay on the trigger', async () => {
    const reference = document.body.appendChild(document.createElement('div'));
    mountView(() => [
      h(TooltipRoot, { open: true }, () => [
        h(TooltipTrigger, { reference, 'aria-label': 'Copy link' }, () => 'Copy'),
        h(TooltipContent, null, () => 'Copy the link'),
      ]),
    ]);
    await settle();
    expect(lastOptions().getAnchor()).toBe(reference);
    const trigger = document.querySelector<HTMLElement>('.cck-tooltip__trigger');
    expect(trigger?.getAttribute('data-state')).toBe('open');
    expect(trigger?.getAttribute('aria-describedby')).not.toBeNull();
  });

  it('places the content against the trigger without a reference', async () => {
    mountView(tooltipView({ rootProps: { open: true } }));
    await settle();
    expect(lastOptions().getAnchor()).toBe(document.querySelector('.cck-tooltip__trigger'));
  });
});

describe('Tooltip forceMount', () => {
  const makeApp = (): App =>
    createSSRApp({
      render: () =>
        h(TooltipRoot, { open: false }, () => [
          h(TooltipTrigger, { 'aria-label': 'Copy link' }, () => 'Copy'),
          h(TooltipContent, { forceMount: true }, () => 'Copy the link'),
        ]),
    });

  it('renders no content on the server', async () => {
    const html = await renderToString(makeApp());
    expect(html).not.toContain('cck-tooltip__content');
    expect(html).not.toContain('Copy the link');
  });

  it('hydrates without a mismatch and keeps the closed content in the document, hidden', async () => {
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
    expect(content()?.hasAttribute('hidden')).toBe(true);
    expect(content()?.getAttribute('data-state')).toBe('closed');
    expect(startOverlayPosition).not.toHaveBeenCalled();
  });

  it('shows the same element when it opens and hides it again after it closes', async () => {
    const open = ref(false);
    mountView(() => [
      h(TooltipRoot, { open: open.value }, () => [
        h(TooltipTrigger, { 'aria-label': 'Copy link' }, () => 'Copy'),
        h(TooltipContent, { forceMount: true }, () => h('input', { 'aria-label': 'x' })),
      ]),
    ]);
    await settle();
    const element = content();
    expect(element?.hasAttribute('hidden')).toBe(true);
    open.value = true;
    await settle();
    expect(content()).toBe(element);
    expect(element?.hasAttribute('hidden')).toBe(false);
    expect(startOverlayPosition).toHaveBeenCalled();
    const input = element?.querySelector('input');
    if (!input) throw new Error('No input.');
    input.value = 'kept';
    open.value = false;
    await settle();
    expect(content()).toBe(element);
    expect(element?.hasAttribute('hidden')).toBe(true);
    expect(element?.querySelector('input')).toBe(input);
    expect(input.value).toBe('kept');
  });
});
