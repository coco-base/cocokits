import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type DividerOptions = CocokitsThemeConfig['components']['divider'];

/** The `size` values of the cocokits theme. */
export type CckDividerSize = DividerOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type CckDividerColor = DividerOptions['color']['values'][number];

/**
 * The cocokits theme options of the Divider. It sits on the same element as the base directive
 * (`hr[cckDivider]`) and provides the values to it; the base renders the `data-*` attributes. Each
 * option resolves in order: the input, then the `provideCckTheme` override, then the config default;
 * `null` removes the attribute. The theme needs `provideCckTheme`; without it no theme attribute
 * renders.
 *
 * It has no margin. The layout around it, such as a `gap`, sets the space. Where the line is the only cue of a
 * grouping, use `color="dark"`, the one strength that reaches a 3:1 contrast in both colour modes.
 *
 * @example
 * <hr cckDivider size="lg" color="dark" />
 * @cckPart root
 */
@Directive({
  selector: 'hr[cckDivider]',
  providers: [
    provideThemeOptions(
      'divider',
      forwardRef(() => CckDividerTheme),
      (theme: CckDividerTheme) => ({ size: theme.size, color: theme.color }),
    ),
  ],
})
export class CckDividerTheme {
  /**
   * Thickness of the line.
   */
  readonly size = input<CckDividerSize | null>();
  /**
   * Strength of the line: a light, the default or a dark border colour. Rendered as `data-color`.
   */
  readonly color = input<CckDividerColor | null>();
}
