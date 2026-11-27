import { InjectionToken, Injector, inject, type ProviderToken, type StaticProvider } from '@angular/core';
import { CckOverlayLayer } from './overlay-layer';
import { CckPortal } from './portal';

/**
 * The injector of the element that holds an overlay root. The content injector of `createOverlayOutlet` holds it, so
 * a part in the content can read a directive on that element with `injectOverlayHost`.
 *
 * @internal
 */
export const CCK_OVERLAY_HOST: InjectionToken<Injector> = new InjectionToken<Injector>('CCK_OVERLAY_HOST');

/**
 * Says that a trigger on this element owns its `id` and `data-state`. Every overlay trigger that writes them provides
 * it, with the trigger as the value; another overlay on the same element (a tooltip) reads it with `self` and then
 * leaves both attributes alone. A tooltip trigger never provides it.
 *
 * @internal
 */
export const CCK_OVERLAY_TRIGGER: InjectionToken<unknown> = new InjectionToken<unknown>('CCK_OVERLAY_TRIGGER');

/** What `createOverlayOutlet` gives an overlay root. */
export interface OverlayOutlet {
  /** The portal of the content; the part that holds the template gives it its view container. */
  readonly portal: CckPortal;
  /** The dismiss layer of this overlay; the root sets `current` while it is open. */
  readonly layer: CckOverlayLayer;
  /** The layer of the overlay this one is declared in, else `null`. Pass its `current` as `getParent`. */
  readonly parentLayer: CckOverlayLayer | null;
  /** Pass it to `portal.attach` as `injector`. */
  readonly injector: Injector;
}

/**
 * Creates the portal and the dismiss layer of an overlay root, and the injector its content is attached with. Call
 * it in the constructor or a field of the root (an injection context). The root owns both instances, so another
 * overlay on the same element keeps its own; never list `CckPortal` or `CckOverlayLayer` in `providers` of a root that
 * a trigger applies.
 *
 * The content injector has no parent. It holds the root under `token`, the layer, `CCK_OVERLAY_HOST` and `providers`,
 * so the parts in the content find them first, and every other token still resolves at the declaration.
 *
 * @example
 * ```ts
 * private readonly outlet = createOverlayOutlet(CckPopover, this);
 * // later, from afterRenderEffect:
 * this.outlet.portal.attach(template, undefined, trigger, { injector: this.outlet.injector });
 * ```
 *
 * @param token - The token the parts inject the root with.
 * @param root - The root itself.
 * @param providers - More providers of this overlay that its content must find first.
 * @returns The portal, the layer, the parent layer and the content injector.
 * @internal
 */
export function createOverlayOutlet<T>(
  token: ProviderToken<T>,
  root: T,
  providers: readonly StaticProvider[] = [],
): OverlayOutlet {
  const layer = new CckOverlayLayer();
  return {
    portal: new CckPortal(),
    layer,
    parentLayer: inject(CckOverlayLayer, { optional: true, skipSelf: true }),
    injector: Injector.create({
      providers: [
        { provide: token, useValue: root },
        { provide: CckOverlayLayer, useValue: layer },
        { provide: CCK_OVERLAY_HOST, useValue: inject(Injector) },
        ...providers,
      ],
    }),
  };
}

/**
 * Reads a directive on the element of the overlay root around this content, such as a theme directive next to the
 * trigger. Call it in an injection context of a part in the content.
 *
 * @param token - The directive or token to read on that element only.
 * @returns It, or `null` when the element has none or the content is not in an outlet.
 * @internal
 */
export function injectOverlayHost<T>(token: ProviderToken<T>): T | null {
  return inject(CCK_OVERLAY_HOST, { optional: true })?.get(token, null, { self: true }) ?? null;
}
