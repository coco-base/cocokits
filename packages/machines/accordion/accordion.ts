import { resolveNextIndex } from '@cocokits/cdk/roving-focus';
import { dataAttr } from '@cocokits/utils';
import { accordionAnatomy } from './accordion.anatomy';
import type {
  AccordionContentSizeVariables,
  AccordionEvent,
  AccordionIds,
  AccordionItem,
  AccordionItemInput,
  AccordionItemParts,
  AccordionKeyBinding,
  AccordionRootProps,
  AccordionState,
  AccordionTransition,
} from './accordion.types';

/** The handled keys, as data. The meta keyboard table has one row per `row`; Tab, Enter and Space are native. */
export const accordionKeymap: readonly AccordionKeyBinding[] = [
  { keys: ['ArrowDown', 'ArrowUp'], orientation: 'vertical', row: 'ArrowDown / ArrowUp' },
  { keys: ['ArrowRight', 'ArrowLeft'], orientation: 'horizontal', row: 'ArrowRight / ArrowLeft' },
  { keys: ['Home', 'End'], row: 'Home / End' },
];

/** The custom properties the adapter passes to the cdk `writeContentSize` for the content part. */
export const accordionContentSizeVariables: AccordionContentSizeVariables = {
  height: '--accordion-content-height',
  width: '--accordion-content-width',
};

/**
 * Derives the ids of the trigger and the content of one item.
 *
 * @param itemId - The id of the item, from the adapter's id generator; never derived from a value.
 * @returns The trigger id and the content id.
 */
export function accordionIds(itemId: string): AccordionIds {
  return { trigger: `${itemId}-trigger`, content: `${itemId}-content` };
}

function isDisabled(state: AccordionState, item: AccordionItem | undefined): boolean {
  return state.disabled === true || item?.disabled === true;
}

function itemOf(state: AccordionState, key: string): AccordionItem | undefined {
  return state.items.find((item) => item.key === key);
}

/** The value after `key` opens: it replaces the open item in single mode, joins the others in multiple mode. */
function opened(state: AccordionState, key: string): readonly string[] {
  return state.type === 'multiple' ? [...state.value, key] : [key];
}

function closed(state: AccordionState, key: string): readonly string[] {
  return state.value.filter((open) => open !== key);
}

/** The trigger to focus when `next` closes the item that holds the focus; see {@link transitionAccordion}. */
function focusTarget(state: AccordionState, next: readonly string[]): string | undefined {
  const held = state.focusInContent;
  if (held === undefined || !state.value.includes(held) || next.includes(held)) return undefined;
  const index = state.items.findIndex((item) => item.key === held);
  if (index < 0) return undefined;
  const enabled = (item: AccordionItem): boolean => !isDisabled(state, item);
  const own = state.items[index];
  if (own && enabled(own)) return held;
  const after = state.items.slice(index + 1).find(enabled);
  if (after) return after.key;
  return state.items.slice(0, index).reverse().find(enabled)?.key;
}

function result(state: AccordionState, next: readonly string[], report: boolean): AccordionTransition {
  const focus = focusTarget(state, next);
  return { ...(report ? { value: next } : {}), ...(focus === undefined ? {} : { focus }) };
}

/**
 * Computes what the adapter does after an event. Pure.
 *
 * - A click toggles an enabled item. In single mode it opens the item and closes the open one; the
 *   open item closes only when `collapsible` is set.
 * - `ITEM.OPEN` and `ITEM.CLOSE` do the same for a method call: no `collapsible` check on close, and
 *   nothing changes while the item is disabled.
 * - `VALUE.SYNC` reports no value; it only checks focus after the parent wrote the value.
 * - When an item closes, by any of these, while focus is inside its content, `focus` is its trigger
 *   (the next enabled trigger, else the previous one, when its own trigger is disabled). Opening
 *   never moves focus.
 *
 * @param state - The accordion state. `focusInContent` is read from the DOM when the event is sent.
 * @param event - The event an adapter sent.
 * @returns The new open keys and the key to focus; empty when nothing changes.
 */
