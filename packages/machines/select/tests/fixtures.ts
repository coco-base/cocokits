import { vi, type Mock } from 'vitest';
import type { Typeahead } from '@cocokits/cdk/roving-focus';
import { getSelectProps, type SelectEvent, type SelectItem, type SelectState } from '../index';

export const cake: SelectItem = { key: 'cake', value: 'Cake' };
export const pizza: SelectItem = { key: 'pizza', value: 'Pizza', disabled: true };
export const burger: SelectItem = { key: 'burger', value: 'Burger' };
export const steak: SelectItem = { key: 'steak', value: 'Steak' };
export const items: SelectItem[] = [cake, pizza, burger, steak];

export const base = (over: Partial<SelectState> = {}): SelectState => ({ id: 's1', open: false, items, ...over });
export const opened = (over: Partial<SelectState> = {}): SelectState =>
  base({ open: true, highlighted: 'cake', ...over });
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
}

/** A keydown for the node environment, which has no KeyboardEvent. */
export function key(keyName: string, init: KeyInit = {}): KeyboardEvent {
  const created = new Event('keydown', { cancelable: true });
  return Object.assign(created, {
    key: keyName,
    isComposing: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    shiftKey: false,
    ...init,
  }) as unknown as KeyboardEvent;
}

export interface KeyRun {
  send: Mock<(sent: SelectEvent) => void>;
  event: KeyboardEvent;
  sent: SelectEvent | undefined;
}

export function keyOn(state: SelectState, keyName: string, init: KeyInit = {}): KeyRun {
  const send = vi.fn<(sent: SelectEvent) => void>();
  const pressed = key(keyName, init);
  getSelectProps(state, send).trigger.onKeyDown(pressed);
  return { send, event: pressed, sent: send.mock.calls[0]?.[0] };
}

/** A fake typeahead with a fixed match, for tests that only look at what the keymap sends. */
export function fakeTypeahead(match: Typeahead['match'] = () => null, active = false): Typeahead {
  return { match, reset: vi.fn(), isActive: () => active };
}
