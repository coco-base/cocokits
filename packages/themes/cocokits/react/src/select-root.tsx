'use client';

import type { ReactElement } from 'react';
import { Select as BaseSelect, type SelectRootProps as BaseSelectRootProps } from '@cocokits/react/select';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type SelectOptions = CocokitsThemeConfig['components']['select'];

/** The `size` values of the cocokits theme. */
export type SelectSize = SelectOptions['size']['values'][number];

/** Props of the themed {@link Select.Root}: the base props plus the cocokits `size`. */
export interface SelectRootProps<T = string, M extends boolean = false> extends BaseSelectRootProps<T, M> {
  /**
   * Height, padding and text of the trigger.
   */
  readonly size?: SelectSize | null | undefined;
}

function ThemedSelectRoot<T = string, M extends boolean = false>({
  size,
  ...props
}: SelectRootProps<T, M>): ReactElement {
  return (
    <ThemeOptionsProvider componentName="select" options={{ size }}>
      <BaseSelect.Root<T, M> {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Select.Root}: a generic function component with its `displayName`. */
export interface SelectRootComponent {
  <T = string, M extends boolean = false>(props: SelectRootProps<T, M>): ReactElement;
  displayName: string;
}

/**
 * The cocokits Select root. It renders the base Select root and supplies `size` to it, which renders `data-size`
 * on the root. The option resolves in order: the prop, then the `ThemeProvider` override, then the config default;
 * `null` removes the attribute. Inside a `FormField` the field sets the size of the trigger. The theme needs a
 * `ThemeProvider`.
 *
 * @example
 * <Select.Root size="lg">
 *   <Select.Trigger aria-label="Dish">
 *     <Select.Value placeholder="Choose a dish" />
 *     <Select.Icon />
 *   </Select.Trigger>
 *   <Select.Content>
 *     <Select.Item value="Cake"><Select.ItemIndicator /><Select.ItemText>Cake</Select.ItemText></Select.Item>
 *   </Select.Content>
 * </Select.Root>
 * @typeParam T - The type of an item's value. Defaults to `string`.
 * @typeParam M - The type of `multiple`: `true` makes the value a list. Defaults to `false`.
 * @cckPart root
 */
export const SelectRoot: SelectRootComponent = Object.assign(ThemedSelectRoot, { displayName: 'Select.Root' });
