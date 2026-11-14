'use client';

import { createContext, type Context, type RefObject } from 'react';
import type { DismissLayer } from '@cocokits/cdk/dismissal';

/**
 * The dismiss layer of the overlay content a component sits in, so an overlay opened from inside it names it as
 * its parent (`getParent`): a press inside the child is inside the parent, and the child stacks above it. `null` outside any overlay.
 */
export const DismissLayerContext: Context<RefObject<DismissLayer | null> | null> =
  createContext<RefObject<DismissLayer | null> | null>(null);
