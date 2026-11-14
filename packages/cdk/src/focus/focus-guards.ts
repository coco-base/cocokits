import { containsDeep, sortByDomOrder } from '@cocokits/utils';
import { closestModalDialog } from '../modal-dialog';
import { deepActiveElement } from '../deep-active-element';
import { getTabbables } from './tabbables';

/** Options of {@link connectFocusGuards}. */
export interface FocusGuardsOptions {
  /** Returns the overlay content that sits between the guards, or `null` while it is not rendered. */
  readonly getContent: () => HTMLElement | null;
  /** Returns the element that opened the overlay, or `null` when it is gone. */
  readonly getTrigger: () => HTMLElement | null;
  /** Returns the start guard and the end guard, or `null` for a guard that is not rendered. */
  readonly getGuards: () => readonly [HTMLElement | null, HTMLElement | null];
  /**
   * Whether Tab wraps inside the content, for a modal overlay.
   * The end guard sends focus to the first tabbable element of the content, and the start guard sends it to the last.
   * The trigger is not involved.
   * @defaultValue false
   */
  readonly loop?: boolean;
}

/** The connection of the guards. */
export interface FocusGuards {
  /** Removes the listener. Calling it again does nothing. */
  destroy(): void;
}

/**
 * The tabbables after the trigger, in rendered order, shadow roots crossed. The scope is the open modal dialog
 * that holds the trigger (the rest of the page is inert), else the `<body>` of the trigger's document.
 */
function candidatesAfterTrigger(
  trigger: HTMLElement,
  content: HTMLElement | null,
  guards: readonly (HTMLElement | null)[],
): { readonly after: HTMLElement[]; readonly wrap: HTMLElement[] } {
  const dialog = closestModalDialog(trigger);
  const reachable = getTabbables(dialog ?? trigger.ownerDocument.body).filter(
    (candidate) => !guards.includes(candidate) && !(content && containsDeep(content, candidate)),
  );
  const ordered = sortByDomOrder([trigger, ...reachable.filter((candidate) => candidate !== trigger)]);
  const after = ordered.slice(ordered.indexOf(trigger) + 1).filter((candidate) => !containsDeep(trigger, candidate));
  // Inside a modal dialog nothing outside it can take focus, so Tab wraps to the start of the dialog.
  return { after, wrap: dialog ? reachable : [] };
}

/** The loop: the end guard sends focus to the first tabbable of the content, the start guard to the last. */
function wrapInside(
  content: HTMLElement | null,
  target: EventTarget | undefined,
  start: HTMLElement | null,
  end: HTMLElement | null,
): void {
  if (!content || (target !== start && target !== end)) return;
  const tabbables = getTabbables(content).filter((candidate) => candidate !== start && candidate !== end);
  const next = target === end ? tabbables[0] : tabbables.at(-1);
  (next ?? content).focus();
}

/**
 * Connects the focus guards of an overlay that takes focus but does not trap it, such as a popup next to its
 * trigger. Tab leaves the overlay in the right place, and focus never stays on a guard.
 *
 * @remarks
 * You render the guards: two empty `span` elements with `tabindex="0"`, visually hidden, without `aria-hidden`.
 * Put one before the content and one after it.
 *
 * When the end guard gets focus, Tab goes on to the element after the trigger, in rendered order and across
 * shadow roots. When the start guard gets focus, Shift+Tab goes to the trigger. When no element follows the
 * trigger, focus is removed from the page. Inside a modal dialog that holds the trigger, Tab wraps to the start of the dialog.
 *
 * With `loop`, Tab and Shift+Tab wrap inside the content instead.
 *
 * @param options - Functions that return the content, the trigger and the guards, and the `loop` flag.
 * @returns The connection. Call `destroy()` when the overlay closes.
 * @example
 * const trigger = document.querySelector<HTMLElement>('#trigger')!;
 * const content = document.querySelector<HTMLElement>('#content')!;
 * const guards = [...document.querySelectorAll<HTMLElement>('.guard')] as [HTMLElement, HTMLElement];
 * const connection = connectFocusGuards({
 *   getContent: () => content,
 *   getTrigger: () => trigger,
 *   getGuards: () => guards,
 * });
 * // When the overlay closes:
 * connection.destroy();
 */
export function connectFocusGuards(options: FocusGuardsOptions): FocusGuards {
  const doc = (options.getTrigger() ?? options.getContent())?.ownerDocument;
  if (!doc) return { destroy: () => undefined };
  const onFocusIn = (event: FocusEvent): void => {
    const target = event.composedPath()[0];
    const [start, end] = options.getGuards();
    if (options.loop) {
      wrapInside(options.getContent(), target, start, end);
      return;
    }
    const trigger = options.getTrigger();
    if (!trigger || !target || (target !== start && target !== end)) return;
    if (target === start) {
      trigger.focus();
      return;
    }
    // An element that does not take focus (hidden by a style, inert) is skipped for the next one.
    const { after, wrap } = candidatesAfterTrigger(trigger, options.getContent(), [start, end]);
    const taken = [...after, ...wrap].some((candidate) => {
      candidate.focus();
      return deepActiveElement(doc) === candidate;
    });
    if (!taken) (deepActiveElement(doc) as HTMLElement | null)?.blur();
  };
  doc.addEventListener('focusin', onFocusIn, true);
  return {
    destroy() {
      doc.removeEventListener('focusin', onFocusIn, true);
    },
  };
}
