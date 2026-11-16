import type { TooltipRootProps as BaseTooltipRootProps } from '@cocokits/vue/tooltip';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type TooltipOptions = CocokitsThemeConfig['components']['tooltip'];

/** The `size` values of the cocokits theme. */
export type TooltipSize = TooltipOptions['size']['values'][number];

/**
 * Props of the cocokits TooltipRoot. It renders the base TooltipRoot and keeps `size` for its `TooltipContent`, which
 * draws it as `data-size` on the bubble. The root renders no element and no attribute itself. The option resolves as
 * the size of the root, then `ThemeProvider` override, then config default; `null` removes the attribute. Bind the
 * open state with `v-model:open`.
 *
 * @example
 * <TooltipRoot size="lg">
 *   <TooltipTrigger>Copy</TooltipTrigger>
 *   <TooltipContent>Copies the link</TooltipContent>
 * </TooltipRoot>
 * @cckPart root
 */
export interface TooltipRootProps extends BaseTooltipRootProps {
  /**
   * Padding, width and text of the bubble, drawn on the content. The `TooltipContent` of this tooltip reads it.
   */
  readonly size?: TooltipSize | null | undefined;
}
