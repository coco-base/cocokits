import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { FramesxThemeConfig } from '@cocokits/theme-framesx';

type ButtonOptions = FramesxThemeConfig['components']['button'];

/** The `variant` values of the FramesX theme. */
export type CckButtonVariant = ButtonOptions['variant']['values'][number];

/**
 * The FramesX theme options of the Button. It sits on the same element as the base
 * directive (`button[cckButton]`, `a[cckButton]`) and provides the values to it; the base
 * renders the `data-*` attribute. The option resolves in order: the input, then the provider override,
 * then the config default; `null` removes the attribute. The theme needs a theme provider.
 *
 * @example
 * <button cckButton variant="outline">Delete</button>
 * @cckPart root
 */
@Directive({
  selector: 'button[cckButton], a[cckButton]',
  providers: [
    provideThemeOptions(
      'button',
      forwardRef(() => CckButtonTheme),
      (theme: CckButtonTheme) => ({ variant: theme.variant }),
    ),
  ],
})
export class CckButtonTheme {
  /** Fill and border style. */
  readonly variant = input<CckButtonVariant | null>();
}
