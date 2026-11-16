import type { TextareaProps as BaseTextareaProps } from '@cocokits/vue/textarea';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type TextareaOptions = CocokitsThemeConfig['components']['textarea'];

/** The `size` values of the cocokits theme. */
export type TextareaSize = TextareaOptions['size']['values'][number];
/** The `autoResize` values of the cocokits theme. */
export type TextareaAutoResize = TextareaOptions['autoResize']['values'][number];
/** The `resize` values of the cocokits theme. */
export type TextareaResize = TextareaOptions['resize']['values'][number];

/**
 * Props of the cocokits Textarea. It renders the base `<textarea>` and supplies `size`, `autoResize` and `resize` to
 * it, which render `data-size` and, when true, `data-auto-resize` and `data-resize`. Each option resolves as own
 * option, then (for `size`) the size of the `FormField` around it, then `ThemeProvider` override, then config
 * default; `null` removes the attribute. Native attributes and listeners fall through to the `<textarea>`.
 *
 * @example
 * <Textarea v-model="message" auto-resize />
 * @cckPart root
 */
export interface TextareaProps extends BaseTextareaProps {
  /**
   * Padding and text of the textarea. Inside a `FormField` it takes the size of the field.
   */
  readonly size?: TextareaSize | null | undefined;
  /**
   * Grows with its content between the min and max rows.
   */
  readonly autoResize?: TextareaAutoResize | null | undefined;
  /**
   * Shows the handle that resizes the height. It has no effect with `auto-resize`.
   */
  readonly resize?: TextareaResize | null | undefined;
}
