import type { ComponentPropsWithRef } from 'react';

/**
 * Props of the {@link SvgIcon}. Native `span` props pass through to the root, and `ref` reaches it. The theme
 * wrapper adds `color`, so the native `color` prop is left out. Children are ignored: the icon is drawn from
 * `iconName`.
 */
export interface SvgIconProps extends Omit<ComponentPropsWithRef<'span'>, 'color'> {
  /**
   * The name of the icon in the icons of the provided theme, for example `heart`. A name the theme does not have
   * renders an empty icon, and in development logs a `CocoKits:` error.
   *
   * @example
   * <SvgIcon iconName="heart" />
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
   * <SvgIcon iconName="warning" label="Warning" />
   * @cckSemantic svg-icon.label
   */
  readonly label?: string | undefined;
}
