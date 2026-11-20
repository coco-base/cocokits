import type { CheckboxProps as BaseCheckboxProps } from '@cocokits/vue/checkbox';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type CheckboxOptions = CocokitsThemeConfig['components']['checkbox'];

/** The `size` values of the cocokits theme. */
export type CheckboxSize = CheckboxOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type CheckboxColor = CheckboxOptions['color']['values'][number];
/** The `labelPosition` values of the cocokits theme. */
export type CheckboxLabelPosition = CheckboxOptions['labelPosition']['values'][number];

/**
 * Props of the cocokits Checkbox. It renders the base Checkbox and supplies `size`, `color` and `labelPosition` to it,
 * which renders the `data-*` attributes on the root. Each option resolves as own option, then `ThemeProvider`
 * override, then config default; `null` removes the attribute. Bind the value with `v-model`; native attributes
 * and listeners fall through to the base.
 *
 * @example
 * <Checkbox v-model="value" size="lg" color="success" label-position="before">Label</Checkbox>
 * @cckPart root
 */
export interface CheckboxProps extends BaseCheckboxProps {
  /**
   * Size of the box and its label text.
   */
  readonly size?: CheckboxSize | null | undefined;
  /**
   * Color family of the checked state, rendered as `data-cck-color`.
   */
  readonly color?: CheckboxColor | null | undefined;
  /**
   * Whether the label follows the box or precedes it, in the writing direction.
   */
  readonly labelPosition?: CheckboxLabelPosition | null | undefined;
}
