import { tooltipAnatomy } from './tooltip.anatomy';
import type {
  TooltipEvent,
  TooltipIds,
  TooltipParts,
  TooltipSchedule,
  TooltipState,
  TooltipTransition,
} from './tooltip.types';

/**
 * The shortest wait before a pointer leave hides the tooltip, in milliseconds. A pointer that crosses the
 * gap between the trigger and the content must find the tooltip still open (WCAG 1.4.13 hoverable), also
 * with the default `closeDelay` of `0`.
 */
export const TOOLTIP_LEAVE_GRACE_MS = 100;

/** The default `delay` before a hover shows the tooltip, in milliseconds. */
const DEFAULT_DELAY_MS = 700;

/**
 * Derives the ids of the tooltip parts that link to each other.
 *
 * @param id - The id of the tooltip, from the adapter.
 * @returns The trigger, content and description ids.
 */
export function tooltipIds(id: string): TooltipIds {
  return { trigger: `${id}-trigger`, content: `${id}-content`, description: `${id}-description` };
}

const NOTHING: TooltipTransition = {};

function show(state: TooltipState, reason: 'hover' | 'focus', delay: number): TooltipTransition | null {
  if (state.disabled) return null;
  return state.open ? NOTHING : { schedule: { open: true, reason, delay } };
}

function hide(state: TooltipState, reason: TooltipSchedule['reason'], delay: number): TooltipTransition {
  return state.open ? { schedule: { open: false, reason, delay } } : NOTHING;
}

function leave(state: TooltipState): TooltipTransition {
  const delay = state.disableHoverableContent ? 0 : Math.max(state.closeDelay ?? 0, TOOLTIP_LEAVE_GRACE_MS);
  return hide(state, 'pointer-leave', delay);
}

/**
 * Decides what the adapter does after an event. Pure: the timer belongs to the adapter.
 *
 * - A mouse or pen hover opens after `delay`; a touch never opens it.
 * - Keyboard (focus-visible) focus opens at once; a click or tap focus does not.
 * - The pointer leaving the trigger or the content closes after `closeDelay` (at least a grace time);
 *   the pointer entering either keeps it open. With `disableHoverableContent` the pointer leaving the
 *   trigger closes at once and the content does not keep it open.
 * - Blur, a press on the trigger (unless `disableClosingTrigger`), Escape and a scroll of a trigger
 *   ancestor close at once.
 * - A disabled tooltip never opens.
 *
 * @param state - The tooltip state.
 * @param event - The event a handler or the layer stack sent.
 * @returns What to do (cancel the pending timer, then schedule), or `null` to ignore the event.
 */
export function transitionTooltip(state: TooltipState, event: TooltipEvent): TooltipTransition | null {
  switch (event.type) {
    case 'TRIGGER.POINTER_ENTER':
      return event.pointerType === 'touch' ? null : show(state, 'hover', state.delay ?? DEFAULT_DELAY_MS);
    case 'TRIGGER.FOCUS':
      return event.focusVisible ? show(state, 'focus', 0) : null;
    case 'TRIGGER.POINTER_LEAVE':
    case 'CONTENT.POINTER_LEAVE':
      return leave(state);
    case 'CONTENT.POINTER_ENTER':
      return state.disableHoverableContent ? null : NOTHING;
    case 'TRIGGER.BLUR':
      return hide(state, 'blur', 0);
    case 'TRIGGER.POINTER_DOWN':
      return state.disableClosingTrigger ? null : hide(state, 'press', 0);
    case 'ANCESTOR.SCROLL':
      return hide(state, 'scroll', 0);
    case 'CONTENT.DISMISS':
      return hide(state, event.reason, 0);
  }
}

/**
 * Computes the props of every Tooltip part. Pure: no DOM, same result on the server and the client.
 *
 * @param state - The author's props and the tracked facts, with the resolved placement.
 * @param send - Receives the events of the handlers; pass them to {@link transitionTooltip}.
 * @returns The props of the trigger, the content and the arrow.
 */
export function getTooltipProps(state: TooltipState, send: (event: TooltipEvent) => void): TooltipParts {
  const { classes } = tooltipAnatomy;
  const ids = tooltipIds(state.id);
  const shown = state.open && state.disabled !== true;
  const dataState = shown ? 'open' : 'closed';
  const mounted = (state.mounted ?? state.open) && state.disabled !== true;
  const description = state.disabled === true ? 'none' : (state.description ?? 'none');
  const describedBy =
    description === 'described' ? ids.description : description === 'none' && mounted ? ids.content : undefined;
  return {
    trigger: {
      class: classes.trigger,
      id: ids.trigger,
      'aria-describedby': describedBy,
      'data-state': dataState,
      onPointerEnter: (event) => {
        send({ type: 'TRIGGER.POINTER_ENTER', pointerType: event.pointerType, event });
      },
      onPointerLeave: (event) => {
        send({ type: 'TRIGGER.POINTER_LEAVE', event });
      },
      onPointerDown: (event) => {
        send({ type: 'TRIGGER.POINTER_DOWN', event });
      },
      onFocus: (event) => {
        send({ type: 'TRIGGER.FOCUS', focusVisible: state.isFocusVisible?.() ?? false, event });
      },
      onBlur: (event) => {
        send({ type: 'TRIGGER.BLUR', event });
      },
    },
    content: {
      class: classes.content,
      id: ids.content,
      role: 'tooltip',
      'aria-hidden': description === 'none' ? undefined : 'true',
      hidden: state.keptClosed ? true : undefined,
      'data-state': dataState,
      'data-side': state.side ?? 'top',
      'data-align': state.align ?? 'center',
      onPointerEnter: (event) => {
        send({ type: 'CONTENT.POINTER_ENTER', event });
      },
      onPointerLeave: (event) => {
        send({ type: 'CONTENT.POINTER_LEAVE', event });
      },
    },
    arrow: { class: classes.arrow, 'aria-hidden': 'true', hidden: state.arrowHidden ? true : undefined },
  };
}
