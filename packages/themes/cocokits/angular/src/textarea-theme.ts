import { Directive, booleanAttribute, computed, forwardRef, inject, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import { resolveInheritedValue, type CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { CckFormFieldTheme } from './form-field-theme';

type TextareaOptions = CocokitsThemeConfig['components']['textarea'];

/** The `size` values of the cocokits theme. */
export type CckTextareaSize = TextareaOptions['size']['values'][number];
/** The `autoResize` values of the cocokits theme. */
export type CckTextareaAutoResize = TextareaOptions['autoResize']['values'][number];
/** The `resize` values of the cocokits theme. */
export type CckTextareaResize = TextareaOptions['resize']['values'][number];

/** Reads the attribute form: `autoResize` alone and `autoResize=""` mean true; `null` and `undefined` pass through. */
const toAutoResize = (
  value: CckTextareaAutoResize | string | null | undefined,
): CckTextareaAutoResize | null | undefined => (value == null ? value : booleanAttribute(value));

/**
 * Reads the attribute form: `resize` alone and `resize=""` mean true, a direction stays a direction; `null` and
 * `undefined` pass through.
 */
const toResize = (value: boolean | string | null | undefined): CckTextareaResize | null | undefined =>
  value == null
    ? value
    : value === 'vertical' || value === 'horizontal' || value === 'both'
      ? value
      : booleanAttribute(value);

/**
 * The cocokits theme options of the Textarea. It sits on the same element as the base component
 * (`textarea[cckTextarea]`) and provides the values to it; the base renders the `data-auto-resize` and
 * `data-resize` attributes. Each option resolves in order: the input, then (for `size`) the `size` of the
 * `cck-form-field` around it, then the `provideCckTheme` override, then the config default; `null` removes the
 * attribute. The theme needs `provideCckTheme`; without it no theme attribute renders.
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
      (theme: CckTextareaTheme) => ({ size: theme._size, autoResize: theme.autoResize, resize: theme.resize }),
    ),
  ],
})
export class CckTextareaTheme {
  /**
   * Padding and text of the textarea.
   */
  readonly size = input<CckTextareaSize | null>();
  private readonly field = inject(CckFormFieldTheme, { optional: true });
  /** The size of the textarea: its own, else the one of its field. @internal */
  readonly _size = computed(() => resolveInheritedValue(this.size(), this.field?.size()));
  /**
   * Grows with its content between the min and max rows.
   */
  readonly autoResize = input<
    CckTextareaAutoResize | null | undefined,
    CckTextareaAutoResize | string | null | undefined
  >(undefined, {
    transform: toAutoResize,
  });
  /**
   * Which way the grip resizes the box: `true` or `vertical`, `horizontal` or `both`. `false` shows no grip. It has no
   * effect with `autoResize`.
   */
  readonly resize = input<CckTextareaResize | null | undefined, boolean | string | null | undefined>(undefined, {
    transform: toResize,
  });
}
