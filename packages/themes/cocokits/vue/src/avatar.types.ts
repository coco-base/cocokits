import type { AvatarRootProps as BaseAvatarRootProps } from '@cocokits/vue/avatar';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type AvatarOptions = CocokitsThemeConfig['components']['avatar'];

/** The `size` values of the cocokits theme. */
export type AvatarSize = AvatarOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type AvatarColor = AvatarOptions['color']['values'][number];
/** The `shape` values of the cocokits theme. */
export type AvatarShape = AvatarOptions['shape']['values'][number];

/**
 * Props of the cocokits AvatarRoot. It renders the base AvatarRoot (a `<span>`) and supplies `size`, `color` and
 * `shape` to it, which render the `data-size`, `data-cck-color` and `data-shape` attributes. Each option resolves as
 * own option, then (for `size`) the one of the `AvatarLabel` or `AvatarGroup` around it, then `ThemeProvider`
 * override, then config default; `null` removes the attribute.
 *
 * @example
 * <AvatarRoot size="lg" shape="square">
 *   <AvatarImage src="/ada.webp" alt="Ada Lovelace" />
 *   <AvatarFallback>AL</AvatarFallback>
 * </AvatarRoot>
 * @cckPart root
 */
export interface AvatarRootProps extends BaseAvatarRootProps {
  /**
   * Side of the avatar and size of the fallback text.
   */
  readonly size?: AvatarSize | null | undefined;
  /**
   * Color family of the fallback, rendered as `data-cck-color`.
   */
  readonly color?: AvatarColor | null | undefined;
  /**
   * A circle, or a square with rounded corners, rendered as `data-shape`.
   */
  readonly shape?: AvatarShape | null | undefined;
}
