import type { AvatarRootProps as BaseAvatarRootProps } from '@cocokits/vue/avatar';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type AvatarOptions = CocokitsThemeConfig['components']['avatar'];

/** The `size` values of the cocokits theme. */
export type AvatarSize = AvatarOptions['size']['values'][number];

/**
 * Props of the cocokits AvatarRoot. It renders the base AvatarRoot (a `<span>`) and supplies `size` to it, which
 * renders the `data-size` attribute. The option resolves as own option, then `ThemeProvider` override, then config
 * default; `null` removes the attribute. Inside an `AvatarGroup` or `AvatarLabel`, the size of the container wins.
 *
 * @example
 * <AvatarRoot size="lg">
 *   <AvatarImage src="/ada.webp" alt="Ada Lovelace" />
 *   <AvatarFallback>AL</AvatarFallback>
 * </AvatarRoot>
 * @cckPart root
 */
export interface AvatarRootProps extends BaseAvatarRootProps {
  /**
   * Side of the circle and size of the fallback text.
   */
  readonly size?: AvatarSize | null | undefined;
}
