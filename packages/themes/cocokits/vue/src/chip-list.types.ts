import type { ChipListProps as BaseChipListProps } from '@cocokits/vue/chip-list';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type ChipListOptions = CocokitsThemeConfig['components']['chip-list'];

/** The `size` values of the cocokits theme. */
export type ChipListSize = ChipListOptions['size']['values'][number];

/**
 * Props of the cocokits ChipList. It renders the base ChipList and supplies `size` to it, which renders
 * `data-size` on the root; the theme sizes the row and the text box from it. The chips the list renders keep the size
 * of a chip. The option resolves as own option, then the size of the `FormField` around it, then `ThemeProvider`
 * override, then config default; `null` removes the attribute. Native attributes and listeners fall through to the root.
 *
 * @example
 * <ChipList v-model="toppings" size="lg" aria-label="Toppings" />
 * @cckPart root
 */
export interface ChipListProps extends BaseChipListProps {
  /**
   * Height of its text box and its row. Inside a `FormField` it takes the size of the field.
   */
  readonly size?: ChipListSize | null | undefined;
}
