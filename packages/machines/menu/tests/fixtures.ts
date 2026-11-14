import { vi, type Mock } from 'vitest';
import type { Typeahead } from '@cocokits/cdk/roving-focus';
import {
  createMenuContentKeyDown,
  createMenuItemKeyDown,
  createMenuTriggerKeyDown,
  type MenuEvent,
  type MenuItemEntry,
  type MenuState,
} from '../index';

export const edit: MenuItemEntry = { key: 'edit', text: 'Edit' };
export const duplicate: MenuItemEntry = { key: 'duplicate', text: 'Duplicate' };
export const move: MenuItemEntry = { key: 'move', text: 'Move', disabled: true };
export const remove: MenuItemEntry = { key: 'delete', text: 'Delete' };
export const items: MenuItemEntry[] = [edit, duplicate, move, remove];

export const base = (over: Partial<MenuState> = {}): MenuState => ({ id: 'm1', open: false, items, ...over });
export const opened = (over: Partial<MenuState> = {}): MenuState => base({ open: true, activeKey: 'edit', ...over });
export const event: Event = new Event('x');

export const dataKeys = (props: object): string[] =>
  Object.entries(props)
    .filter(([name, value]) => name.startsWith('data-') && value !== undefined)
    .map(([name]) => name)
    .sort();

export interface KeyInit {
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  isComposing?: boolean;
  defaultPrevented?: boolean;
}

/** A keydown for the node environment, which has no KeyboardEvent. */
export function key(keyName: string, init: KeyInit = {}): KeyboardEvent {
  const created = new Event('keydown', { cancelable: true });
  const { defaultPrevented, ...modifiers } = init;
  if (defaultPrevented) created.preventDefault();
  return Object.assign(created, {
    key: keyName,
    isComposing: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    shiftKey: false,
    ...modifiers,
  }) as unknown as KeyboardEvent;
}

export interface KeyRun {
  send: Mock<(sent: MenuEvent) => void>;
  event: KeyboardEvent;
  sent: MenuEvent | undefined;
}

function run(handler: (event: KeyboardEvent) => void, send: KeyRun['send'], keyName: string, init: KeyInit): KeyRun {
  const pressed = key(keyName, init);
  handler(pressed);
  return { send, event: pressed, sent: send.mock.calls[0]?.[0] };
}

/** Presses a key on the trigger. */
export function keyOnTrigger(state: MenuState, keyName: string, init: KeyInit = {}): KeyRun {
  const send = vi.fn<(sent: MenuEvent) => void>();
  return run(createMenuTriggerKeyDown(state, send), send, keyName, init);
}

/** Presses a key in the content. */
export function keyInContent(state: MenuState, keyName: string, init: KeyInit = {}): KeyRun {
  const send = vi.fn<(sent: MenuEvent) => void>();
  return run(createMenuContentKeyDown(state, send), send, keyName, init);
}

/** Presses a key on one item of the state. */
export function keyOnItem(state: MenuState, entry: MenuItemEntry, keyName: string, init: KeyInit = {}): KeyRun {
  const send = vi.fn<(sent: MenuEvent) => void>();
  return run(createMenuItemKeyDown(state, entry, send), send, keyName, init);
}

/** A fake typeahead with a fixed match, for tests that only look at what the keymap sends. */
export function fakeTypeahead(match: Typeahead['match'] = () => null, active = false): Typeahead {
  return { match, reset: vi.fn(), isActive: () => active };
}
