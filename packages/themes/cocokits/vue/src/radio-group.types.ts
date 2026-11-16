import type { RadioGroupProps as BaseRadioGroupProps } from '@cocokits/vue/radio-group';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type RadioGroupOptions = CocokitsThemeConfig['components']['radio-group'];

/** The `size` values of the cocokits theme. */
export type RadioGroupSize = RadioGroupOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type RadioGroupColor = RadioGroupOptions['color']['values'][number];
/** The `labelPosition` values of the cocokits theme. */
export type RadioGroupLabelPosition = RadioGroupOptions['labelPosition']['values'][number];

/**
 * Props of the cocokits RadioGroup. It renders the base RadioGroup and supplies `size`, `color` and `labelPosition`
 * to it, which render the `data-*` attributes on the root. The options exist to be inherited: a `Radio` that sets none
 * of its own takes the one of its group. Each option resolves as own option, then `ThemeProvider` override, then
 * config default (none); `null` removes the attribute. Bind the value with `v-model`; native attributes and listeners
 * fall through to the base.
 *
 * @example
 * <RadioGroup v-model="plan" size="lg" color="success" aria-label="Plan">
 *   <Radio value="free">Free</Radio>
 *   <Radio value="pro">Pro</Radio>
 * </RadioGroup>
 * @cckPart root
 */
export interface RadioGroupProps extends BaseRadioGroupProps {
  /**
   * Size of the radios that set none of their own.
   */
  readonly size?: RadioGroupSize | null | undefined;
  /**
   * Color family of the radios that set none of their own, rendered as `data-cck-color`.
   */
  readonly color?: RadioGroupColor | null | undefined;
  /**
   * Label side of the radios that set none of their own.
   */
  readonly labelPosition?: RadioGroupLabelPosition | null | undefined;
}
