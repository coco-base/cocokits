import { focusFirst } from '@cocokits/cdk/focus';
import type { DialogAutoFocus, DialogCloseOnNavigation } from './dialog.types';

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
 * Places focus in a dialog that `showModal()` has just opened. The browser's focusing steps have already run: they
 * start on an `autofocus` element, else the first focusable one in tree order. For `'first-tabbable'`, `true` and a
 * missing value the focus moves on to the first Tab stop, so a checked radio wins over the first radio of its group,
 * and the page does not scroll to it. `'dialog'` and `false` are written as `autofocus` on the `<dialog>` (see
 * `focusesDialog`).
 *
 * @internal
 * @param dialog - The opened `<dialog>`.
 * @param autoFocus - The `autoFocus` prop of the root.
 */
export function applyAutoFocus(dialog: HTMLDialogElement, autoFocus: DialogAutoFocus | undefined): void {
  if (focusesDialog(autoFocus)) return;
  if (typeof autoFocus !== 'string' || autoFocus === 'first-tabbable') {
    focusFirst(dialog);
    return;
  }
  const selector = autoFocus === 'first-heading' ? 'h1, h2, h3, h4, h5, h6, [role="heading"]' : autoFocus;
  const target = dialog.querySelector<HTMLElement>(selector);
  if (target) forceFocus(target);
}

/**
 * @internal
 * @param autoFocus - The `autoFocus` prop of the root.
 * @returns Whether the `<dialog>` itself gets the focus: the native focusing steps then find it with `autofocus`.
 */
export function focusesDialog(autoFocus: DialogAutoFocus | undefined): boolean {
  return autoFocus === 'dialog' || autoFocus === false;
}

/**
 * The element that gets the focus on close, when it is not the opener.
 *
 * @internal
 * @param restoreFocus - The `restoreFocus` prop of the root.
 * @param doc - The document of the dialog.
 * @returns The element, or `null` when the selector matches nothing.
 */
export function restoreTarget(restoreFocus: string | HTMLElement, doc: Document): HTMLElement | null {
  return typeof restoreFocus === 'string' ? doc.querySelector<HTMLElement>(restoreFocus) : restoreFocus;
}

/**
 * Listens for a change of the location while a dialog is open.
 *
 * @internal
 * @param mode - The `closeOnNavigation` prop of the root.
 * @param onNavigate - Called for each change.
 * @returns The function that stops listening; a no-op when the mode is `false`.
 */
export function watchNavigation(mode: DialogCloseOnNavigation | undefined, onNavigate: () => void): () => void {
  if (mode === false || typeof window === 'undefined') return () => undefined;
  const targets: [EventTarget, string][] = [
    [window, 'popstate'],
    [window, 'hashchange'],
  ];
  const navigation = (window as { navigation?: EventTarget }).navigation;
  if (mode === 'url-change' && navigation) targets.push([navigation, 'currententrychange']);
  for (const [target, name] of targets) target.addEventListener(name, onNavigate);
  return () => {
    for (const [target, name] of targets) target.removeEventListener(name, onNavigate);
  };
}
