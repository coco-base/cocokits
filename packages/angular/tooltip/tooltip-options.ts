import { InjectionToken } from '@angular/core';
import type { TooltipAlign, TooltipSide } from '@cocokits/machines/tooltip';

/** The defaults of every Tooltip. Provide them with {@link CCK_TOOLTIP_DEFAULT_OPTIONS}. */
export interface CckTooltipDefaultOptions {
  /** How long a tooltip waits to show after a mouse or pen hover, in milliseconds. */
  showDelay: number;
  /** How long a tooltip waits to hide after the pointer leaves, in milliseconds. While the pointer can move onto the content, it waits at least 100. */
  hideDelay: number;
  /**
   * Whether the tooltip hides at once when the pointer leaves the trigger. The pointer then cannot move onto the content.
   * @remarks This fails WCAG 1.4.13. Use it only when the content holds nothing that a pointer user must reach.
   * @defaultValue false
   */
  disableTooltipInteractivity?: boolean;
  /**
   * Whether a tooltip that the pointer opens shows at the point where the pointer entered the trigger. `cckTooltipPositionAtOrigin` on a tooltip wins over it.
   * @defaultValue false
   */
  positionAtOrigin?: boolean;
  /** The side where a tooltip with only a text prefers to open. @defaultValue 'top' */
  side?: TooltipSide;
  /** How a tooltip with only a text lines up with the edge of the trigger. @defaultValue 'center' */
  align?: TooltipAlign;
}

/**
 * Sets the defaults of every Tooltip below the provider. An input on a tooltip wins over it.
 *
 * Your object replaces the built-in `{ showDelay: 0, hideDelay: 0 }`, so give both delays.
 *
 * @example
 * providers: [{ provide: CCK_TOOLTIP_DEFAULT_OPTIONS, useValue: { showDelay: 300, hideDelay: 0 } }]
 */
export const CCK_TOOLTIP_DEFAULT_OPTIONS = new InjectionToken<CckTooltipDefaultOptions>('CCK_TOOLTIP_DEFAULT_OPTIONS', {
  providedIn: 'root',
  factory: () => ({ showDelay: 0, hideDelay: 0 }),
});
