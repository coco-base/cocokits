import { isShadowRoot } from '@cocokits/utils';
import { closestModalDialog } from '../modal-dialog';

/** Where an overlay host goes: an element, or the shadow root of a trigger that is inside a shadow tree. */
export type OverlayContainer = Element | ShadowRoot;

/**
 * Chooses the element or shadow root that should hold an overlay for a trigger. It only reads the page.
 *
 * @remarks
 * The choice follows this order:
 * 1. The fullscreen element of the document, whatever the trigger is. Only an overlay inside it is drawn above it.
 * 2. The closest open modal `<dialog>` that contains the trigger. Everything outside a modal dialog is inert, so the overlay must be inside it.
 * 3. The shadow root of the trigger, when the trigger is inside a shadow tree.
 * 4. The `<body>` of the document of the trigger.
 *
 * There is one known limit. When an open modal dialog that holds the trigger is inside the fullscreen element,
 * the overlay goes into the fullscreen element, outside the dialog. The dialog then makes it inert, so it is
 * visible but takes no clicks or focus.
 *
 * @param trigger - The element the overlay belongs to.
 * @returns The container to append the overlay to.
 * @example
 * const trigger = document.querySelector<HTMLElement>('#trigger')!;
 * const container = resolveOverlayContainer(trigger);
 * container.append(document.createElement('div'));
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
