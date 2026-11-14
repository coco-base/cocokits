import type { SvgIconProps as BaseSvgIconProps } from '@cocokits/vue/svg-icon';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type SvgIconOptions = CocokitsThemeConfig['components']['svg-icon'];

/** The `size` values of the cocokits theme. */
export type SvgIconSize = SvgIconOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type SvgIconColor = SvgIconOptions['color']['values'][number];
/** The `rtlMirror` values of the cocokits theme. */
export type SvgIconRtlMirror = SvgIconOptions['rtlMirror']['values'][number];

/**
 * Props of the cocokits SvgIcon. It renders the base icon, drawn from the icons you registered (for example with `IconProvider`), and supplies `size`, `color` and
 * `rtlMirror` to it. Each option resolves as own option, then `ThemeProvider` override, then config default;
 * `null` removes the attribute. Native attributes and listeners fall through to the root `<span>`.
 *
 * @example
 * <SvgIcon icon-name="heart" size="lg" color="danger" />
 * @cckPart root
 * @cckPart svg
 */
export interface SvgIconProps extends BaseSvgIconProps {
  /**
   * Size of the icon. When not set, the icon is `1em` and follows the font size.
   */
  readonly size?: SvgIconSize | null | undefined;
  /**
   * Color family, rendered as `data-cck-color`. When not set, the icon takes the text color.
   */
  readonly color?: SvgIconColor | null | undefined;
  /**
   * Mirrors the icon in a right-to-left context. Leave it off for an icon that is not directional.
   */
  readonly rtlMirror?: SvgIconRtlMirror | null | undefined;
}
