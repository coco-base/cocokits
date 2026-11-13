import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type AvatarLabelOptions = CocokitsThemeConfig['components']['avatar-label'];

/** The `size` values of the cocokits theme. */
export type CckAvatarLabelSize = AvatarLabelOptions['size']['values'][number];
/** The `avatarPosition` values of the cocokits theme. */
export type CckAvatarLabelAvatarPosition = AvatarLabelOptions['avatarPosition']['values'][number];
/** The `textLayout` values of the cocokits theme. */
export type CckAvatarLabelTextLayout = AvatarLabelOptions['textLayout']['values'][number];

/**
 * The cocokits theme options of the Avatar label. It sits on the same element as the base component
 * (`cck-avatar-label`) and provides the values to it; the base renders the `data-*` attributes on the root. Each
 * option resolves in order: the input, then the `provideCckTheme` override, then the config default; `null` removes
 * the attribute. The theme needs `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <cck-avatar-label name="Ada Lovelace" description="Mathematician" size="lg" avatarPosition="end">
 *   <cck-avatar aria-hidden="true"><cck-avatar-fallback>AL</cck-avatar-fallback></cck-avatar>
 * </cck-avatar-label>
 * @cckPart root
 */
@Directive({
  selector: 'cck-avatar-label',
  providers: [
    provideThemeOptions(
      'avatar-label',
      forwardRef(() => CckAvatarLabelTheme),
      (theme: CckAvatarLabelTheme) => ({
        size: theme.size,
        avatarPosition: theme.avatarPosition,
        textLayout: theme.textLayout,
      }),
    ),
  ],
})
export class CckAvatarLabelTheme {
  /**
   * Gap, text size and the size of its direct avatar; it wins over its own size.
   */
  readonly size = input<CckAvatarLabelSize | null>();
  /**
   * Which side of the text the avatar sits on, in the writing direction.
   */
  readonly avatarPosition = input<CckAvatarLabelAvatarPosition | null>();
  /**
   * Name and description on two lines or side by side.
   */
  readonly textLayout = input<CckAvatarLabelTextLayout | null>();
}
