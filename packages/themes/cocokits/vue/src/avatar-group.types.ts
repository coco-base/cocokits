import type { AvatarGroupProps as BaseAvatarGroupProps } from '@cocokits/vue/avatar-group';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type AvatarGroupOptions = CocokitsThemeConfig['components']['avatar-group'];

/** The `size` values of the cocokits theme. */
export type AvatarGroupSize = AvatarGroupOptions['size']['values'][number];

/**
 * Props of the cocokits AvatarGroup. It renders the base AvatarGroup (a `<div>`) and supplies `size` to it, which
 * renders the `data-size` attribute. The option resolves as own option, then `ThemeProvider` override, then config
 * default; `null` removes the attribute.
 *
 * @example
 * <AvatarGroup size="sm" role="group" aria-label="Team">
 *   <AvatarRoot><AvatarFallback>AL</AvatarFallback></AvatarRoot>
 *   <AvatarRoot><AvatarFallback>GH</AvatarFallback></AvatarRoot>
 * </AvatarGroup>
 * @cckPart root
 */
export interface AvatarGroupProps extends BaseAvatarGroupProps {
  /**
   * Overlap, ring and the size of its direct avatars; it wins over their own size.
   */
  readonly size?: AvatarGroupSize | null | undefined;
}
