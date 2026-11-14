// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { defineComponent, h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideDirection } from '@cocokits/vue-core';
import { placedRightOfAnchor, stubLayout } from '../../internal/tests/stub-layout';
import { menu, menuView, mountView, settle, stubOverlayBrowser, trigger } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Menu placement', () => {
  it('opens on the bottom of the trigger, aligned to its start', async () => {
    mountView(menuView({ rootProps: { defaultOpen: true } }));
    await settle();
    expect(menu()?.getAttribute('data-side')).toBe('bottom');
    expect(menu()?.getAttribute('data-align')).toBe('start');
  });

  it.each([
    ['top', 'end'],
    ['end', 'center'],
    ['start', 'start'],
  ] as const)('renders the requested side %s and alignment %s', async (side, align) => {
    mountView(menuView({ rootProps: { defaultOpen: true }, contentProps: { side, align } }));
    await settle();
    expect(menu()?.getAttribute('data-side')).toBe(side);
    expect(menu()?.getAttribute('data-align')).toBe(align);
  });

  it('reports the side it flipped to when there is no room', async () => {
    // The trigger sits in the top left corner of a 1000 by 800 viewport; the content is 50 by 40 px.
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      return this === trigger() ? new DOMRect(0, 0, 100, 20) : new DOMRect(0, 0, 50, 40);
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(50);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(40);
    vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(1000);
    vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(800);
    mountView(menuView({ rootProps: { defaultOpen: true }, contentProps: { side: 'top' } }));
    await settle();
    expect(menu()?.getAttribute('data-side')).toBe('bottom');
  });

  it('passes the offsets to the placement', async () => {
    stubLayout(() => document.querySelector('.cck-menu__trigger'));
    mountView(menuView({ rootProps: { defaultOpen: true }, contentProps: { side: 'bottom', sideOffset: 20 } }));
    await settle();
    const placed = menu()?.closest<HTMLElement>('[style*="top"]') ?? menu();
    expect(Number.parseFloat(placed?.style.top ?? '0')).toBeGreaterThanOrEqual(140);
  });
});

describe.each([
  ['ltr', false],
  ['rtl', true],
] as const)('Menu direction (%s)', (dir, startIsRight) => {
  it(`puts side="start" ${startIsRight ? 'right' : 'left'} of the trigger`, async () => {
    stubLayout(() => document.querySelector('.cck-menu__trigger'));
    const Page = defineComponent({
      setup() {
        provideDirection(dir);
        return menuView({ rootProps: { defaultOpen: true }, contentProps: { side: 'start' } });
      },
    });
    mountView(() => [h(Page)]);
    await settle();
    const content = menu();
    expect(content?.getAttribute('data-side')).toBe('start');
    expect(content === null ? undefined : placedRightOfAnchor(content)).toBe(startIsRight);
  });
});
