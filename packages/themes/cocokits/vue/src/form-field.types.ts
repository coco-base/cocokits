import type { FormFieldProps as BaseFormFieldProps } from '@cocokits/vue/form-field';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type FormFieldOptions = CocokitsThemeConfig['components']['form-field'];

/** The `size` values of the cocokits theme. */
export type FormFieldSize = FormFieldOptions['size']['values'][number];

/**
 * Props of the cocokits FormField. It lays out a label, a control and its hints, and supplies `size` to the
 * base FormField, which renders `data-size` on the root and on the input wrapper. The option resolves as own
 * option, then `ThemeProvider` override, then config default; `null` removes the attribute.
 *
 * @example
 * <FormField size="lg"><template #label><Label>Email</Label></template><Input v-model="email" /></FormField>
 * @cckPart root
 */
export interface FormFieldProps extends BaseFormFieldProps {
  /**
   * Height, padding and text size of the input box.
   */
  readonly size?: FormFieldSize | null | undefined;
}
