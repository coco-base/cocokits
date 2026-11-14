import { Directive, booleanAttribute, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type SvgIconOptions = CocokitsThemeConfig['components']['svg-icon'];

/** The `size` values of the cocokits theme. */
export type CckSvgIconSize = SvgIconOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type CckSvgIconColor = SvgIconOptions['color']['values'][number];
/** The `rtlMirror` values of the cocokits theme. */
export type CckSvgIconRtlMirror = SvgIconOptions['rtlMirror']['values'][number];

/** Reads the attribute form: `rtlMirror` alone and `rtlMirror=""` mean true; `null` and `undefined` pass through. */
const toRtlMirror = (value: CckSvgIconRtlMirror | string | null | undefined): CckSvgIconRtlMirror | null | undefined =>
  value == null ? value : booleanAttribute(value);

/**
 * The cocokits theme options of the SVG icon. It sits on the same element as the base component
 * (`cck-svg-icon`) and provides the values to it; the base renders the `data-*` attributes. Each option
 * resolves in order: the input, then the `provideCckTheme` override, then the config default; `null`
 * removes the attribute. Without a `size` the icon is as large as the text around it, and without a
 * `color` it takes the text color. The theme needs `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <cck-svg-icon iconName="heart" size="lg" color="danger" />
 * @cckPart root
 */
@Directive({
  selector: 'cck-svg-icon',
  providers: [
    provideThemeOptions(
      'svg-icon',
      forwardRef(() => CckSvgIconTheme),
      (theme: CckSvgIconTheme) => ({ size: theme.size, color: theme.color, rtlMirror: theme.rtlMirror }),
    ),
  ],
})
export class CckSvgIconTheme {
  /**
   * Side of the icon.
   */
  readonly size = input<CckSvgIconSize | null>();
  /**
   * Color family, rendered as `data-cck-color`.
   */
  readonly color = input<CckSvgIconColor | null>();
  /**
   * Mirrors the icon in a right-to-left context, for an icon that points along the text.
   */
  readonly rtlMirror = input<CckSvgIconRtlMirror | null | undefined, CckSvgIconRtlMirror | string | null | undefined>(
    undefined,
    { transform: toRtlMirror },
  );
}
