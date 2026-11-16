'use client';

import { useContext, type ReactElement } from 'react';
import { Select as BaseSelect, type SelectRootProps as BaseSelectRootProps } from '@cocokits/react/select';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import { inherited, type CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { FormFieldThemeContext } from './theme-contexts';

type SelectOptions = CocokitsThemeConfig['components']['select'];

/** The `size` values of the cocokits theme. */
export type SelectSize = SelectOptions['size']['values'][number];
/** The `indicator` values of the cocokits theme. */
export type SelectIndicator = SelectOptions['indicator']['values'][number];

/** Props of the themed {@link Select.Root}: the base props plus the two cocokits options. */
export interface SelectRootProps<T = string, M extends boolean = false> extends BaseSelectRootProps<T, M> {
  /**
   * Height, padding and text of the trigger. Inside a `FormField` it takes the size of the field.
   */
  readonly size?: SelectSize | null | undefined;
  /**
   * Mark of the selected option, rendered on the list: a check after the text, a box before it, or none. Without it
   * a single list shows a check and a multiple list a box.
   */
  readonly indicator?: SelectIndicator | null | undefined;
}

function ThemedSelectRoot<T = string, M extends boolean = false>({
  size,
  indicator,
  ...props
}: SelectRootProps<T, M>): ReactElement {
  const field = useContext(FormFieldThemeContext);
  return (
    <ThemeOptionsProvider componentName="select" options={{ size: inherited(size, field.size), indicator }}>
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
 * The cocokits Select root. It renders the base Select root and supplies `size` and `indicator` to it, which render
 * `data-size` on the root and `data-indicator` on the list. Each option resolves in order: the prop, then (for
 * `size`) the size of the `FormField` around it, then the `ThemeProvider` override, then the config default; `null`
 * removes the attribute. The theme needs a `ThemeProvider`.
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
