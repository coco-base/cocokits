import type { InputProps as BaseInputProps } from '@cocokits/vue/input';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type InputOptions = CocokitsThemeConfig['components']['input'];

/** The `size` values of the cocokits theme. */
export type InputSize = InputOptions['size']['values'][number];

/**
 * Props of the cocokits Input. It renders the base `<input>` and supplies `size` to it, which renders `data-size`.
 * The option resolves as own option, then the size of the `FormField` around it, then `ThemeProvider` override, then
 * config default; `null` removes the attribute. Native attributes and listeners fall through to the `<input>`.
 *
 * @example
 * <Input v-model="email" size="lg" type="email" aria-label="Email" />
 * @cckPart root
 */
export interface InputProps extends BaseInputProps {
  /**
   * Height, padding and text of the input. Inside a `FormField` it takes the size of the field.
   */
  readonly size?: InputSize | null | undefined;
}
