'use client';

import type { ReactElement } from 'react';
import { SvgIcon as BaseSvgIcon, type SvgIconProps as BaseSvgIconProps } from '@cocokits/react/svg-icon';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type SvgIconOptions = CocokitsThemeConfig['components']['svg-icon'];

/** The `size` values of the cocokits theme. */
export type SvgIconSize = SvgIconOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type SvgIconColor = SvgIconOptions['color']['values'][number];
/** The `rtlMirror` values of the cocokits theme. */
export type SvgIconRtlMirror = SvgIconOptions['rtlMirror']['values'][number];

/** Props of the themed {@link SvgIcon}: the base props plus the three cocokits options. */
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

function ThemedSvgIcon({ size, color, rtlMirror, ...props }: SvgIconProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="svg-icon" options={{ size, color, rtlMirror }}>
      <BaseSvgIcon {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link SvgIcon} component and its `displayName`. */
interface SvgIconComponent {
  (props: SvgIconProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits SvgIcon. It renders the base icon, drawn from the icons you registered (for example with `IconProvider`), and supplies `size`, `color` and
 * `rtlMirror` to it, which renders the `data-*` attributes. Each option resolves in order: the prop, then the
 * `ThemeProvider` override, then the config default; `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <SvgIcon iconName="heart" size="lg" color="danger" />
 * @cckPart root
 * @cckPart svg
 */
export const SvgIcon: SvgIconComponent = Object.assign(ThemedSvgIcon, { displayName: 'SvgIcon' });
