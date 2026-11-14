import { Directive, booleanAttribute, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type TextareaOptions = CocokitsThemeConfig['components']['textarea'];

/** The `autoResize` values of the cocokits theme. */
export type CckTextareaAutoResize = TextareaOptions['autoResize']['values'][number];

/** Reads the attribute form: `autoResize` alone and `autoResize=""` mean true; `null` and `undefined` pass through. */
const toAutoResize = (
  value: CckTextareaAutoResize | string | null | undefined,
): CckTextareaAutoResize | null | undefined => (value == null ? value : booleanAttribute(value));

/**
 * The cocokits theme options of the Textarea. It sits on the same element as the base component
 * (`textarea[cckTextarea]`) and provides the value to it; the base renders the `data-auto-resize`
 * attribute. The option resolves in order: the input, then the `provideCckTheme` override, then the
 * config default; `null` removes the attribute. The theme needs `provideCckTheme`; without it no theme
 * attribute renders.
 *
 * @example
 * <textarea cckTextarea autoResize></textarea>
 * @cckPart root
 */
@Directive({
  selector: 'textarea[cckTextarea]',
  providers: [
    provideThemeOptions(
      'textarea',
      forwardRef(() => CckTextareaTheme),
      (theme: CckTextareaTheme) => ({ autoResize: theme.autoResize }),
    ),
  ],
})
export class CckTextareaTheme {
  /**
   * Grows with its content between the min and max rows.
   */
  readonly autoResize = input<
    CckTextareaAutoResize | null | undefined,
    CckTextareaAutoResize | string | null | undefined
  >(undefined, {
    transform: toAutoResize,
  });
}
