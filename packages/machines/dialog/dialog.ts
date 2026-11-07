import { dialogAnatomy } from './dialog.anatomy';
import type { DialogEvent, DialogIds, DialogParts, DialogState, DialogTransition } from './dialog.types';

/**
 * Derives the ids of the dialog parts that link to each other.
 *
 * @param id - The id of the dialog, from the adapter.
 * @returns The trigger, content, title and description ids.
 */
export function dialogIds(id: string): DialogIds {
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
 * @param state - The dialog state.
 * @param event - The event a handler or the layer stack sent.
 * @returns The requested state and its reason, or `null` when nothing would change.
 */
export function transitionDialog(state: DialogState, event: DialogEvent): DialogTransition | null {
  if (event.type === 'TRIGGER.CLICK') return state.open ? null : { open: true, reason: 'trigger' };
  if (!state.open) return null;
  if (event.type === 'CONTENT.DISMISS') return { open: false, reason: event.reason };
  return { open: false, reason: 'close' };
}

/**
 * Computes the props of every Dialog part. Pure: no DOM, same result on the server and the client.
 *
 * @param state - The author's props and the tracked facts.
 * @param send - Receives the events of the handlers; pass them to {@link transitionDialog}.
 * @returns The props of the trigger, the content, the title, the description and the Close part.
 */
export function getDialogProps(state: DialogState, send: (event: DialogEvent) => void): DialogParts {
  const { classes } = dialogAnatomy;
  const ids = dialogIds(state.id);
  const titleId = state.titleId ?? ids.title;
  const dataState = state.open ? 'open' : 'closed';
  const mounted = state.mounted ?? state.open;
  return {
    trigger: {
      class: classes.trigger,
      id: ids.trigger,
      type: 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': state.open ? 'true' : 'false',
      'aria-controls': mounted ? ids.content : undefined,
      'data-state': dataState,
      onClick: (event) => {
        if (!event.defaultPrevented) send({ type: 'TRIGGER.CLICK', event });
      },
    },
    content: {
      class: classes.content,
      id: ids.content,
      'aria-labelledby': state.hasTitle ? titleId : undefined,
      'aria-describedby': state.hasDescription ? ids.description : undefined,
      'data-state': dataState,
      onClose: (event) => {
        send({ type: 'CONTENT.CLOSE', event });
      },
    },
    title: { class: classes.title, id: titleId },
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
