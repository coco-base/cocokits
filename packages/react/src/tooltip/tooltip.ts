import { TooltipArrow } from './tooltip-arrow';
import { TooltipContent } from './tooltip-content';
import { TooltipDescription } from './tooltip-description';
import { TooltipProvider } from './tooltip-provider';
import { TooltipRoot } from './tooltip-root';
import { TooltipTitle } from './tooltip-title';
import { TooltipTrigger } from './tooltip-trigger';
import type {
  TooltipArrowProps,
  TooltipContentProps,
  TooltipPart,
  TooltipProviderProps,
  TooltipRootProps,
  TooltipTextProps,
  TooltipTriggerProps,
} from './tooltip.types';

/** The shape of the {@link Tooltip} namespace. */
interface TooltipNamespace {
  readonly Provider: TooltipPart<TooltipProviderProps>;
  readonly Root: TooltipPart<TooltipRootProps>;
  readonly Trigger: TooltipPart<TooltipTriggerProps>;
  readonly Content: TooltipPart<TooltipContentProps>;
  readonly Title: TooltipPart<TooltipTextProps>;
  readonly Description: TooltipPart<TooltipTextProps>;
  readonly Arrow: TooltipPart<TooltipArrowProps>;
}

/**
 * The Tooltip parts as a namespace: `Tooltip.Provider`, `Tooltip.Root`, `Tooltip.Trigger`,
 * `Tooltip.Content`, `Tooltip.Title`, `Tooltip.Description` and `Tooltip.Arrow`. A short,
 * non-interactive description of a focusable element, shown on hover and keyboard focus.
 */
export const Tooltip: TooltipNamespace = {
  Provider: TooltipProvider,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Title: TooltipTitle,
  Description: TooltipDescription,
  Arrow: TooltipArrow,
};
