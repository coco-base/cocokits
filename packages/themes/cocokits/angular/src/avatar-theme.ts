import { Directive, computed, forwardRef, inject, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import { resolveInheritedValue, type CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { CckAvatarGroupTheme } from './avatar-group-theme';
import { CckAvatarLabelTheme } from './avatar-label-theme';

type AvatarOptions = CocokitsThemeConfig['components']['avatar'];

/** The `size` values of the cocokits theme. */
export type CckAvatarSize = AvatarOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type CckAvatarColor = AvatarOptions['color']['values'][number];

/**
 * The cocokits theme options of the Avatar. It sits on the same element as the base component (`cck-avatar`) and
 * provides the values to it; the base renders the `data-*` attributes on the root. Each option resolves in order: the
 * input, then (for `size`) the one of the `cck-avatar-label` or `cck-avatar-group` around it, then the
 * `provideCckTheme` override, then the config default; `null` removes the attribute. The theme needs
 * `provideCckTheme`; without it no theme attribute renders.
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
  host: {
    '[attr.size]': 'null',
    '[attr.color]': 'null',
  },
  providers: [
    provideThemeOptions(
      'avatar',
      forwardRef(() => CckAvatarTheme),
      (theme: CckAvatarTheme) => ({ size: theme._size, color: theme.color }),
    ),
  ],
})
export class CckAvatarTheme {
  /**
   * Side of the circle and size of the fallback text.
   */
  readonly size = input<CckAvatarSize | null>();
  private readonly label = inject(CckAvatarLabelTheme, { optional: true });
  private readonly group = inject(CckAvatarGroupTheme, { optional: true });
  /** The size of the avatar: its own, else the one of its label, else the one of its group. @internal */
  readonly _size = computed(() => resolveInheritedValue(this.size(), this.label?.size(), this.group?.size()));
  /**
   * Color family of the fallback, rendered as `data-cck-color`.
   */
  readonly color = input<CckAvatarColor | null>();
}
