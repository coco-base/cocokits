'use client';

import { createContext, type Context } from 'react';
import type { TooltipGroup } from '@cocokits/machines/tooltip';

/** What a `Tooltip.Provider` gives the tooltips inside it. */
export interface TooltipProviderContextValue {
  /** The default `delayDuration` of the group. */
  readonly delayDuration: number;
  /** The default `disableHoverableContent` of the group. */
  readonly disableHoverableContent: boolean;
  /** The delay group: it shortens the delay after a tooltip of the group opened or closed. */
  readonly group: TooltipGroup;
}

/** The context of the Provider; `null` outside one, where the built-in defaults apply and there is no group. */
export const TooltipProviderContext: Context<TooltipProviderContextValue | null> =
  createContext<TooltipProviderContextValue | null>(null);
