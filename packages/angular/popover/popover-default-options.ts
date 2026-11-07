import { InjectionToken } from '@angular/core';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';

/** The place of a `cck-popover-content` that sets no `side` or `align`. */
export interface CckPopoverDefaultOptions {
  /** The side of the trigger where the content prefers to open. */
  side: OverlaySide;
  /** How the content lines up with the edge of the trigger. */
  align: OverlayAlign;
}

/**
 * Sets the default `side` and `align` of every popover content below the provider. An input on the content wins over it.
 *
 * Your value replaces the built-in `{ side: 'bottom', align: 'center' }`, so give both members.
 *
 * @example
 * providers: [{ provide: CCK_POPOVER_DEFAULT_OPTIONS, useValue: { side: 'top', align: 'start' } }]
 */
export const CCK_POPOVER_DEFAULT_OPTIONS = new InjectionToken<CckPopoverDefaultOptions>('CCK_POPOVER_DEFAULT_OPTIONS', {
  providedIn: 'root',
  factory: () => ({ side: 'bottom', align: 'center' }),
});
