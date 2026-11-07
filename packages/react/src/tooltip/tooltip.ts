import { TooltipArrow } from './tooltip-arrow';
import { TooltipContent } from './tooltip-content';
import { TooltipProvider } from './tooltip-provider';
import { TooltipRoot } from './tooltip-root';
import { TooltipTrigger } from './tooltip-trigger';
import type {
  TooltipArrowProps,
  TooltipContentProps,
  TooltipPart,
  TooltipProviderProps,
  TooltipRootProps,
  TooltipTriggerProps,
} from './tooltip.types';

/** The shape of the {@link Tooltip} namespace. */
interface TooltipNamespace {
  readonly Provider: TooltipPart<TooltipProviderProps>;
  readonly Root: TooltipPart<TooltipRootProps>;
  readonly Trigger: TooltipPart<TooltipTriggerProps>;
  readonly Content: TooltipPart<TooltipContentProps>;
  readonly Arrow: TooltipPart<TooltipArrowProps>;
}

/**
 * The Tooltip parts as a namespace: `Tooltip.Provider`, `Tooltip.Root`, `Tooltip.Trigger`,
 * `Tooltip.Content` and `Tooltip.Arrow`. A short,
 * non-interactive description of a focusable element, shown on hover and keyboard focus.
 */
export const Tooltip: TooltipNamespace = {
  Provider: TooltipProvider,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Arrow: TooltipArrow,
};
