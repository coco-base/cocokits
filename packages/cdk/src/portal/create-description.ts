import { resolveOverlayContainer } from './resolve-container';

/** Options of {@link createDescription}. */
export interface DescriptionOptions {
  /** The id of the description element. */
  readonly id: string;
}

/** A hidden description of one element. */
export interface Description {
  /**
   * Sets the text. Trims it; an empty text, or one equal to the target's trimmed `aria-label`, removes the
   * element. Otherwise creates the element in the target's overlay container on first use, or updates its text.
   * @returns Whether the element exists after the call.
   */
  update(text: string): boolean;
  /** Removes the element. Idempotent. */
  destroy(): void;
}

/**
 * Creates a hidden `role="tooltip"` element that holds the description of `target`, so that a screen reader
 * announces it while the visible overlay is closed (kept per element: one
 * element per description, in the container of the target's overlay, so that an `aria-describedby` id
 * resolves inside a shadow root or an open modal dialog). The element is made in the container that
 * {@link resolveOverlayContainer} returns when it is first needed, and stays there. The helper never writes
 * the target's attributes; the caller binds `aria-describedby`. Creates nothing until `update`; touches no
 * DOM at import or on the server.
 *
 * @param target - The element described.
 * @param options - The id of the description element.
 * @returns The description.
 */
export function createDescription(target: Element, options: DescriptionOptions): Description {
  let element: HTMLElement | null = null;

  function remove(): void {
    element?.remove();
    element = null;
  }

  return {
    update(text: string): boolean {
      const trimmed = text.trim();
      if (!trimmed || trimmed === (target.getAttribute('aria-label') ?? '').trim()) {
        remove();
        return false;
      }
      if (!element) {
        element = target.ownerDocument.createElement('div');
        element.id = options.id;
        element.setAttribute('role', 'tooltip');
        element.hidden = true;
        resolveOverlayContainer(target).append(element);
      }
      element.textContent = trimmed;
      return true;
    },
    destroy: remove,
  };
}
