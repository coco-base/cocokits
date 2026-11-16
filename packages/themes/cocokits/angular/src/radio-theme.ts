import { Directive, computed, forwardRef, inject, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import { inherited, type CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { CckRadioGroupTheme } from './radio-group-theme';

type RadioOptions = CocokitsThemeConfig['components']['radio'];

/** The `size` values of the cocokits theme. */
export type CckRadioSize = RadioOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type CckRadioColor = RadioOptions['color']['values'][number];
/** The `labelPosition` values of the cocokits theme. */
export type CckRadioLabelPosition = RadioOptions['labelPosition']['values'][number];

/**
 * The cocokits theme options of the Radio. It sits on the same element as the base component
 * (`cck-radio`) and provides the values to it; the base renders the `data-*` attributes on the root.
 * Each option resolves in order: the input, then the one of the `cck-radio-group` around it, then the
 * `provideCckTheme` override, then the config default; `null` removes the attribute. The theme needs
 * `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <cck-radio size="lg" color="success" labelPosition="before">Label</cck-radio>
 * @cckPart root
 */
@Directive({
  selector: 'cck-radio',
  providers: [
    provideThemeOptions(
      'radio',
      forwardRef(() => CckRadioTheme),
      (theme: CckRadioTheme) => ({ size: theme._size, color: theme._color, labelPosition: theme._labelPosition }),
    ),
  ],
})
export class CckRadioTheme {
  /**
   * Size of the radio and its label text.
   */
  readonly size = input<CckRadioSize | null>();
  /**
   * Color family of the checked state, rendered as `data-cck-color`.
   */
  readonly color = input<CckRadioColor | null>();
  /**
   * Whether the label follows the radio or precedes it, in the writing direction.
   */
  readonly labelPosition = input<CckRadioLabelPosition | null>();
  private readonly group = inject(CckRadioGroupTheme, { optional: true });
  /** The size of the radio: its own, else the one of its group. @internal */
  readonly _size = computed(() => inherited(this.size(), this.group?.size()));
  /** The color of the radio: its own, else the one of its group. @internal */
  readonly _color = computed(() => inherited(this.color(), this.group?.color()));
  /** The label side of the radio: its own, else the one of its group. @internal */
  readonly _labelPosition = computed(() => inherited(this.labelPosition(), this.group?.labelPosition()));
}
