import type { RadioProps as BaseRadioProps } from '@cocokits/vue/radio';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type RadioOptions = CocokitsThemeConfig['components']['radio'];

/** The `size` values of the cocokits theme. */
export type RadioSize = RadioOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type RadioColor = RadioOptions['color']['values'][number];
/** The `labelPosition` values of the cocokits theme. */
export type RadioLabelPosition = RadioOptions['labelPosition']['values'][number];

/**
 * Props of the cocokits Radio. It renders the base Radio and supplies `size`, `color` and `labelPosition` to it,
 * which renders the `data-*` attributes on the root. Each option resolves as own option, then `ThemeProvider`
 * override, then config default; `null` removes the attribute. Bind the value with `v-model`; native attributes
 * and listeners fall through to the base.
 *
 * @example
 * <Radio v-model="value" size="lg" color="success" label-position="before">Label</Radio>
 * @cckPart root
 */
export interface RadioProps extends BaseRadioProps {
  /**
   * Size of the radio and its label text.
   */
  readonly size?: RadioSize | null | undefined;
  /**
   * Color family of the checked state, rendered as `data-cck-color`.
   */
  readonly color?: RadioColor | null | undefined;
  /**
   * Whether the label follows the radio or precedes it, in the writing direction.
   */
  readonly labelPosition?: RadioLabelPosition | null | undefined;
}
