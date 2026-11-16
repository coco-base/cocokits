import { Directive, computed, forwardRef, inject, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { CckFormFieldTheme } from './form-field-theme';
import { inherited } from './inherit';

type InputOptions = CocokitsThemeConfig['components']['input'];

/** The `size` values of the cocokits theme. */
export type CckInputSize = InputOptions['size']['values'][number];

/**
 * The cocokits theme options of the Input. It sits on the same element as the base component (`input[cckInput]`)
 * and provides the value to it; the base renders the `data-size` attribute on the root. The option resolves in order:
 * the input, then the `size` of the `cck-form-field` around it, then the `provideCckTheme` override, then the config
 * default; `null` removes the attribute. The theme needs `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <input cckInput size="lg" aria-label="Name" />
 * @cckPart root
 */
@Directive({
  selector: 'input[cckInput]',
  providers: [
    provideThemeOptions(
      'input',
      forwardRef(() => CckInputTheme),
      (theme: CckInputTheme) => ({ size: theme._size }),
    ),
  ],
})
export class CckInputTheme {
  /**
   * Height, padding and text of the input.
   */
  readonly size = input<CckInputSize | null>();
  private readonly field = inject(CckFormFieldTheme, { optional: true });
  /** The size of the input: its own, else the one of its field. @internal */
  readonly _size = computed(() => inherited(this.size(), this.field?.size()));
}
