// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, render, screen } from '@testing-library/react';
import { type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Menu as BaseMenu } from '@cocokits/react/menu';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Menu, type MenuContentProps } from '../src/index';
import { themed } from './helpers';

beforeEach(() => {
  HTMLElement.prototype.showPopover = function showPopover(this: HTMLElement): void {
    this.style.display = 'block';
  };
  HTMLElement.prototype.hidePopover = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const options = cocokitsThemeConfig.components.menu;
const example = (props: Partial<MenuContentProps> = {}): ReactElement => (
  <Menu.Root>
    <Menu.Trigger>Actions</Menu.Trigger>
    <Menu.Content {...props}>
      <Menu.Item>Rename</Menu.Item>
      <Menu.Item disabled>Move</Menu.Item>
    </Menu.Content>
  </Menu.Root>
);

async function open(ui: ReactElement): Promise<HTMLElement> {
  render(ui);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Actions' }));
  const content = document.querySelector<HTMLElement>('.cck-menu__content');
  if (!content) throw new Error('no .cck-menu__content');
  return content;
}

describe('theme menu', () => {
  it('has a displayName on the themed content and shares the base parts', () => {
    expect(Menu.Content.displayName).toBe('Menu.Content');
    expect(Object.keys(Menu).sort()).toEqual(Object.keys(BaseMenu).sort());
    for (const part of ['Root', 'Trigger', 'Item'] as const) expect(Menu[part]).toBe(BaseMenu[part]);
  });

  it('renders the config default on the content, on no other part', async () => {
    const content = await open(themed(example()));
    expect(content.getAttribute('data-size')).toBe('md');
    expect(document.querySelectorAll('[data-size]')).toHaveLength(1);
  });

  it.each(options.size.values)('moves size %s to data-size', async (value) => {
    const content = await open(themed(example({ size: value })));
    expect(content.getAttribute('data-size')).toBe(value);
  });

  it('removes the attribute with null', async () => {
    const content = await open(themed(example({ size: null })));
    expect(content.hasAttribute('data-size')).toBe(false);
  });

  it('lets a provider override win over the default, and the own prop over the override', async () => {
    const overrides = { menu: { size: 'lg' } } as const;
    const wrap = (ui: ReactElement): ReactElement => (
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={overrides}>
        {ui}
      </ThemeProvider>
    );
    expect((await open(wrap(example()))).getAttribute('data-size')).toBe('lg');
    cleanup();
    expect((await open(wrap(example({ size: 'sm' })))).getAttribute('data-size')).toBe('sm');
  });

  it('renders no theme attribute without a provider', async () => {
    const content = await open(example());
    expect(content.hasAttribute('data-size')).toBe(false);
  });

  it('keeps the base behaviour: the menu role, the items and native props', async () => {
    const content = await open(themed(example({ className: 'wide' })));
    expect(content.getAttribute('role')).toBe('menu');
    expect(content.classList.contains('wide')).toBe(true);
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });
});
