import { InjectionToken } from '@angular/core';
import type { TooltipAlign, TooltipSide } from '@cocokits/machines/tooltip';

/** The defaults of every Tooltip, provided with {@link CCK_TOOLTIP_DEFAULT_OPTIONS}. */
export interface CckTooltipDefaultOptions {
  /** Milliseconds between a mouse or pen hover and the tooltip showing. */
  showDelay: number;
  /** Milliseconds between the pointer leaving and the tooltip hiding; at least 100 apply while the content is hoverable. */
  hideDelay: number;
  /**
   * The pointer leaving the trigger hides the tooltip at once and the pointer on the content does not keep it
   * open. The content then is not hoverable, which fails WCAG 1.4.13 (Content on Hover or Focus); use it only
   * when the content adds nothing a pointer user must reach.
   * @defaultValue false
   */
  disableTooltipInteractivity?: boolean;
  /**
   * Place a tooltip the pointer opens against the point where the pointer entered the trigger, not the trigger
   * box; `cckTooltipPositionAtOrigin` on a tooltip wins.
   * @defaultValue false
   */
  positionAtOrigin?: boolean;
  /** The side of the one-attribute form. @defaultValue 'top' */
  side?: TooltipSide;
  /** The alignment of the one-attribute form. @defaultValue 'center' */
  align?: TooltipAlign;
}

/**
 * The defaults of every Tooltip. A provided object replaces the built-in `{ showDelay: 0, hideDelay: 0 }`
 * (Angular Material's `MAT_TOOLTIP_DEFAULT_OPTIONS` does the same); an input on a tooltip wins over it.
 *
 * @example
 * providers: [{ provide: CCK_TOOLTIP_DEFAULT_OPTIONS, useValue: { showDelay: 300, hideDelay: 0 } }]
 */
export const CCK_TOOLTIP_DEFAULT_OPTIONS = new InjectionToken<CckTooltipDefaultOptions>('CCK_TOOLTIP_DEFAULT_OPTIONS', {
  providedIn: 'root',
  factory: () => ({ showDelay: 0, hideDelay: 0 }),
});
