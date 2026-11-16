'use client';

import { useContext, type ReactElement } from 'react';
import { ChipList as BaseChipList, type ChipListProps as BaseChipListProps } from '@cocokits/react/chip-list';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import { resolveInheritedValue, type CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { FormFieldThemeContext } from './theme-contexts';

type ChipListOptions = CocokitsThemeConfig['components']['chip-list'];

/** The `size` values of the cocokits theme. */
export type ChipListSize = ChipListOptions['size']['values'][number];

/** Props of the themed {@link ChipList}: the base props plus the cocokits `size`. */
export interface ChipListProps extends BaseChipListProps {
  /**
   * Height of its text box and its row. Inside a `FormField` it takes the size of the field.
   */
  readonly size?: ChipListSize | null | undefined;
}

function ThemedChipList({ size, ...props }: ChipListProps): ReactElement {
  const field = useContext(FormFieldThemeContext);
  const resolved = resolveInheritedValue(size, field.size);
  return (
    <ThemeOptionsProvider componentName="chip-list" options={{ size: resolved }}>
      <BaseChipList {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link ChipList} component and its `displayName`. */
interface ChipListComponent {
  (props: ChipListProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits ChipList. It renders the base ChipList and supplies `size` to it, which renders `data-size` on the
 * root; the theme sizes the row and the text box from it. The chips the list renders keep the size of a chip. The
 * option resolves in order: the prop, then the size of the `FormField` around it, then the `ThemeProvider` override,
 * then the config default; `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <ChipList size="lg" aria-label="Toppings" defaultValue={['Ham']} />
 * @cckPart root
 */
export const ChipList: ChipListComponent = Object.assign(ThemedChipList, { displayName: 'ChipList' });
