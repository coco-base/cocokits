import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { FramesThemeConfig } from '@cocokits/theme-frames-x';

type ButtonOptions = FramesThemeConfig['components']['button'];

/** The `variant` values of the Frames X theme. */
export type CckButtonVariant = ButtonOptions['variant']['values'][number];

/**
 * The Frames X theme options of the Button. It sits on the same element as the base
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
