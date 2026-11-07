import { composedParent } from '@cocokits/utils';

/**
 * The closest open modal `<dialog>` that holds `element`, shadow roots crossed; `null` when none does.
 * Anything outside a modal dialog is inert, so what must stay usable (a host, a focus scope) stays inside it.
 *
 * @param element - The element to start from.
 * @returns The dialog, or `null`.
 */
export function closestModalDialog(element: Element): HTMLDialogElement | null {
  for (let current: Node | null = element; current; current = composedParent(current)) {
    if (
      current.nodeType === 1 &&
      (current as Element).localName === 'dialog' &&
      (current as Element).matches(':modal')
    ) {
      return current as HTMLDialogElement;
    }
  }
  return null;
}
