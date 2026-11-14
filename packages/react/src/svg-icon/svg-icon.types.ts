import type { ComponentPropsWithRef } from 'react';

/**
 * Props of the {@link SvgIcon}. Native `span` props pass through to the root, and `ref` reaches it. The theme
 * wrapper adds `color`, so the native `color` prop is left out. Children are ignored: the icon is drawn from
 * `iconName`.
 */
export interface SvgIconProps extends Omit<ComponentPropsWithRef<'span'>, 'color'> {
  /**
   * The name of a registered icon, for example `heart`. Register icons with `IconProvider` or `useIconRegistry()`.
   * When not set, the icon is drawn from `svg`, or is empty.
   *
   * @remarks
   * A name that is not registered renders an empty icon, and in development logs a `CocoKits:` error. When both
   * `iconName` and `svg` are given, `iconName` is used and an error asks for one.
   * @example
   * <SvgIcon iconName="heart" />
   * @cckSemantic svg-icon.iconName
   */
  readonly iconName?: string | undefined;
  /**
   * A full SVG string, for example the text of an imported `.svg` file. When not set, the icon is drawn from
   * `iconName`.
   *
   * @remarks
   * The string needs a `viewBox`, or a `width` and a `height`. It is parsed once on the client: the icon is empty on
   * the server and the first client render, and drawn after mount. Use `iconName` for an icon that must be in the
   * server HTML.
   *
   * Trusted content only: the markup is inserted as it is, with no sanitising. Never pass text from users or other
   * untrusted sources.
   * @example
   * import logoSvg from './logo.svg?raw';
   *
   * <SvgIcon svg={logoSvg} />
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
   * <SvgIcon iconName="warning" label="Warning" />
   * @cckSemantic svg-icon.label
   */
  readonly label?: string | undefined;
}
