// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tooltipMeta } from '@cocokits/machines/tooltip';
import { TooltipContent, TooltipDescription, TooltipRoot, TooltipTitle, TooltipTrigger } from '../index';
import {
  accessibleDescription,
  elementById,
  mountView,
  settle,
  stubOverlayBrowser,
  tooltipDescription,
  shownContent,
} from './fixtures';

beforeEach(() => {
  stubOverlayBrowser();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

/** A tooltip whose content is the given nodes. */
function view(content: () => (VNode | string)[] | string, rootProps: Record<string, unknown> = {}) {
  return () =>
    h(TooltipRoot, rootProps, () => [
      h(TooltipTrigger, { id: 'trigger', 'aria-label': 'Save' }, () => 'Save'),
      h(TooltipContent, null, content),
    ]);
}

const titled = (): VNode[] => [
  h(TooltipTitle, null, () => 'Save the draft'),
  h(TooltipDescription, null, () => 'Ctrl+S saves it'),
];

describe('Tooltip title and description parts (tooltip-02)', () => {
  it('render divs with the part classes and no role, inside the tooltip content', async () => {
    mountView(view(titled, { open: true }));
    await settle();
    for (const [part, name] of [
      ['title', 'Save the draft'],
      ['description', 'Ctrl+S saves it'],
    ] as const) {
      const element = shownContent().querySelector(`.cck-tooltip__${part}`);
      expect(element?.tagName, part).toBe('DIV');
      expect(element?.hasAttribute('role'), part).toBe(false);
      expect(element?.textContent, part).toBe(name);
    }
    expect(tooltipMeta.defaultElements).toMatchObject({ title: 'div', description: 'div' });
    expect(tooltipMeta.roles).toMatchObject({ title: null, description: null });
  });

  it('describes the trigger by the title and the description, one after the other, closed or open', async () => {
    mountView(view(titled));
    await settle();
    expect(tooltipDescription()?.textContent).toBe('Save the draft Ctrl+S saves it');
    expect(accessibleDescription(elementById('trigger'))).toBe('Save the draft Ctrl+S saves it');
    cleanup();
    mountView(view(titled, { open: true }));
    await settle();
    expect(accessibleDescription(elementById('trigger'))).toBe('Save the draft Ctrl+S saves it');
  });

  it.each([
    { name: 'a title only', content: () => [h(TooltipTitle, null, () => 'Save the draft')], text: 'Save the draft' },
    { name: 'a description only', content: () => [h(TooltipDescription, null, () => 'Ctrl+S')], text: 'Ctrl+S' },
    {
      name: 'text before a description',
      content: () => ['Save ', h(TooltipDescription, null, () => 'Ctrl+S')],
      text: 'Save Ctrl+S',
    },
    { name: 'plain text', content: () => 'Save the draft', text: 'Save the draft' },
  ])('describes the trigger for $name', async ({ content, text }) => {
    mountView(view(content));
    await settle();
    expect(accessibleDescription(elementById('trigger'))).toBe(text);
  });

  it('gives no description text for a part with rich content', async () => {
    mountView(view(() => [h(TooltipTitle, null, () => h('strong', 'Save'))], { open: true }));
    await settle();
    expect(tooltipDescription()).toBeNull();
    expect(elementById('trigger').getAttribute('aria-describedby')).toBe(shownContent().id);
  });

  it('renders the element of as on a part', async () => {
    mountView(view(() => [h(TooltipTitle, { as: 'strong' }, () => 'Save')], { open: true }));
    await settle();
    expect(shownContent().querySelector('.cck-tooltip__title')?.tagName).toBe('STRONG');
  });
});
