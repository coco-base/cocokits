'use client';

import { createContext, useContext, type Context, type ReactElement } from 'react';

/** What an overlay content gives its Arrow part. */
export interface OverlayArrowContextValue {
  /** Registers the arrow element, so the content positions it; the Arrow puts it in its ref. */
  readonly setElement: (element: HTMLElement | null) => void;
  /** Whether the arrow cannot point at the anchor and must be hidden. */
  readonly hidden: boolean;
}

/** The context of an overlay content that can hold an arrow. */
export const OverlayArrowContext: Context<OverlayArrowContextValue | null> =
  createContext<OverlayArrowContextValue | null>(null);

/**
 * Reads the content's arrow context.
 *
 * @param part - The part that asks, for the error message, such as `Popover.Arrow`.
 * @param content - The content part it belongs inside, such as `Popover.Content`.
 * @returns The context.
 * @throws When the part is not inside the content.
 */
export function useOverlayArrowContext(part: string, content: string): OverlayArrowContextValue {
  const context = useContext(OverlayArrowContext);
  if (context === null) throw new Error(`CocoKits: <${part}> must be placed within <${content}>.`);
  return context;
}

/** The built-in triangle of an arrow; author children replace it. */
export function OverlayArrowTriangle(): ReactElement {
  return (
    <svg width="10" height="5" viewBox="0 0 30 10" preserveAspectRatio="none" style={{ display: 'block' }}>
      <polygon points="0,0 30,0 15,10" />
    </svg>
  );
}