export function transitionAccordion(state: AccordionState, event: AccordionEvent): AccordionTransition {
  if (event.type === 'TRIGGER.NAVIGATE') return { focus: event.key };
  if (event.type === 'VALUE.SYNC') return result(state, event.value, false);
  if (isDisabled(state, itemOf(state, event.key))) return {};
  const open = state.value.includes(event.key);
  if (event.type === 'ITEM.OPEN') return open ? {} : result(state, opened(state, event.key), true);
  if (event.type === 'ITEM.CLOSE') return open ? result(state, closed(state, event.key), true) : {};
  if (!open) return result(state, opened(state, event.key), true);
  return state.type === 'multiple' || state.collapsible === true ? result(state, closed(state, event.key), true) : {};
}

function isPlainKey(event: KeyboardEvent): boolean {
  return (
    !event.defaultPrevented && !event.isComposing && !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
  );
}

function onKeyDown(state: AccordionState, key: string, send: (event: AccordionEvent) => void) {
  const orientation = state.orientation ?? 'vertical';
  return (event: KeyboardEvent): void => {
    if (!isPlainKey(event)) return;
    const binding = accordionKeymap.find(
      (row) => row.keys.includes(event.key) && (row.orientation === undefined || row.orientation === orientation),
    );
    if (!binding) return;
    const next = resolveNextIndex({
      key: event.key,
      count: state.items.length,
      current: state.items.findIndex((item) => item.key === key),
      isDisabled: (index) => isDisabled(state, state.items[index]),
      orientation,
      loop: true,
      dir: state.dir ?? 'ltr',
    });
    const target = next === null ? undefined : state.items[next];
    if (!target) return;
    event.preventDefault();
    send({ type: 'TRIGGER.NAVIGATE', key: target.key, event });
  };
}

/**
 * Computes the props of the root part. Pure: no DOM, same result on the server and the client. The root has no handlers, so it takes no `send`.
 *
 * @param state - The author's props and the tracked facts.
 * @returns The root props.
 */
export function getAccordionProps(state: AccordionState): AccordionRootProps {
  return {
    class: accordionAnatomy.classes.root,
    'data-orientation': state.orientation ?? 'vertical',
    'data-disabled': dataAttr(state.disabled),
    'data-multiple': dataAttr(state.type === 'multiple'),
  };
}

/**
 * Computes the props of the parts of one item. Pure, like {@link getAccordionProps}. The handlers
 * send events; they compute nothing while the props are computed.
 *
 * @param state - The author's props and the tracked facts.
 * @param item - The item, its id and what the adapter knows about its content (mounted, still shown).
 * @param send - Receives the events of the trigger handlers; pass them to {@link transitionAccordion}.
 * @returns The props of the item, header, trigger and content.
 */
export function getAccordionItemProps(
  state: AccordionState,
  item: AccordionItemInput,
  send: (event: AccordionEvent) => void,
): AccordionItemParts {
  const { classes } = accordionAnatomy;
  const ids = accordionIds(item.id);
  const open = state.value.includes(item.key);
  const disabled = isDisabled(state, item);
  const shared = {
    'data-state': open ? 'open' : 'closed',
    'data-disabled': dataAttr(disabled),
    'data-orientation': state.orientation ?? 'vertical',
  } as const;
  const cannotCollapse = open && !disabled && state.type !== 'multiple' && state.collapsible !== true;
  return {
    item: { class: classes.item, ...shared },
    header: { class: classes.header, ...shared },
    trigger: {
      class: classes.trigger,
      ...shared,
      id: ids.trigger,
      type: 'button',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': item.contentMounted === false ? undefined : ids.content,
      'aria-disabled': cannotCollapse ? 'true' : undefined,
      disabled: disabled ? true : undefined,
      'data-focus-visible': dataAttr(state.focusVisibleKey === item.key),
      onClick: (event) => {
        if (event.defaultPrevented) return;
        send({ type: 'TRIGGER.CLICK', key: item.key, event });
      },
      onKeyDown: onKeyDown(state, item.key, send),
    },
    content: {
      class: classes.content,
      ...shared,
      id: ids.content,
      role: 'region',
      'aria-labelledby': ids.trigger,
      hidden: (item.contentPresent ?? open) ? undefined : true,
    },
  };
}
