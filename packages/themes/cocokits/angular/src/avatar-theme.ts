import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type AvatarOptions = CocokitsThemeConfig['components']['avatar'];

/** The `size` values of the cocokits theme. */
export type CckAvatarSize = AvatarOptions['size']['values'][number];

/**
 * The cocokits theme options of the Avatar. It sits on the same element as the base component (`cck-avatar`) and
 * provides the value to it; the base renders the `data-*` attribute on the root. The option resolves in order: the
 * input, then the `provideCckTheme` override, then the config default; `null` removes the attribute. The theme needs
 * `provideCckTheme`; without it no theme attribute renders. Inside a `cck-avatar-group` or `cck-avatar-label`, the
 * size of the container wins.
 *
 * @example
 * <cck-avatar size="lg">
 *   <img cckAvatarImage src="/ada.webp" alt="Ada Lovelace" />
 *   <cck-avatar-fallback>AL</cck-avatar-fallback>
 * </cck-avatar>
 * @cckPart root
 */
@Directive({
  selector: 'cck-avatar',
  providers: [
    provideThemeOptions(
      'avatar',
      forwardRef(() => CckAvatarTheme),
      (theme: CckAvatarTheme) => ({ size: theme.size }),
    ),
  ],
})
export class CckAvatarTheme {
  /**
   * Side of the circle and size of the fallback text.
   */
  readonly size = input<CckAvatarSize | null>();
}
