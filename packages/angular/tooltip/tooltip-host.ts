import { Renderer2, effect, inject, type Signal } from '@angular/core';
import { CCK_OVERLAY_TRIGGER, bindAttrs, mergeIds } from '@cocokits/angular-core';
import type { TooltipParts } from '@cocokits/machines/tooltip';
import type { ThemeAttrs } from '@cocokits/shared';

/** What {@link bindTooltipHost} reads. @internal */
export interface TooltipHostOptions {
  /** The host element, the trigger. */
  readonly host: HTMLElement;
  /** The machine props. */
  readonly parts: Signal<TooltipParts>;
  /** The theme attributes of the trigger part. */
  readonly theme: Signal<ThemeAttrs>;
  /** The id the author gave the host. */
  readonly id: Signal<string | null | undefined>;
  /** The ids the author gave to describe the host. */
  readonly describedBy: Signal<string | null | undefined>;
}

/**
 * The host is the trigger, in both forms. It gets the trigger's class, id, `aria-describedby`, `data-state`, theme
 * attributes and handlers with `Renderer2`, so nothing is written when another overlay trigger on the element
 * (`CCK_OVERLAY_TRIGGER`) owns the `id` and `data-state`: its content stays labelled by that id. The effect also runs
 * on the server, so the markup matches. Call it in an injection context.
 *
 * @param options - The host and the signals to read.
 * @internal
 */
export function bindTooltipHost(options: TooltipHostOptions): void {
  const { host, parts, theme, id, describedBy } = options;
  const renderer = inject(Renderer2);
  const ownsIdAndState = inject(CCK_OVERLAY_TRIGGER, { optional: true, self: true }) === null;
  effect(() => {
    const props = parts().trigger;
    renderer.addClass(host, props.class);
    if (ownsIdAndState) {
      renderer.setAttribute(host, 'id', id() ?? props.id);
      renderer.setAttribute(host, 'data-state', props['data-state']);
    }
    const ids = mergeIds(describedBy(), props['aria-describedby']);
    if (ids) renderer.setAttribute(host, 'aria-describedby', ids);
    else renderer.removeAttribute(host, 'aria-describedby');
  });
  bindAttrs(host, theme);
  // The handlers are the machine's.
  const trigger = (): TooltipParts['trigger'] => parts().trigger;
  renderer.listen(host, 'pointerenter', (event: PointerEvent) => {
    trigger().onPointerEnter(event);
  });
  renderer.listen(host, 'pointerleave', (event: PointerEvent) => {
    trigger().onPointerLeave(event);
  });
  renderer.listen(host, 'pointerdown', (event: PointerEvent) => {
    trigger().onPointerDown(event);
  });
  renderer.listen(host, 'focus', (event: FocusEvent) => {
    trigger().onFocus(event);
  });
  renderer.listen(host, 'blur', (event: FocusEvent) => {
    trigger().onBlur(event);
  });
}
