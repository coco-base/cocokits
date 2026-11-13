import type { AvatarLabelProps as BaseAvatarLabelProps } from '@cocokits/vue/avatar-label';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type AvatarLabelOptions = CocokitsThemeConfig['components']['avatar-label'];

/** The `size` values of the cocokits theme. */
export type AvatarLabelSize = AvatarLabelOptions['size']['values'][number];
/** The `avatarPosition` values of the cocokits theme. */
export type AvatarLabelAvatarPosition = AvatarLabelOptions['avatarPosition']['values'][number];
/** The `textLayout` values of the cocokits theme. */
export type AvatarLabelTextLayout = AvatarLabelOptions['textLayout']['values'][number];

/**
 * Props of the cocokits AvatarLabel. It renders the base AvatarLabel (a `<div>`) and supplies `size`,
 * `avatarPosition` and `textLayout` to it, which renders the `data-*` attributes. Each option resolves as own option,
 * then `ThemeProvider` override, then config default; `null` removes the attribute.
 *
 * @example
 * <AvatarLabel name="Ada Lovelace" description="Mathematician" size="lg" avatar-position="end">
 *   <AvatarRoot aria-hidden="true"><AvatarFallback>AL</AvatarFallback></AvatarRoot>
 * </AvatarLabel>
 * @cckPart root
 */
export interface AvatarLabelProps extends BaseAvatarLabelProps {
  /**
   * Gap, text size and the size of its direct avatar; it wins over its own size.
   */
  readonly size?: AvatarLabelSize | null | undefined;
  /**
   * Which side of the text the avatar sits on, in the writing direction.
   */
  readonly avatarPosition?: AvatarLabelAvatarPosition | null | undefined;
  /**
   * Name and description on two lines or side by side.
   */
  readonly textLayout?: AvatarLabelTextLayout | null | undefined;
}
