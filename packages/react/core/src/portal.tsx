'use client';

import { useContext, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { createPortalHost, type PortalHost } from '@cocokits/cdk/portal';
import type { Direction } from '@cocokits/shared';
import { DirectionContext } from './direction';
import { ThemeContext } from './theme-context';

/** Props of {@link Portal}. */
export interface PortalProps {
  /**
   * Whether the overlay is shown. Keep it `true` while the exit animation runs, so the content
   * stays in the host until it has finished.
   */
  readonly open: boolean;
  /** The trigger the overlay belongs to. Read when the portal opens, after mount. */
  readonly getTrigger: () => Element | null;
  /** The overlay content. */
  readonly children?: ReactNode;
}

/**
 * Renders the overlay content into a top-layer host next to the trigger's container (an open modal
 * dialog, the fullscreen element, a shadow root or the body). The host carries the trigger's
 * direction and page-wide theme modes. Closed, on the server and in the first client render it
 * renders nothing; the host is created in a layout effect when `open` is `true`, so an open-by-default
 * overlay appears right after hydration without a mismatch. Context crosses the portal. Because the
 * content is not inside the trigger's parent, decide inside and outside with refs, never with
 * React event bubbling.
 */
export function Portal({ open, getTrigger, children }: PortalProps): ReactElement | null {
  const direction = useContext(DirectionContext);
  const modeCollections = useContext(ThemeContext)?.themeConfig.modeCollections;
  const latest = useRef<{ getTrigger: () => Element | null; direction: Direction }>({ getTrigger, direction });
  const [host, setHost] = useState<PortalHost | null>(null);

  useLayoutEffect(() => {
    latest.current = { getTrigger, direction };
  });

  useLayoutEffect(() => {
    if (!open || latest.current.getTrigger() === null) return undefined;
    const created = createPortalHost({
      getTrigger: () => latest.current.getTrigger(),
      getDirection: () => latest.current.direction,
      modeCollections,
    });
    setHost(created);
    return () => {
      created.destroy();
      setHost(null);
    };
  }, [open, modeCollections]);

  return open && host !== null ? createPortal(children, host.element) : null;
}
