'use client';

import { useMemo, type ReactElement } from 'react';
import { createTooltipGroup } from '@cocokits/machines/tooltip';
import { TooltipProviderContext, type TooltipProviderContextValue } from './tooltip-provider-context';
import type { TooltipPart, TooltipProviderProps } from './tooltip.types';

function TooltipProviderImpl({
  delayDuration = 700,
  skipDelayDuration = 300,
  disableHoverableContent = false,
  children,
}: TooltipProviderProps): ReactElement {
  // A new group when the window changes: the old one's open and close facts do not carry over.
  const group = useMemo(() => createTooltipGroup({ skipDelayDuration }), [skipDelayDuration]);
  const value = useMemo<TooltipProviderContextValue>(
    () => ({ delayDuration, disableHoverableContent, group }),
    [delayDuration, disableHoverableContent, group],
  );
  return <TooltipProviderContext.Provider value={value}>{children}</TooltipProviderContext.Provider>;
}

/**
 * Holds the delay group and the defaults of the tooltips inside it. It renders no element. After a tooltip of the
 * group opens, the next hover in the group opens without delay, and keeps doing so for `skipDelayDuration` after
 * the last one closed. Wrap the page, or a toolbar, once; it is optional, and a tooltip outside any Provider has
 * the built-in defaults and no group. A nested Provider forms its own group.
 *
 * @example
 * <Tooltip.Provider delayDuration={400}>
 *   <Tooltip.Root>...</Tooltip.Root>
 * </Tooltip.Provider>
 * @cckPart provider
 * @cckSemantic none
 * @cckParity React and Vue only (Radix and Reka); Angular sets the defaults with CCK_TOOLTIP_DEFAULT_OPTIONS and has no group.
 * @param props - The Provider props.
 * @returns The children inside the provider.
 */
export const TooltipProvider: TooltipPart<TooltipProviderProps> = Object.assign(TooltipProviderImpl, {
  displayName: 'Tooltip.Provider',
});
