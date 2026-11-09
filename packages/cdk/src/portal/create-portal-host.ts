import type { Direction, ModeCollection } from '@cocokits/shared';
import { containsDeep } from '@cocokits/utils';
import { computedDirection } from '../direction';
import { deepActiveElement } from '../deep-active-element';
import { registerHost } from './host-sync';
import { resolveOverlayContainer } from './resolve-container';

/** Options of {@link createPortalHost}. */
export interface PortalHostOptions {
  /** Returns the trigger the overlay belongs to, or `null` when it is gone. The host takes its container, modes and direction from the trigger. */
  readonly getTrigger: () => Element | null;
  /**
   * The mode collections of your theme, such as light and dark. The host copies the page-wide modes from the
   * trigger, which are the collections without a `componentName`.
   * When not set, no mode attribute is copied.
   * @defaultValue []
   */
  readonly modeCollections?: readonly ModeCollection[] | undefined;
  /**
   * The direction the host carries.
   * @defaultValue The computed `direction` of the trigger.
   */
  readonly getDirection?: (() => Direction) | undefined;
}

/** The element that holds the content of one overlay. */
export interface PortalHost {
  /** The host element. It is in the top layer. */
  readonly element: HTMLElement;
  /** Removes the host and stops the sync. Calling it again does nothing. */
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
 * Creates the element that holds an overlay, such as a popup or a menu. The host is shown in the top layer, so it
 * is drawn above earlier layers and is not clipped by an ancestor's `overflow` or `transform`.
 *
 * @remarks
 * The host is a `popover="manual"` element. It is appended to the container that
 * {@link resolveOverlayContainer} returns for the trigger, and then shown.
 *
 * It carries the `dir` and the mode attributes of the trigger, and it follows their changes. Modes are
 * copied only when you pass `modeCollections`. Without them, only `dir` is copied.
 *
 * When an element goes fullscreen, it is drawn above the hosts shown earlier. Every open host then moves to
 * the container of its trigger, in creation order, and is shown again with its focus kept. Only the hosts
 * move. The `element` stays the same, so content you rendered into it stays too.
 *
 * Call it in the browser when the overlay opens. The host has inline styles, because it is not part of your
 * component: it is the one element that this module adds.
 *
 * @param options - The trigger, the mode collections and the direction.
 * @returns The host. Call `destroy()` when the overlay closes.
 * @throws When there is no trigger, because the host cannot find its container without one.
 * @example
 * const trigger = document.querySelector<HTMLElement>('#trigger')!;
 * const host = createPortalHost({ getTrigger: () => trigger });
 * host.element.append(document.createTextNode('Overlay content'));
 * // When the overlay closes:
 * host.destroy();
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
    getDirection:
      options.getDirection ??
      (() => {
        const current = options.getTrigger();
        return current ? computedDirection(current) : 'ltr';
      }),
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
