import type { ChipProps as BaseChipProps } from '@cocokits/vue/chip';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type ChipOptions = CocokitsThemeConfig['components']['chip'];

/** The `size` values of the cocokits theme. */
export type ChipSize = ChipOptions['size']['values'][number];

/**
 * Props of the cocokits Chip. It renders the base Chip and supplies `size` to it, which renders `data-size` on the
 * root. The option resolves as own option, then `ThemeProvider` override, then config default; `null` removes the
 * attribute. Inside a `ChipList` the list sets the height of its chips. The remove button draws the icon the theme
 * names in `components.chip.icons.remove`. Native attributes and listeners fall through to the root.
 *
 * @example
 * <Chip size="lg" removable @remove="remove('Pizza')">Pizza</Chip>
 * @cckPart root
 */
export interface ChipProps extends BaseChipProps {
  /**
   * Height of the chip.
   */
  readonly size?: ChipSize | null | undefined;
}
