'use client';

import type { ReactElement } from 'react';
import { Chip as BaseChip, type ChipProps as BaseChipProps } from '@cocokits/react/chip';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type ChipOptions = CocokitsThemeConfig['components']['chip'];

/** The `size` values of the cocokits theme. */
export type ChipSize = ChipOptions['size']['values'][number];

/** Props of the themed {@link Chip}: the base props plus the cocokits `size`. */
export interface ChipProps extends BaseChipProps {
  /**
   * Height of the chip.
   */
  readonly size?: ChipSize | null | undefined;
}

function ThemedChip({ size, ...props }: ChipProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="chip" options={{ size }}>
      <BaseChip {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Chip} component and its `displayName`. */
interface ChipComponent {
  (props: ChipProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Chip. It renders the base Chip and supplies `size` to it, which renders `data-size` on the root.
 * The option resolves in order: the prop, then the `ThemeProvider` override, then the config default; `null`
 * removes the attribute. Inside a `ChipList` the list sets the height of its chips. The remove button draws the
 * icon the theme names in `components.chip.icons.remove`. The theme needs a `ThemeProvider`.
 *
 * @example
 * <Chip size="lg" removable onRemove={() => undefined}>
 *   Pizza
 * </Chip>
 * @cckPart root
 */
export const Chip: ChipComponent = Object.assign(ThemedChip, { displayName: 'Chip' });
