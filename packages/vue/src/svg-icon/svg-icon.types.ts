/**
 * An icon of the provided theme, drawn by name. It renders a `<span>` with an `<svg>` that holds one `<path>` per
 * path of the icon.
 *
 * The icon data is the theme's (`ThemeConfig.icons`). It is bound as attributes only, never parsed or injected as
 * markup. It is in the server HTML.
 *
 * The icon is decorative by default: the root has `aria-hidden="true"`. Set `label` for a meaningful icon; the
 * root then has `role="img"` and that `aria-label`. Inside a button that has its own name, leave `label` out.
 *
 * Without a theme, or with a name the theme does not have, it renders an empty `<svg>` and, in development, logs a
 * `CocoKits:` error. It never throws. Native attributes and listeners fall through to the root `<span>`. It takes
 * no slot: the icon is drawn from `iconName`.
 *
 * Unstyled, the browser sizes an `<svg>` that has a `viewBox` and no size to its default and fills it black. Size
 * `.cck-svg-icon__svg` and set `fill: currentColor`.
 *
 * To add an icon of your own, or to change the icon of a part, provide an extended theme config, as the second
 * example shows.
 *
 * @example
 * <SvgIcon icon-name="heart" />
 *
 * @example
 * <script setup lang="ts">
 * import { SvgIcon } from '@cocokits/vue/svg-icon';
 * import { ThemeProvider } from '@cocokits/vue-core';
 * import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
 *
 * const logo = { viewBox: '0 0 24 24', paths: [{ d: 'M12 2 2 22h20z' }] };
 * const appTheme = { ...cocokitsThemeConfig, icons: { ...cocokitsThemeConfig.icons, logo } };
 * </script>
 *
 * <template>
 *   <ThemeProvider :theme-config="appTheme">
 *     <SvgIcon icon-name="logo" label="Acme" />
 *   </ThemeProvider>
 * </template>
 *
 * @cckPart root
 * @cckPart svg
 */
export interface SvgIconProps {
  /**
   * The name of the icon in the icons of the provided theme, for example `heart`. In a template, write it as
   * `icon-name`. A name the theme does not have renders an empty icon, and in development logs a `CocoKits:`
   * error.
   *
   * @example
   * <SvgIcon icon-name="heart" />
   * @cckSemantic svg-icon.iconName
   */
  readonly iconName: string;
  /**
   * Names the icon for assistive technology: the root gets `role="img"` and this `aria-label`. When not set or
   * empty, the icon is decorative and hidden from assistive technology.
   *
   * Do not set it on an icon inside a button or link that has its own name.
   *
   * @example
   * <SvgIcon icon-name="warning" label="Warning" />
   * @cckSemantic svg-icon.label
   */
  readonly label?: string | undefined;
}
