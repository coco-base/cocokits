import { Directive, booleanAttribute, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type TagOptions = CocokitsThemeConfig['components']['tag'];

/** The `variant` values of the cocokits theme. */
export type CckTagVariant = TagOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type CckTagColor = TagOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type CckTagSize = TagOptions['size']['values'][number];
/** The `dot` values of the cocokits theme. */
export type CckTagDot = TagOptions['dot']['values'][number];

/** Reads the attribute form: `dot` alone and `dot=""` mean true; `null` and `undefined` pass through. */
const toDot = (value: CckTagDot | string | null | undefined): CckTagDot | null | undefined =>
  value == null ? value : booleanAttribute(value);

/**
 * The cocokits theme options of the Tag. It sits on the same element as the base component (`cck-tag`) and provides
 * the values to it; the base renders the `data-*` attributes. Each option resolves in order: the input, then the
 * `provideCckTheme` override, then the config default; `null` removes the attribute. The theme needs
 * `provideCckTheme`; without it no theme attribute renders.
 *
 * The tag has no hover, focus or pressed look: it is a label, not a control.
 *
 * @example
 * <cck-tag variant="solid" color="success" size="sm" dot>Paid</cck-tag>
 * @cckPart root
 */
@Directive({
  selector: 'cck-tag',
  host: {
    '[attr.variant]': 'null',
    '[attr.color]': 'null',
    '[attr.size]': 'null',
    '[attr.dot]': 'null',
  },
  providers: [
    provideThemeOptions(
      'tag',
      forwardRef(() => CckTagTheme),
      (theme: CckTagTheme) => ({ variant: theme.variant, color: theme.color, size: theme.size, dot: theme.dot }),
    ),
  ],
})
export class CckTagTheme {
  /**
   * Look of the label: a tinted fill, a full fill or a border.
   */
  readonly variant = input<CckTagVariant | null>();
  /**
   * Color family, rendered as `data-cck-color`.
   */
  readonly color = input<CckTagColor | null>();
  /**
   * Height, padding, text and icon size.
   */
  readonly size = input<CckTagSize | null>();
  /**
   * Shows a small dot in the text color before the content. The dot is decorative: say the meaning in the text.
   */
  readonly dot = input<CckTagDot | null | undefined, CckTagDot | string | null | undefined>(undefined, {
    transform: toDot,
  });
}
