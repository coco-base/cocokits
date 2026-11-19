// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
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
/** The parts that take the item colour: the four kinds of item. */
const THEMED_ITEMS = ['Item', 'CheckboxItem', 'RadioItem', 'SubTrigger'] as const;
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
    for (const part of THEMED_ITEMS) expect(Menu[part]).not.toBe(BaseMenu[part]);
    for (const part of Object.keys(BaseMenu).filter(
      (name) => name !== 'Content' && !THEMED_ITEMS.includes(name as never),
    )) {
      expect(Menu[part as keyof typeof Menu], part).toBe(BaseMenu[part as keyof typeof BaseMenu]);
    }
    for (const part of THEMED_ITEMS) expect(Menu[part].displayName).toBe(`Menu.${part}`);
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

const color = options.color;
const kinds = (props: { readonly color?: 'default' | 'danger' | null }): ReactElement => (
  <Menu.Root>
    <Menu.Trigger>Actions</Menu.Trigger>
    <Menu.Content size="lg">
      <Menu.Item {...props}>Rename</Menu.Item>
      <Menu.CheckboxItem {...props}>Hidden</Menu.CheckboxItem>
      <Menu.RadioGroup>
        <Menu.RadioItem value="a" {...props}>
          A
        </Menu.RadioItem>
      </Menu.RadioGroup>
      <Menu.Sub>
        <Menu.SubTrigger {...props}>Share</Menu.SubTrigger>
        <Menu.SubContent>
          <Menu.Item>Email</Menu.Item>
        </Menu.SubContent>
      </Menu.Sub>
    </Menu.Content>
  </Menu.Root>
);
const itemElements = (): HTMLElement[] => [
  ...document.querySelectorAll<HTMLElement>('[role=menuitem], [role=menuitemcheckbox], [role=menuitemradio]'),
];

describe('theme menu items: color', () => {
  it('has a color option on the four kinds of item that defaults to default', () => {
    expect(color.attrName).toBe('color');
    expect(color.default).toBe('default');
    expect(color.values).toEqual(['default', 'danger']);
  });

  const colorRows: readonly (readonly [string, { readonly color?: 'default' | 'danger' | null }, string])[] = [
    ['the config default', {}, 'default'],
    ...color.values.map((value) => [`color ${value}`, { color: value }, value] as const),
  ];

  it.each(colorRows)('renders %s as data-color on each of the four kinds of item', async (_name, props, expected) => {
    await open(themed(kinds(props)));
    const elements = itemElements().slice(0, 4);
    expect(elements.map((element) => element.getAttribute('role'))).toEqual([
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'menuitem',
    ]);
    for (const element of elements) expect(element.getAttribute('data-color')).toBe(expected);
  });

  it('removes the attribute with null and keeps it off the content', async () => {
    const content = await open(themed(kinds({ color: null })));
    for (const element of itemElements().slice(0, 4)) expect(element.hasAttribute('data-color')).toBe(false);
    expect(content.hasAttribute('data-color')).toBe(false);
  });

  it('lets a provider override win over the default, and the own prop over the override', async () => {
    const overrides = { menu: { color: 'danger' } } as const;
    const wrap = (ui: ReactElement): ReactElement => (
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={overrides}>
        {ui}
      </ThemeProvider>
    );
    await open(wrap(kinds({})));
    expect(itemElements()[0]?.getAttribute('data-color')).toBe('danger');
    cleanup();
    await open(wrap(kinds({ color: 'default' })));
    expect(itemElements()[0]?.getAttribute('data-color')).toBe('default');
  });

  it('renders no theme attribute without a provider', async () => {
    await open(kinds({ color: 'danger' }));
    for (const element of itemElements().slice(0, 4)) expect(element.hasAttribute('data-color')).toBe(false);
  });

  it('gives the submenu content the size of the menu that holds its sub-trigger', async () => {
    await open(themed(kinds({})));
    // The menu moves the focus to its first item a frame after it opens; focus the sub-trigger only after that.
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getAllByRole('menuitem')[0]);
    });
    const share = screen.getByRole('menuitem', { name: 'Share' });
    share.focus();
    await userEvent.setup().keyboard('{ArrowRight}');
    // The submenu opens after the key press, so wait for it (a longer limit than the 1 s default, for parallel load).
    await waitFor(
      () => {
        expect(document.querySelector('.cck-menu__sub-content')?.getAttribute('data-size')).toBe('lg');
      },
      { timeout: 5000 },
    );
  });

  it('keeps the indicator, leading, trailing, supporting text and shortcut as base parts with no theme attribute', async () => {
    const ui = themed(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.CheckboxItem>
            <Menu.ItemIndicator />
            <Menu.ItemLeading>L</Menu.ItemLeading>
            Hidden
            <Menu.ItemSupportingText>s</Menu.ItemSupportingText>
            <Menu.ItemShortcut>K</Menu.ItemShortcut>
            <Menu.ItemTrailing>T</Menu.ItemTrailing>
          </Menu.CheckboxItem>
        </Menu.Content>
      </Menu.Root>,
    );
    await open(ui);
    for (const part of ['item-indicator', 'item-leading', 'item-supporting-text', 'item-shortcut', 'item-trailing']) {
      const element = document.querySelector(`.cck-menu__${part}`);
      expect(element, part).not.toBeNull();
      expect(element?.getAttributeNames().filter((name) => name.startsWith('data-') && name !== 'data-state')).toEqual(
        [],
      );
    }
  });
});
