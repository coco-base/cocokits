import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type AvatarGroupOptions = CocokitsThemeConfig['components']['avatar-group'];

/** The `size` values of the cocokits theme. */
export type CckAvatarGroupSize = AvatarGroupOptions['size']['values'][number];

/**
 * The cocokits theme options of the Avatar group. It sits on the same element as the base component
 * (`cck-avatar-group`) and provides the value to it; the base renders the `data-*` attribute on the root. The option
 * resolves in order: the input, then the `provideCckTheme` override, then the config default; `null` removes the
 * attribute. The theme needs `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <cck-avatar-group size="sm" role="group" aria-label="Team">
 *   <cck-avatar><cck-avatar-fallback>AL</cck-avatar-fallback></cck-avatar>
 *   <cck-avatar><cck-avatar-fallback>GH</cck-avatar-fallback></cck-avatar>
 * </cck-avatar-group>
 * @cckPart root
 */
@Directive({
  selector: 'cck-avatar-group',
  providers: [
    provideThemeOptions(
      'avatar-group',
      forwardRef(() => CckAvatarGroupTheme),
      (theme: CckAvatarGroupTheme) => ({ size: theme.size }),
    ),
  ],
})
export class CckAvatarGroupTheme {
  /**
   * Overlap, ring and the size of its direct avatars; it wins over their own size.
   */
  readonly size = input<CckAvatarGroupSize | null>();
}
