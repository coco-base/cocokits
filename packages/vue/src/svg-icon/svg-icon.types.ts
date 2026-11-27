/**
 * An icon, drawn by registered name or from an SVG string. It renders a `<span>` with an `<svg>` that it owns: the
 * `<svg>` has the icon's `viewBox`, `aria-hidden="true"` and `focusable="false"`, and the icon's markup inside.
 *
 * Register the icons your app uses once, with `IconProvider` (or `useIconRegistry`), then draw them by name. The
 * four base icons (`chevron-down`, `check`, `minus`, `close`) are always there. An icon that is registered eagerly
 * is in the server HTML; a lazy icon and an `svg` string are drawn after mount.
 *
 * The icon is decorative by default: the root has `aria-hidden="true"`. Set `label` for a meaningful icon; the
 * root then has `role="img"` and that `aria-label`. Inside a button that has its own name, leave `label` out.
 *
 * Without a registered icon for the name it renders an empty `<svg>` and, in development, logs a `CocoKits:`
 * error. It never throws. Native attributes and listeners fall through to the root `<span>`. It takes no slot.
 *
 * Trusted content only: the markup of a registered icon and an `svg` string is inserted as it is, with no
 * sanitising. Never register or pass text from users or other untrusted sources.
 *
 * Unstyled, the browser sizes an `<svg>` that has a `viewBox` and no size to its default. The icons draw in
 * `currentColor`, so the icon takes the text color. Size `.cck-svg-icon__svg`.
 *
 * @example
 * <SvgIcon icon-name="heart" />
 *
 * @example
 * <script setup lang="ts">
 * import { SvgIcon } from '@cocokits/vue/svg-icon';
 * import { IconProvider } from '@cocokits/vue-core';
 * import { searchIcon } from '@cocokits/icons';
 * </script>
 *
 * <template>
 *   <IconProvider :icons="{ search: searchIcon }">
 *     <SvgIcon icon-name="search" label="Search" />
 *   </IconProvider>
 * </template>
 *
 * @example
 * <script setup lang="ts">
 * import { SvgIcon } from '@cocokits/vue/svg-icon';
 * import logoSvg from './logo.svg?raw';
 * </script>
 *
 * <template>
 *   <SvgIcon :svg="logoSvg" label="Acme" />
 * </template>
 *
 * @cckPart root
 * @cckPart svg
 */
export interface SvgIconProps {
  /**
   * The name of a registered icon, for example `heart`. In a template, write it as `icon-name`. When not set, the
   * icon is drawn from `svg` instead.
   *
   * A name that is not registered renders an empty icon, and in development logs a `CocoKits:` error. When both
   * `iconName` and `svg` are set, `iconName` is used and development logs an error.
   *
   * @example
   * <SvgIcon icon-name="heart" />
   * @cckSemantic svg-icon.iconName
   */
  readonly iconName?: string | undefined;
  /**
   * A full SVG string to draw, for example the text of an imported `.svg` file. When not set, the icon is drawn
   * from `iconName`.
   *
   * It is read once after mount, so it is not in the server HTML. A string that is not an `<svg>` element renders
   * an empty icon and, in development, logs a `CocoKits:` error.
   *
   * Trusted content only: the markup is inserted as it is, with no sanitising. Never pass text from users or other
   * untrusted sources.
   *
   * @example
   * <SvgIcon :svg="logoSvg" />
   * @cckSemantic svg-icon.svg
   */
  readonly svg?: string | undefined;
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
