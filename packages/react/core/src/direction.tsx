'use client';

import { createContext, useContext, type Context, type ReactElement, type ReactNode } from 'react';
import type { Direction } from '@cocokits/shared';

export type { Direction };

/** The nearest direction. The default `'ltr'` applies without a provider. @internal */
export const DirectionContext: Context<Direction> = createContext<Direction>('ltr');

/** Props of {@link DirectionProvider}. */
export interface DirectionProviderProps {
  /** The direction of the subtree. */
  readonly dir: Direction;
  /** The subtree that reads the direction. */
  readonly children?: ReactNode;
}

/**
 * Provides the direction for the app or a subtree. A nested provider replaces the outer one. It
 * renders no element and does not set the `dir` attribute: the app sets that itself. Context
 * crosses the overlay portal, so overlay content reads the same direction.
 */
export function DirectionProvider({ dir, children }: DirectionProviderProps): ReactElement {
  return <DirectionContext value={dir}>{children}</DirectionContext>;
}

/**
 * Reads the direction of the nearest {@link DirectionProvider}.
 *
 * @returns `'rtl'` or `'ltr'`; `'ltr'` without a provider.
 */
export function useDirection(): Direction {
  return useContext(DirectionContext);
}
