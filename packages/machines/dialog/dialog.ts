import { dialogAnatomy } from './dialog.anatomy';
import type {
  DialogContentStyle,
  DialogEvent,
  DialogIds,
  DialogLength,
  DialogParts,
  DialogSize,
  DialogState,
  DialogTransition,
} from './dialog.types';

const SIZE_MEMBERS = ['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'] as const;

/** A number is px; a string is a CSS length as written; an empty string counts as not set. */
function toLength(value: DialogLength | undefined): string | undefined {
  if (value === undefined || value === '') return undefined;
  return typeof value === 'number' ? `${String(value)}px` : value;
}

/**
 * Turns the size members of a dialog into the inline style of its content.
 *
 * @param size - The width, height and their minimum and maximum; a number is px, a string a CSS length.
 * @returns The members that are set, as CSS lengths; `undefined` when none is set.
 */
export function getDialogContentStyle(size: DialogSize): DialogContentStyle | undefined {
  const entries = SIZE_MEMBERS.flatMap((member) => {
    const length = toLength(size[member]);
    return length === undefined ? [] : [[member, length] as const];
  });
  return entries.length === 0 ? undefined : Object.fromEntries(entries);
}

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
 * Decides the open change an event asks for. Pure. With `disableClose`, Escape and an outside press leave the
 * dialog open; the Close part, the platform close event and the trigger still act.
 *
 * @param state - The dialog state.
 * @param event - The event a handler or the layer stack sent.
 * @returns The requested state and its reason, or `null` when nothing would change.
 */
export function transitionDialog(state: DialogState, event: DialogEvent): DialogTransition | null {
  if (event.type === 'TRIGGER.CLICK') return state.open ? null : { open: true, reason: 'trigger' };
  if (!state.open) return null;
  if (event.type === 'CONTENT.DISMISS')
    return state.disableClose === true ? null : { open: false, reason: event.reason };
  return { open: false, reason: 'close' };
}

/**
 * Computes the props of every Dialog part. Pure: no DOM, same result on the server and the client.
 *
 * @param state - The author's props and the tracked facts.
 * @param send - Receives the events of the handlers; pass them to {@link transitionDialog}.
 * @returns The props of the trigger, the content, the header, the body, the footer, the title, the description and
 * the Close part.
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
      role: state.role === 'alertdialog' ? 'alertdialog' : undefined,
      style: getDialogContentStyle(state),
      'aria-labelledby': state.hasTitle ? titleId : undefined,
      'aria-describedby': state.hasDescription ? ids.description : undefined,
      'data-state': dataState,
      onClose: (event) => {
        send({ type: 'CONTENT.CLOSE', event });
      },
    },
    header: { class: classes.header },
    body: { class: classes.body },
    footer: { class: classes.footer },
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
