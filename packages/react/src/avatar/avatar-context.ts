'use client';

import { createContext, useContext, type Context } from 'react';
import type { AvatarImageLoadingStatus } from '@cocokits/machines/avatar';

/** What the Root gives its parts. */
export interface AvatarContextValue {
  /** The loading status of the picture; the Image writes it. */
  readonly status: AvatarImageLoadingStatus;
  /** Sets the status. */
  readonly setStatus: (status: AvatarImageLoadingStatus) => void;
  /** Counts an Image; returns the function that removes it. The Root warns in development about a second one. */
  readonly registerImage: () => () => void;
}

/** The context of the Root. */
export const AvatarContext: Context<AvatarContextValue | null> = createContext<AvatarContextValue | null>(null);

/**
 * Reads the Root's context.
 *
 * @param part - The part that asks, for the error message, such as `Avatar.Image`.
 * @returns The context.
 * @throws When the part is not inside an `Avatar.Root`.
 */
export function useAvatarContext(part: string): AvatarContextValue {
  const context = useContext(AvatarContext);
  if (context === null) throw new Error(`CocoKits: <${part}> must be placed within <Avatar.Root>.`);
  return context;
}
