import { popoverAnatomy } from './popover.anatomy';
import type { PopoverEvent, PopoverIds, PopoverParts, PopoverState, PopoverTransition } from './popover.types';

/**
 * Derives the ids of the popover parts that link to each other.
 *
 * @param id - The id of the popover, from the adapter.
 * @returns The trigger, content, title and description ids.
 */
export function popoverIds(id: string): PopoverIds {
  return {
    trigger: `${id}-trigger`,
    content: `${id}-content`,
    title: `${id}-title`,
    description: `${id}-description`,
  };
}

/**
 * Decides the open change an event asks for. Pure.
 *
 * @param state - The popover state.
 * @param event - The event a handler or the layer stack sent.
 * @returns The requested state and its reason, or `null` when nothing would change.
 */
export function transitionPopover(state: PopoverState, event: PopoverEvent): PopoverTransition | null {
  if (event.type === 'TRIGGER.CLICK') return { open: !state.open, reason: 'trigger' };
  if (!state.open) return null;
  return { open: false, reason: event.type === 'CONTENT.DISMISS' ? event.reason : 'close' };
}

/**
 * Computes the props of every Popover part. Pure: no DOM, same result on the server and the client.
 *
 * @param state - The author's props and the tracked facts, with the resolved placement.
 * @param send - Receives the events of the handlers; pass them to {@link transitionPopover}.
 * @returns The props of the trigger, the anchor, the content, the arrow, the title, the description and the Close part.
 */
export function getPopoverProps(state: PopoverState, send: (event: PopoverEvent) => void): PopoverParts {
  const { classes } = popoverAnatomy;
  const ids = popoverIds(state.id);
  const dataState = state.open ? 'open' : 'closed';
  return {
    trigger: {
      class: classes.trigger,
      id: ids.trigger,
      type: 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': state.open ? 'true' : 'false',
      'aria-controls': (state.mounted ?? state.open) ? ids.content : undefined,
      'data-state': dataState,
      onClick: (event) => {
        if (!event.defaultPrevented) send({ type: 'TRIGGER.CLICK', event });
      },
    },
    anchor: { class: classes.anchor },
    content: {
      class: classes.content,
      id: ids.content,
      role: 'dialog',
      tabIndex: -1,
      'aria-labelledby': state.hasTitle ? ids.title : undefined,
      'aria-describedby': state.hasDescription ? ids.description : undefined,
      'aria-modal': state.modal ? 'true' : undefined,
      hidden: state.anchorHidden || state.keptClosed ? true : undefined,
      'data-state': dataState,
      'data-side': state.side ?? 'bottom',
      'data-align': state.align ?? 'center',
    },
    arrow: { class: classes.arrow, 'aria-hidden': 'true', hidden: state.arrowHidden ? true : undefined },
    title: { class: classes.title, id: ids.title },
    description: { class: classes.description, id: ids.description },
    close: {
      class: classes.close,
      type: 'button',
      onClick: (event) => {
        if (!event.defaultPrevented) send({ type: 'CLOSE.CLICK', event });
      },
    },
  };
}
