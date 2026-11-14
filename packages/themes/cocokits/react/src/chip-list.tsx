'use client';

import type { ReactElement } from 'react';
import { ChipList as BaseChipList, type ChipListProps as BaseChipListProps } from '@cocokits/react/chip-list';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type ChipListOptions = CocokitsThemeConfig['components']['chip-list'];

/** The `size` values of the cocokits theme. */
export type ChipListSize = ChipListOptions['size']['values'][number];

/** Props of the themed {@link ChipList}: the base props plus the cocokits `size`. */
export interface ChipListProps extends BaseChipListProps {
  /**
   * Height of its chips and its text box. Inside a `FormField` the field sets it.
   */
  readonly size?: ChipListSize | null | undefined;
}

function ThemedChipList({ size, ...props }: ChipListProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="chip-list" options={{ size }}>
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
 * root; the theme sizes the chips and the text box from it. The option resolves in order: the prop, then the
 * `ThemeProvider` override, then the config default; `null` removes the attribute. Inside a `FormField` the field
 * sets the size. The theme needs a `ThemeProvider`.
 *
 * @example
 * <ChipList size="lg" aria-label="Toppings" defaultValue={['Ham']} />
 * @cckPart root
 */
export const ChipList: ChipListComponent = Object.assign(ThemedChipList, { displayName: 'ChipList' });
