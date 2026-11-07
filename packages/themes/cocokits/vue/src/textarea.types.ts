import type { TextareaProps as BaseTextareaProps } from '@cocokits/vue/textarea';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type TextareaOptions = CocokitsThemeConfig['components']['textarea'];

/** The `autoResize` values of the cocokits theme. */
export type TextareaAutoResize = TextareaOptions['autoResize']['values'][number];

/**
 * Props of the cocokits Textarea. It renders the base `<textarea>` and supplies `autoResize` to it, which renders
 * `data-auto-resize` when true. The option resolves as own option, then `ThemeProvider` override, then config
 * default; `null` removes the attribute. Native attributes and listeners fall through to the `<textarea>`.
 *
 * @example
 * <Textarea v-model="message" auto-resize />
 * @cckPart root
 */
export interface TextareaProps extends BaseTextareaProps {
  /**
   * Grows with its content between the min and max rows.
   */
  readonly autoResize?: TextareaAutoResize | null | undefined;
}
