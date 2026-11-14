import type { Renderer2 } from '@angular/core';
import { deepActiveElement, focusFirst } from '@cocokits/cdk/focus';
import type { CckDialogAutoFocus } from './dialog-config';

/** The focused element of the document, looking through open shadow roots, else its body. */
export function deepActiveOrBody(doc: Document): HTMLElement {
  const active = deepActiveElement(doc);
  return active instanceof HTMLElement && active !== doc.documentElement ? active : doc.body;
}

/**
 * Focuses an element that may not be focusable: it gets `tabindex="-1"` until it loses focus.
 *
 * @param element - The element to focus.
 * @param renderer - Sets the attribute and listens for the blur.
 */
function forceFocus(element: HTMLElement, renderer: Renderer2): void {
  element.focus();
  if (element.ownerDocument.activeElement === element) return;
  renderer.setAttribute(element, 'tabindex', '-1');
  const stop = renderer.listen(element, 'blur', () => {
    stop();
    renderer.removeAttribute(element, 'tabindex');
  });
  element.focus();
}

/**
 * Places focus in a dialog that `showModal()` has just opened. The
 * native focusing steps have already run. `'dialog'` and `false` need nothing here: the `<dialog>` is rendered
 * with `autofocus`, so the native steps focus it. `undefined` leaves focus where the native steps put it.
 *
 * @param dialog - The opened `<dialog>`.
 * @param autoFocus - The config value.
 * @param renderer - Sets attributes and listens for events.
 */
export function applyAutoFocus(
  dialog: HTMLDialogElement,
  autoFocus: CckDialogAutoFocus | undefined,
  renderer: Renderer2,
): void {
  if (autoFocus === undefined || autoFocus === false || autoFocus === 'dialog') return;
  if (autoFocus === true || autoFocus === 'first-tabbable') {
    focusFirst(dialog);
    return;
  }
  const selector = autoFocus === 'first-heading' ? 'h1, h2, h3, h4, h5, h6, [role="heading"]' : autoFocus;
  const target = dialog.querySelector<HTMLElement>(selector);
  if (target) forceFocus(target, renderer);
}
