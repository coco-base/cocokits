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
 * Holds the delay group and the defaults of the tooltips inside it. It renders no element. Wrap the page or a
 * toolbar in it once.
 *
 * After a tooltip of the group shows, the next hover in the group shows without delay. This goes on for
 * `skipDelayDuration` after the last tooltip hides.
 *
 * It is optional: a tooltip outside any Provider has the built-in defaults and no group. A Provider inside another
 * Provider makes its own group.
 *
 * @example
 * <Tooltip.Provider delayDuration={400}>
 *   <Tooltip.Root>...</Tooltip.Root>
 * </Tooltip.Provider>
 * @cckPart provider
 * @cckSemantic none
 * @cckParity Not available in every framework.
 * @param props - The Provider props.
 * @returns The children inside the provider.
 */
export const TooltipProvider: TooltipPart<TooltipProviderProps> = Object.assign(TooltipProviderImpl, {
  displayName: 'Tooltip.Provider',
});
