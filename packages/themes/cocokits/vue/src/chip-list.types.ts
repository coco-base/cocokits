import type { ChipListProps as BaseChipListProps } from '@cocokits/vue/chip-list';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type ChipListOptions = CocokitsThemeConfig['components']['chip-list'];

/** The `size` values of the cocokits theme. */
export type ChipListSize = ChipListOptions['size']['values'][number];

/**
 * Props of the cocokits ChipList. It renders the base ChipList and supplies `size` to it, which renders
 * `data-size` on the root; the theme sizes the chips and the text box from it. The option resolves as own option,
 * then `ThemeProvider` override, then config default; `null` removes the attribute. Inside a `FormField` the field
 * sets the size. Native attributes and listeners fall through to the root.
 *
 * @example
 * <ChipList v-model="toppings" size="lg" aria-label="Toppings" />
 * @cckPart root
 */
export interface ChipListProps extends BaseChipListProps {
  /**
   * Height of its chips and its text box.
   */
  readonly size?: ChipListSize | null | undefined;
}
