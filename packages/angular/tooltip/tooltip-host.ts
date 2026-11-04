import { Renderer2, effect, inject, type Signal } from '@angular/core';
import { bindAttrs, mergeIds } from '@cocokits/angular-core';
import type { TooltipParts } from '@cocokits/machines/tooltip';
import type { ThemeAttrs } from '@cocokits/shared';

/** What {@link bindTooltipHost} reads. @internal */
export interface TooltipHostOptions {
  /** The host element, the trigger of the one-attribute form. */
  readonly host: HTMLElement;
  /** Whether the host is the trigger now (no compound part registered a template). */
  readonly active: Signal<boolean>;
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
 * One-attribute form: the host is the trigger. It gets the trigger's class, id, `aria-describedby`,
 * `data-state`, theme attributes and handlers with `Renderer2`, because a host binding is not allowed on an
 * `ng-container`. The effect also runs on the server, so the markup matches. Call it in an injection context.
 *
 * @param options - The host and the signals to read.
 * @internal
 */
export function bindTooltipHost(options: TooltipHostOptions): void {
  const { host, active, parts, theme, id, describedBy } = options;
  const renderer = inject(Renderer2);
  effect(() => {
    if (!active()) return;
    const props = parts().trigger;
    renderer.addClass(host, props.class);
    renderer.setAttribute(host, 'id', id() ?? props.id);
    renderer.setAttribute(host, 'data-state', props['data-state']);
    const ids = mergeIds(describedBy(), props['aria-describedby']);
    if (ids) renderer.setAttribute(host, 'aria-describedby', ids);
    else renderer.removeAttribute(host, 'aria-describedby');
  });
  bindAttrs(host, () => (active() ? theme() : {}));
  // Only while the host is the trigger; the handlers are the machine's.
  const trigger = (): TooltipParts['trigger'] | null => (active() ? parts().trigger : null);
  renderer.listen(host, 'pointerenter', (event: PointerEvent) => {
    trigger()?.onPointerEnter(event);
  });
  renderer.listen(host, 'pointerleave', (event: PointerEvent) => {
    trigger()?.onPointerLeave(event);
  });
  renderer.listen(host, 'pointerdown', (event: PointerEvent) => {
    trigger()?.onPointerDown(event);
  });
  renderer.listen(host, 'focus', (event: FocusEvent) => {
    trigger()?.onFocus(event);
  });
  renderer.listen(host, 'blur', (event: FocusEvent) => {
    trigger()?.onBlur(event);
  });
}
