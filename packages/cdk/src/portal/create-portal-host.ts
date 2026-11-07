import type { Direction, ModeCollection } from '@cocokits/shared';
import { containsDeep } from '@cocokits/utils';
import { deepActiveElement } from '../deep-active-element';
import { registerHost } from './host-sync';
import { resolveOverlayContainer } from './resolve-container';

/** Options of {@link createPortalHost}. */
export interface PortalHostOptions {
  /** The trigger the overlay belongs to; its ancestors give the container, the modes and the direction. */
  readonly getTrigger: () => Element | null;
  /**
   * The theme's `modeCollections`. The host copies the modes of the page-wide ones (those without a
   * `componentName`) from the trigger. @defaultValue [] (no modes are copied)
   */
  readonly modeCollections?: readonly ModeCollection[] | undefined;
  /** The direction from the adapter's direction runtime. */
  readonly getDirection: () => Direction;
}

/** The element the portal adapter renders the overlay content into. */
export interface PortalHost {
  /** The host element, in the top layer. */
  readonly element: HTMLElement;
  /** Removes the host and stops the sync. Idempotent. */
  destroy(): void;
}

/** The `data-` names (without the prefix) of the page-wide collections, each once. */
function pageModeAttrNames(collections: readonly ModeCollection[] = []): readonly string[] {
  const names = collections.filter((collection) => collection.componentName === undefined);
  return [...new Set(names.map((collection) => collection.attrName))];
}

/** The host takes no space and no look: it only holds the content in the top layer. */
const HOST_STYLE =
  'position: fixed; inset: auto; margin: 0; padding: 0; border: 0; background: none; color: inherit; ' +
  'overflow: visible; width: 0; height: 0';

/**
 * Moves the host to the container the trigger resolves to now. Moving closes a popover, so the host is
 * shown again, and focus that was inside it goes back to the same element.
 */
function relocate(host: HTMLElement, trigger: Element | null): void {
  if (!trigger) return;
  const container = resolveOverlayContainer(trigger);
  if (host.parentNode === container) return;
  const active = deepActiveElement(host.ownerDocument);
  container.append(host);
  try {
    host.showPopover();
  } catch {
    // The host stays where it is in the DOM; there is no top layer to restore it to.
  }
  if (active && containsDeep(host, active)) (active as HTMLElement).focus();
}

/**
 * Creates the host of one overlay: a `popover="manual"` element appended to the container of the
 * trigger (see {@link resolveOverlayContainer}) and shown, so it sits in the top layer above earlier
 * layers and is not clipped by an ancestor's `overflow` or `transform`. It carries the trigger's
 * `dir` and mode attributes and follows their changes. It never moves nodes other than its own host,
 * on a fullscreen change: a fullscreen element is drawn above hosts shown earlier, so every open host
 * then moves to the container of the trigger (the fullscreen element, or back) and is shown again, in
 * creation order, with its focus kept. The framework portal renders into `element`, which stays the same. Call it in the browser when the overlay opens.
 *
 * Inline styles on the host are allowed because the host is not a part: it is the only element a
 * shared layer adds.
 *
 * @param options - The trigger, the theme's mode collections and the direction.
 * @returns The host; call `destroy()` when the overlay closes.
 * @throws When there is no trigger; the host cannot find its container without one.
 */
export function createPortalHost(options: PortalHostOptions): PortalHost {
  const trigger = options.getTrigger();
  if (!trigger) throw new Error('createPortalHost needs a trigger to find its container.');
  const doc = trigger.ownerDocument;
  const host = doc.createElement('div');
  host.setAttribute('popover', 'manual');
  host.style.cssText = HOST_STYLE;
  resolveOverlayContainer(trigger).append(host);
  try {
    host.showPopover();
  } catch (error) {
    host.remove();
    throw error;
  }
  // Register last: a throw above must not leave a registration behind that nothing can release.
  const release = registerHost(doc, {
    host,
    getTrigger: options.getTrigger,
    modeAttrNames: pageModeAttrNames(options.modeCollections),
    getDirection: options.getDirection,
    relocate: () => {
      relocate(host, options.getTrigger());
    },
  });
  let destroyed = false;
  return {
    element: host,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      release();
      host.remove();
    },
  };
}
