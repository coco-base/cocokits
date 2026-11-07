import { isShadowRoot } from '@cocokits/utils';
import { closestModalDialog } from '../modal-dialog';

/** Where an overlay host goes: an element, or the shadow root of a trigger inside a shadow tree. */
export type OverlayContainer = Element | ShadowRoot;

/**
 * Chooses the container of an overlay host for a trigger, in this order: the fullscreen element of the document,
 * whatever the trigger, because only a host inside it is drawn above it; else the closest open modal `<dialog>`
 * that contains the trigger (anything outside a modal dialog is inert, so the host must be inside it); else the
 * trigger's shadow root; else the `<body>` of the trigger's document. Known limit: when an open modal dialog that
 * holds the trigger is inside the fullscreen element, the host goes into the fullscreen element, outside the
 * dialog, so the dialog makes the overlay inert: it is visible but takes no clicks or focus. Pure over the DOM it
 * is given: it reads, never writes.
 *
 * @param trigger - The element the overlay belongs to.
 * @returns The container to append the host to.
 */
export function resolveOverlayContainer(trigger: Element): OverlayContainer {
  const doc = trigger.ownerDocument;
  if (doc.fullscreenElement) return doc.fullscreenElement;
  const dialog = closestModalDialog(trigger);
  if (dialog) return dialog;
  const root = trigger.getRootNode();
  if (isShadowRoot(root)) return root;
  return doc.body;
}
