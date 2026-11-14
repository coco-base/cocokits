// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, render, screen } from '@testing-library/vue';
import { h, type Component, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MenuContent as BaseMenuContent } from '@cocokits/vue/menu';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '../src/index';
import { themed } from './helpers';

beforeEach(() => {
  HTMLElement.prototype.showPopover = function showPopover(this: HTMLElement): void {
    this.style.display = 'block';
  };
  HTMLElement.prototype.hidePopover = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const options = cocokitsThemeConfig.components.menu;
const example = (props: Record<string, unknown> = {}): VNode =>
  h(MenuRoot as Component, null, () => [
    h(MenuTrigger as Component, null, () => 'Actions'),
    h(MenuContent as Component, props, () => [
      h(MenuItem as Component, null, () => 'Rename'),
      h(MenuItem as Component, { disabled: true }, () => 'Move'),
    ]),
  ]);

async function open(component: Component): Promise<HTMLElement> {
  render(component);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Actions' }));
  const content = document.querySelector<HTMLElement>('.cck-menu__content');
  if (!content) throw new Error('no .cck-menu__content');
  return content;
}

describe('theme menu', () => {
  it('renders the themed content, not the base one', () => {
    expect(MenuContent).not.toBe(BaseMenuContent);
  });

  it('renders the config default on the content, on no other part', async () => {
    const content = await open(themed(() => example()));
    expect(content.getAttribute('data-size')).toBe('md');
    expect(document.querySelectorAll('[data-size]')).toHaveLength(1);
  });

  it.each(options.size.values)('moves size %s to data-size', async (value) => {
    const content = await open(themed(() => example({ size: value })));
    expect(content.getAttribute('data-size')).toBe(value);
  });

  it('removes the attribute with null', async () => {
    const content = await open(themed(() => example({ size: null })));
    expect(content.hasAttribute('data-size')).toBe(false);
  });

  it('lets a provider override win over the default, and the own prop over the override', async () => {
    const overrides = { menu: { size: 'lg' } };
    expect((await open(themed(() => example(), overrides))).getAttribute('data-size')).toBe('lg');
    cleanup();
    expect((await open(themed(() => example({ size: 'sm' }), overrides))).getAttribute('data-size')).toBe('sm');
  });

  it('renders no theme attribute without a provider', async () => {
    const content = await open(example());
    expect(content.hasAttribute('data-size')).toBe(false);
  });

  it('keeps the base behaviour: the menu role, the items, native attributes and the side default', async () => {
    const content = await open(themed(() => example({ class: 'wide' })));
    expect(content.getAttribute('role')).toBe('menu');
    expect(content.classList.contains('wide')).toBe(true);
    expect(content.getAttribute('data-side')).toBe('bottom');
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });
});
