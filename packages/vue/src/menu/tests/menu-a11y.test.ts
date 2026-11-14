// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { menuAnatomy, menuMeta } from '@cocokits/machines/menu';
import { Divider } from '../../divider';
import { undeclaredData } from '../../internal/tests/declared-data';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '../index';
import { item, menu, mountView, open, settle, stubOverlayBrowser, trigger } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

// A menu is no landmark: the page-level `region` rule asks for one around the host of every overlay.
const WITHOUT_REGION = { rules: { region: { enabled: false } } };

const withDivider =
  (triggerProps: Record<string, unknown> = {}, text = 'Actions') =>
  () => [
    h(MenuRoot, null, () => [
      h(MenuTrigger, triggerProps, () => text),
      h(MenuContent, null, () => [
        h(MenuItem, null, () => 'Edit'),
        h(Divider),
        h(MenuItem, { disabled: true }, () => 'Move'),
        h(MenuItem, null, () => 'Delete'),
      ]),
    ]),
  ];

describe('Menu accessibility (axe)', () => {
  it('has no violations closed', async () => {
    mountView(withDivider());
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it('has no violations open, with items, a Divider and a disabled item', async () => {
    mountView(withDivider());
    await open();
    expect(menu()).not.toBeNull();
    expect((await axe(document.body, WITHOUT_REGION)).violations).toEqual([]);
  });

  it('names the menu by the trigger text', async () => {
    mountView(withDivider());
    await open();
    expect(menu()?.getAttribute('aria-labelledby')).toBe(trigger().id);
    expect(document.getElementById(menu()?.getAttribute('aria-labelledby') ?? '')?.textContent).toBe('Actions');
  });

  it('keeps the disabled item reachable: aria-disabled, not the disabled attribute', async () => {
    mountView(withDivider());
    await open();
    expect(item('Move').getAttribute('aria-disabled')).toBe('true');
    expect(item('Move').hasAttribute('disabled')).toBe(false);
  });
});

describe('Menu unnamed trigger', () => {
  it('warns once in development', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(withDivider({}, ''));
    await new Promise((resolve) => setTimeout(resolve, 50));
    const messages = warn.mock.calls.map((call) => String(call[0])).filter((text) => text.includes('MenuTrigger'));
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('no accessible name');
  });

  it('does not warn for a trigger with text or an aria-label', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(withDivider({ 'aria-label': 'More' }, ''));
    await settle();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('Menu data attributes', () => {
  it('renders the roles the meta declares', async () => {
    mountView(withDivider());
    await open();
    expect(menu()?.getAttribute('role')).toBe(menuMeta.roles.content);
    expect(item('Edit').getAttribute('role')).toBe(menuMeta.roles.item);
  });

  it('emits only the data-* the meta declares on each part, and every declared one that applies', async () => {
    mountView(withDivider());
    await open();
    const { undeclared, found } = undeclaredData(menuAnatomy.classes, menuMeta.dataAttrs);
    expect(found).toEqual(expect.arrayContaining(['trigger', 'content', 'item']));
    expect(undeclared).toEqual([]);
    for (const attribute of menuMeta.dataAttrs.content) expect(menu()?.hasAttribute(attribute)).toBe(true);
    for (const attribute of menuMeta.dataAttrs.trigger) expect(trigger().hasAttribute(attribute)).toBe(true);
  });
});
