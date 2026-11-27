import { focusFirst, type FocusReturn } from '@cocokits/cdk/focus';
import type { DialogAutoFocus, DialogRestoreFocus } from './dialog.types';

const HEADING = 'h1, h2, h3, h4, h5, h6, [role="heading"]';

/** Focuses an element that may not be focusable: it gets `tabindex="-1"` until it loses focus. */
function forceFocus(element: HTMLElement): void {
  element.focus();
  if (element.ownerDocument.activeElement === element) return;
  element.setAttribute('tabindex', '-1');
  element.addEventListener(
    'blur',
    () => {
      element.removeAttribute('tabindex');
    },
    { once: true },
  );
  element.focus();
}

/**
 * Places the focus in a dialog that `showModal()` has just opened. The native focusing steps have run: they focus
 * the first element with `autofocus`, else the first control in tree order, else the dialog. For `'first-tabbable'`,
 * `true` and `undefined` the focus moves on to the first Tab stop, so a checked radio wins over the first radio of
 * its group, and the page does not scroll to it.
 *
 * @param dialog - The opened `<dialog>`.
 * @param autoFocus - The `autoFocus` prop.
 */
export function applyAutoFocus(dialog: HTMLDialogElement, autoFocus: DialogAutoFocus | undefined): void {
  if (autoFocus === undefined || autoFocus === true || autoFocus === 'first-tabbable') {
    focusFirst(dialog);
    return;
  }
  if (autoFocus === false || autoFocus === 'dialog') {
    forceFocus(dialog);
    return;
  }
  const target = dialog.querySelector<HTMLElement>(autoFocus === 'first-heading' ? HEADING : autoFocus);
  if (target) forceFocus(target);
}

/**
 * Moves the focus when the dialog has closed: back to where it was (`true`), nowhere (`false`), to the first element
 * a selector matches or to an element.
 *
 * @param doc - The document of the dialog.
 * @param restoreFocus - The `restoreFocus` prop.
 * @param focusReturn - The captured return point of the dialog, `null` when there is none.
 */
export function restoreFocusTo(doc: Document, restoreFocus: DialogRestoreFocus, focusReturn: FocusReturn | null): void {
  if (restoreFocus === true) focusReturn?.restore();
  else if (restoreFocus === false) return;
  else if (typeof restoreFocus === 'string') doc.querySelector<HTMLElement>(restoreFocus)?.focus();
  else restoreFocus.focus();
}
