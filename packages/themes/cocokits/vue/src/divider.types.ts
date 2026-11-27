import type { DividerProps as BaseDividerProps } from '@cocokits/vue/divider';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type DividerOptions = CocokitsThemeConfig['components']['divider'];

/** The `size` values of the cocokits theme. */
export type DividerSize = DividerOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type DividerColor = DividerOptions['color']['values'][number];

/**
 * Props of the cocokits Divider. It renders a native `<hr>` and supplies `size` and `color` to it. Each option
 * resolves as own option, then `ThemeProvider` override, then config default; `null` removes the attribute. The
 * Divider has no margin: the layout around it, such as a `gap`, sets the space.
 *
 * Where the line is the only cue of a grouping, use `color="dark"`, the one strength that reaches a 3:1 contrast in both colour modes.
 *
 * @example
 * <Divider size="lg" color="dark" />
 * @cckPart root
 */
export interface DividerProps extends BaseDividerProps {
  /**
   * Thickness of the line.
   */
  readonly size?: DividerSize | null | undefined;
  /**
   * How strong the line is. Rendered as `data-color`.
   */
  readonly color?: DividerColor | null | undefined;
}
