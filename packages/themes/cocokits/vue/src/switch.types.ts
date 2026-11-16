import type { SwitchProps as BaseSwitchProps } from '@cocokits/vue/switch';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type SwitchOptions = CocokitsThemeConfig['components']['switch'];

/** The `variant` values of the cocokits theme. */
export type SwitchVariant = SwitchOptions['variant']['values'][number];
/** The `size` values of the cocokits theme. */
export type SwitchSize = SwitchOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type SwitchColor = SwitchOptions['color']['values'][number];
/** The `labelPosition` values of the cocokits theme. */
export type SwitchLabelPosition = SwitchOptions['labelPosition']['values'][number];

/**
 * Props of the cocokits Switch. It renders the base Switch and supplies `variant`, `size`, `color` and `labelPosition` to it,
 * which renders the `data-*` attributes on the root. Each option resolves as own option, then `ThemeProvider`
 * override, then config default; `null` removes the attribute. Bind the value with `v-model`; native attributes
 * and listeners fall through to the base.
 *
 * @example
 * <Switch v-model="value" size="lg" color="success" label-position="before">Label</Switch>
 * @cckPart root
 */
export interface SwitchProps extends BaseSwitchProps {
  /**
   * Look of the track: a contained pill with the thumb inside, or a thin rail with the thumb on it.
   */
  readonly variant?: SwitchVariant | null | undefined;
  /**
   * Size of the track and its label text.
   */
  readonly size?: SwitchSize | null | undefined;
  /**
   * Color family of the checked state, rendered as `data-cck-color`.
   */
  readonly color?: SwitchColor | null | undefined;
  /**
   * Whether the label follows the track or precedes it, in the writing direction.
   */
  readonly labelPosition?: SwitchLabelPosition | null | undefined;
}
