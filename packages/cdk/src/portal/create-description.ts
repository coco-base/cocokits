import { resolveOverlayContainer } from './resolve-container';

/** Options of {@link createDescription}. */
export interface DescriptionOptions {
  /** The id of the description element. Bind it to `aria-describedby` on the target. */
  readonly id: string;
}

/** A hidden description of one element, for screen readers. */
export interface Description {
  /**
   * Sets the text of the description. The text is trimmed.
   * An empty text, or a text equal to the trimmed `aria-label` of the target, removes the element.
   *
   * Otherwise the element is created in the overlay container on first use, or its text is updated.
   *
   * @param text - The description text.
   * @returns Whether the element exists after the call.
   * @example
   * const exists = description.update('Opens the settings dialog');
   */
  update(text: string): boolean;
  /** Removes the element. Calling it again does nothing. */
  destroy(): void;
}

/**
 * Creates a hidden description for an element, so a screen reader can announce it while the visible
 * overlay is closed. The description is a `role="tooltip"` element.
 *
 * @remarks
 * There is one element for each description. It lives in the container that {@link resolveOverlayContainer}
 * returns, so an `aria-describedby` id also resolves inside a shadow root or an open modal dialog.
 *
 * It never writes attributes on the target. You bind `aria-describedby` yourself.
 * It creates nothing until the first `update`, and it touches no DOM when imported or on a server.
 *
 * @param target - The element to describe.
 * @param options - The id of the description element.
 * @returns The description. Call `destroy()` when you are done.
 * @example
 * const button = document.querySelector<HTMLElement>('#settings')!;
 * const description = createDescription(button, { id: 'settings-description' });
 * button.setAttribute('aria-describedby', 'settings-description');
 * description.update('Opens the settings dialog');
 * // Later, when you are done:
 * description.destroy();
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
