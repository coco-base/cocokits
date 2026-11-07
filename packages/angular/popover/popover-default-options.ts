import { InjectionToken } from '@angular/core';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';

/** The placement a `cck-popover-content` takes when it sets no `side` or `align`. */
export interface CckPopoverDefaultOptions {
  /** The side of the trigger the content prefers. */
  side: OverlaySide;
  /** How the content lines up along the trigger's edge. */
  align: OverlayAlign;
}

/**
 * Sets the default `side` and `align` of every Popover content below the provider. A provided value replaces
 * the built-in `{ side: 'bottom', align: 'center' }`, so give both members. An input on the element wins.
 *
 * @example
 * providers: [{ provide: CCK_POPOVER_DEFAULT_OPTIONS, useValue: { side: 'top', align: 'start' } }]
 * @see https://github.com/angular/components/blob/main/src/material/menu/menu.ts MAT_MENU_DEFAULT_OPTIONS
 */
export const CCK_POPOVER_DEFAULT_OPTIONS = new InjectionToken<CckPopoverDefaultOptions>('CCK_POPOVER_DEFAULT_OPTIONS', {
  providedIn: 'root',
  factory: () => ({ side: 'bottom', align: 'center' }),
});
