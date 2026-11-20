import { Tooltip as BaseTooltip } from '@cocokits/react/tooltip';
import { TooltipContent, type TooltipContentComponent } from './tooltip-content';
import { TooltipRoot, type TooltipRootComponent } from './tooltip-root';

/** The cocokits {@link Tooltip} parts: the themed `Root` and `Content` and the base parts. */
interface TooltipNamespace {
  readonly Provider: typeof BaseTooltip.Provider;
  readonly Root: TooltipRootComponent;
  readonly Trigger: typeof BaseTooltip.Trigger;
  readonly Content: TooltipContentComponent;
  readonly Arrow: typeof BaseTooltip.Arrow;
  readonly Title: typeof BaseTooltip.Title;
  readonly Description: typeof BaseTooltip.Description;
}

/**
 * The cocokits Tooltip as a namespace: the themed `Tooltip.Root` and `Tooltip.Content` and the base
 * `Tooltip.Provider`, `Tooltip.Trigger`, `Tooltip.Arrow`, `Tooltip.Title` and `Tooltip.Description`. The root takes
 * `size`, which the content draws.
 */
export const Tooltip: TooltipNamespace = {
  Provider: BaseTooltip.Provider,
  Root: TooltipRoot,
  Trigger: BaseTooltip.Trigger,
  Content: TooltipContent,
  Arrow: BaseTooltip.Arrow,
  Title: BaseTooltip.Title,
  Description: BaseTooltip.Description,
};
