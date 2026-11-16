'use client';

import type { ReactElement } from 'react';
import {
  Menu as BaseMenu,
  type MenuCheckboxItemProps as BaseMenuCheckboxItemProps,
  type MenuItemProps as BaseMenuItemProps,
  type MenuRadioItemProps as BaseMenuRadioItemProps,
  type MenuSubTriggerProps as BaseMenuSubTriggerProps,
} from '@cocokits/react/menu';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type MenuOptions = CocokitsThemeConfig['components']['menu'];

/** The `color` values of the cocokits theme. */
export type MenuItemColor = MenuOptions['color']['values'][number];

/** The cocokits `color` of an item. */
interface MenuItemColorProp {
  /**
   * Colour of the item: the text colour, or the danger colour for an action that cannot be undone.
   */
  readonly color?: MenuItemColor | null | undefined;
}

/** Props of the themed {@link Menu.Item}: the base props plus the cocokits `color`. */
export interface MenuItemProps extends BaseMenuItemProps, MenuItemColorProp {}
/** Props of the themed {@link Menu.CheckboxItem}: the base props plus the cocokits `color`. */
export interface MenuCheckboxItemProps extends Omit<BaseMenuCheckboxItemProps, 'color'>, MenuItemColorProp {}
/** Props of the themed {@link Menu.RadioItem}: the base props plus the cocokits `color`. */
export interface MenuRadioItemProps extends Omit<BaseMenuRadioItemProps, 'color'>, MenuItemColorProp {}
/** Props of the themed {@link Menu.SubTrigger}: the base props plus the cocokits `color`. */
export interface MenuSubTriggerProps extends Omit<BaseMenuSubTriggerProps, 'color'>, MenuItemColorProp {}

/** A themed Menu item part: a function component with its `displayName`. */
export interface MenuItemComponent<P> {
  (props: P): ReactElement;
  displayName: string;
}

function ThemedMenuItem({ color, ...props }: MenuItemProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="menu" options={{ color }}>
      <BaseMenu.Item {...props} />
    </ThemeOptionsProvider>
  );
}

function ThemedMenuCheckboxItem({ color, ...props }: MenuCheckboxItemProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="menu" options={{ color }}>
      <BaseMenu.CheckboxItem {...props} />
    </ThemeOptionsProvider>
  );
}

function ThemedMenuRadioItem({ color, ...props }: MenuRadioItemProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="menu" options={{ color }}>
      <BaseMenu.RadioItem {...props} />
    </ThemeOptionsProvider>
  );
}

function ThemedMenuSubTrigger({ color, ...props }: MenuSubTriggerProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="menu" options={{ color }}>
      <BaseMenu.SubTrigger {...props} />
    </ThemeOptionsProvider>
  );
}

/**
 * The cocokits Menu item. It renders the base item and supplies `color` to it, which renders `data-color` on the
 * item. The option resolves in order: the prop, then the `ThemeProvider` override, then the config default; `null`
 * removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <Menu.Item color="danger">Delete</Menu.Item>
 * @cckPart item
 */
export const MenuItem: MenuItemComponent<MenuItemProps> = Object.assign(ThemedMenuItem, {
  displayName: 'Menu.Item',
});

/**
 * The cocokits Menu checkbox item. It renders the base checkbox item and supplies `color` to it, which renders
 * `data-color` on the item. The option resolves as the one of {@link Menu.Item}.
 *
 * @example
 * <Menu.CheckboxItem color="danger">Remove from the list</Menu.CheckboxItem>
 * @cckPart checkboxItem
 */
export const MenuCheckboxItem: MenuItemComponent<MenuCheckboxItemProps> = Object.assign(ThemedMenuCheckboxItem, {
  displayName: 'Menu.CheckboxItem',
});

/**
 * The cocokits Menu radio item. It renders the base radio item and supplies `color` to it, which renders
 * `data-color` on the item. The option resolves as the one of {@link Menu.Item}.
 *
 * @example
 * <Menu.RadioItem value="small" color="danger">Small</Menu.RadioItem>
 * @cckPart radioItem
 */
export const MenuRadioItem: MenuItemComponent<MenuRadioItemProps> = Object.assign(ThemedMenuRadioItem, {
  displayName: 'Menu.RadioItem',
});

/**
 * The cocokits Menu sub-trigger. It renders the base sub-trigger and supplies `color` to it, which renders
 * `data-color` on the item. The option resolves as the one of {@link Menu.Item}.
 *
 * @example
 * <Menu.SubTrigger color="danger">Danger zone</Menu.SubTrigger>
 * @cckPart subTrigger
 */
export const MenuSubTrigger: MenuItemComponent<MenuSubTriggerProps> = Object.assign(ThemedMenuSubTrigger, {
  displayName: 'Menu.SubTrigger',
});
