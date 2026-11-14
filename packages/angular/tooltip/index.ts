import { CckTooltip } from './tooltip';
import { CckTooltipArrow } from './tooltip-arrow';
import { CckTooltipContent } from './tooltip-content';
import { CckTooltipPortal } from './tooltip-portal';
import { CckTooltipTrigger } from './tooltip-trigger';

export { CckTooltip } from './tooltip';
export type { TooltipOrigin } from './tooltip-overlay';
export { CckTooltipArrow } from './tooltip-arrow';
export { CCK_TOOLTIP_DEFAULT_OPTIONS } from './tooltip-options';
export type { CckTooltipDefaultOptions } from './tooltip-options';
export { CckTooltipContent } from './tooltip-content';
export { CckTooltipPortal } from './tooltip-portal';
export { CckTooltipTrigger } from './tooltip-trigger';

/**
 * Everything you need to write a Tooltip in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckTooltipImports]
 */
export const CckTooltipImports = [
  CckTooltip,
  CckTooltipTrigger,
  CckTooltipPortal,
  CckTooltipContent,
  CckTooltipArrow,
] as const;
