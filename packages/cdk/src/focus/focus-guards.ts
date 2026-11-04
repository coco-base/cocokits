import { containsDeep, sortByDomOrder } from '@cocokits/utils';
import { closestModalDialog } from '../modal-dialog';
import { deepActiveElement } from '../deep-active-element';
import { getTabbables } from './tabbables';

/** Options of {@link connectFocusGuards}. */
export interface FocusGuardsOptions {
  /** The overlay content between the guards. */
  readonly getContent: () => HTMLElement | null;
  /** The element that opened the overlay. */
  readonly getTrigger: () => HTMLElement | null;
  /** The start and the end guard the adapter rendered; `null` while one is not rendered. */
  readonly getGuards: () => readonly [HTMLElement | null, HTMLElement | null];
  /**
   * `true` wraps Tab inside the content: the end guard sends focus to the first tabbable element of the
   * content, the start guard to the last, and the trigger is not involved. For a modal overlay. Default `false`.
   */
  readonly loop?: boolean;
}

/** The connection of the guards. */
export interface FocusGuards {
  /** Removes the listener. Idempotent. */
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
 * Connects the focus guards of a non-modal overlay that takes focus. The moment the end guard receives
 * focus, Tab goes on to the element after the trigger in rendered order, shadow roots crossed (inside the modal dialog that holds the trigger, if any, where
 * it wraps to the start of the dialog when nothing follows); the moment the start guard does, Shift+Tab goes
 * to the trigger. A guard is never the focused element afterwards. The adapter renders the guards: two
 * empty `span tabindex="0"` without `aria-hidden`, visually hidden.
 *
 * With `loop`, Tab and Shift+Tab wrap inside the content instead.
 *
 * @param options - Getters for the content, trigger and guards, and `loop`.
 * @returns The connection.
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
