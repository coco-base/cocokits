import { describe, expect, it, vi } from 'vitest';
import {
  createSelectSearchKeyDown,
  getSelectCountText,
  getSelectProps,
  getSelectValueText,
  isSelectItemVisible,
  resolveSelectHighlight,
  resolveSelectTypeahead,
  selectAnatomy,
  selectMeta,
  selectOptionDescriptionId,
  selectSearchKeymap,
  transitionSelect,
  visibleSelectItems,
  type SelectEvent,
  type SelectItem,
  type SelectState,
} from '../index';
import { base, burger, cake, event, fakeTypeahead, items, key, opened, pizza, steak } from './fixtures';

const filtering = (over: Partial<SelectState> = {}): SelectState => opened({ filter: true, ...over });

function press(state: SelectState, keyName: string, init: Parameters<typeof key>[1] = {}) {
  const send = vi.fn<(sent: SelectEvent) => void>();
  const pressed = key(keyName, init);
  createSelectSearchKeyDown(state as SelectState<unknown>, send)(pressed);
  return { send, event: pressed, sent: send.mock.calls[0]?.[0] };
}

describe('anatomy of the new parts (select-06..09)', () => {
  it('names the classes of the Anatomy table', () => {
    expect(selectAnatomy.classes).toMatchObject({
      header: 'cck-select__header',
      search: 'cck-select__search',
      empty: 'cck-select__empty',
      footer: 'cck-select__footer',
      count: 'cck-select__count',
      optionLeading: 'cck-select__option-leading',
      optionDescription: 'cck-select__option-description',
    });
  });

  it('renders the class of each new part', () => {
    const parts = getSelectProps(filtering({ multiple: true, value: ['Cake', 'Steak'] }), vi.fn());
    expect(parts.header).toEqual({ class: 'cck-select__header' });
    expect(parts.footer).toEqual({ class: 'cck-select__footer' });
    expect(parts.search.class).toBe('cck-select__search');
    expect(parts.empty).toEqual({ class: 'cck-select__empty', role: 'status' });
    expect(parts.count).toEqual({ class: 'cck-select__count', text: '+1' });
    expect(parts.optionLeading).toEqual({ class: 'cck-select__option-leading', 'aria-hidden': 'true' });
    expect(parts.optionDescription(cake).class).toBe('cck-select__option-description');
  });

  it('declares them in the meta with their roles, no data attribute of their own and their elements', () => {
    expect(selectMeta.roles).toMatchObject({ search: 'combobox', empty: 'status', header: null, footer: null });
    expect(selectMeta.roles).toMatchObject({ count: null, optionLeading: null, optionDescription: null });
    expect(selectMeta.dataAttrs).toMatchObject({ header: [], search: [], empty: [], footer: [], count: [] });
    expect(selectMeta.dataAttrs.content).toContain('data-empty');
    expect(selectMeta.defaultElements).toMatchObject({ search: 'input', empty: 'div', count: 'span' });
  });
});

describe('search input (select-07)', () => {
  it('is a search combobox that controls the list and holds the query', () => {
    const { search, content } = getSelectProps(filtering({ query: 'bu', highlighted: 'burger' }), vi.fn());
    expect(search).toMatchObject({
      type: 'search',
      role: 'combobox',
      'aria-expanded': 'true',
      'aria-controls': content.id,
      'aria-autocomplete': 'list',
      'aria-activedescendant': 's1-option-burger',
      'aria-label': 'Search',
      autocomplete: 'off',
      value: 'bu',
    });
  });

  it('names the input with `searchLabel`, and holds an empty query by default', () => {
    const { search } = getSelectProps(filtering({ searchLabel: 'Find a dish' }), vi.fn());
    expect(search['aria-label']).toBe('Find a dish');
    expect(search.value).toBe('');
  });

  it.each([
    ['no highlight', undefined, 'bu'],
    ['a highlighted option the query hides', 'cake', 'bu'],
  ])('reports no active descendant for %s', (_name, highlighted, query) => {
    const { search } = getSelectProps(filtering({ highlighted, query }), vi.fn());
    expect(search['aria-activedescendant']).toBeUndefined();
  });

  it('sends SEARCH.INPUT with the typed text', () => {
    const send = vi.fn<(sent: SelectEvent) => void>();
    const typed = Object.assign(new Event('input'), {});
    Object.defineProperty(typed, 'target', { value: { value: 'piz' } });
    getSelectProps(filtering(), send).search.onInput(typed);
    expect(send).toHaveBeenCalledWith({ type: 'SEARCH.INPUT', value: 'piz', event: typed });
  });

  it('leaves DOM focus in the search: the trigger reports no active descendant and a blur does not dismiss', () => {
    const send = vi.fn<(sent: SelectEvent) => void>();
    const parts = getSelectProps(filtering(), send);
    expect(parts.trigger['aria-activedescendant']).toBeUndefined();
    parts.trigger.onBlur(new Event('blur') as FocusEvent);
    expect(send).not.toHaveBeenCalled();
    expect(getSelectProps(opened(), vi.fn()).trigger['aria-activedescendant']).toBe('s1-option-cake');
  });
});

describe('filtering the options (select-07)', () => {
  const item = (value: string, over: Partial<SelectItem> = {}): SelectItem => ({ key: value, value, ...over });

  it.each([
    ['an empty query', '', 'Cake', true],
    ['a blank query', '   ', 'Cake', true],
    ['contains', 'ak', 'Cake', true],
    ['starts with', 'Ca', 'Cake', true],
    ['ignores case', 'CAKE', 'cake', true],
    ['trims the query', ' ke ', 'Cake', true],
    ['no match', 'x', 'Cake', false],
  ])('%s', (_name, query, value, visible) => {
    expect(isSelectItemVisible(filtering({ query }), item(value))).toBe(visible);
  });

  it('matches the option text before the label before the value', () => {
    const state = filtering({ query: 'tort' });
    expect(isSelectItemVisible(state, item('c', { text: 'Torte', label: 'Cake' }))).toBe(true);
    expect(isSelectItemVisible(filtering({ query: 'cak' }), item('c', { text: 'Torte', label: 'Cake' }))).toBe(false);
    expect(isSelectItemVisible(filtering({ query: 'cak' }), item('c', { label: 'Cake' }))).toBe(true);
  });

  it('shows every option without `filter`, whatever the query', () => {
    expect(visibleSelectItems(opened({ query: 'zzz' }))).toEqual(items);
  });

  it('hides the options the query does not match with the native hidden attribute', () => {
    const parts = getSelectProps(filtering({ query: 'bu' }), vi.fn());
    expect(parts.option(burger).hidden).toBeUndefined();
    expect(parts.option(cake).hidden).toBe(true);
    expect(getSelectProps(opened({ query: 'bu' }), vi.fn()).option(cake).hidden).toBeUndefined();
  });

  it.each([
    ['a group with a match', ['burger', 'cake'], undefined],
    ['a group with no match', ['cake', 'steak'], true],
    ['a group that lists no keys', undefined, undefined],
  ])('hides %s', (_name, itemKeys, hidden) => {
    const parts = getSelectProps(filtering({ query: 'bu' }), vi.fn());
    expect(parts.optionGroup({ key: 'g', itemKeys }).hidden).toBe(hidden);
  });

  it('never hides a group without `filter`', () => {
    const parts = getSelectProps(opened({ query: 'bu' }), vi.fn());
    expect(parts.optionGroup({ key: 'g', itemKeys: ['cake'] }).hidden).toBeUndefined();
  });
});

describe('empty (select-07)', () => {
  it.each([
    ['filter on, nothing matches', { filter: true, query: 'zzz' }, true],
    ['filter on, something matches', { filter: true, query: 'cake' }, false],
    ['filter on, an empty query', { filter: true, query: '' }, false],
    ['filter on, no options at all', { filter: true, items: [] }, true],
    ['filter off, nothing would match', { query: 'zzz' }, false],
    ['filter off, no options at all', { items: [] }, false],
  ])('%s', (_name, over, empty) => {
    const { content } = getSelectProps(opened(over), vi.fn());
    expect(content['data-empty']).toBe(empty ? '' : undefined);
  });
});

describe('highlight skips the options the query hides', () => {
  it('starts the highlight on the first option that is shown and enabled', () => {
    expect(resolveSelectHighlight(filtering({ query: 'r' }), 'first')).toBe('burger');
    expect(resolveSelectHighlight(filtering({ query: 'r' }), 'last')).toBe('burger');
    expect(resolveSelectHighlight(filtering({ query: 'zzz' }), 'first')).toBeNull();
  });

  it('ignores the pointer over a hidden option', () => {
    const state = filtering({ query: 'bu', highlighted: 'burger' });
    expect(transitionSelect(state, { type: 'OPTION.POINTER_MOVE', key: 'cake', event })).toBeNull();
    expect(transitionSelect(state, { type: 'OPTION.POINTER_MOVE', key: 'steak', event })).toBeNull();
    expect(
      transitionSelect(filtering({ query: 'a', highlighted: 'cake' }), {
        type: 'OPTION.POINTER_MOVE',
        key: 'steak',
        event,
      }),
    ).toEqual({
      highlight: 'steak',
    });
  });

  it('skips a hidden option in typeahead', () => {
    const typeahead = fakeTypeahead((_char, list) => list.findIndex((entry) => !entry.disabled));
    const state = filtering({ query: 'bu', typeahead });
    expect(resolveSelectTypeahead(state, 'x')).toBe('burger');
  });
});

describe('search keys (select-07, -08)', () => {
  const list = filtering({ query: 'a', highlighted: 'cake' });

  it('has a meta keyboard row for every search binding and a binding for every meta row', () => {
    const rows = selectMeta.keyboard.filter((row) => row.context === 'search input');
    expect(rows.map((row) => row.key).sort()).toEqual(selectSearchKeymap.map((binding) => binding.row).sort());
  });

  it.each([
    ['ArrowDown from cake skips the disabled and the hidden options', 'ArrowDown', 'cake', 'a', 'steak'],
    ['ArrowUp from steak', 'ArrowUp', 'steak', 'a', 'cake'],
  ])('%s', (_name, keyName, highlighted, query, target) => {
    const { sent, event: pressed } = press(filtering({ query, highlighted }), keyName);
    expect(sent).toMatchObject({ type: 'LIST.MOVE', key: target });
    expect(pressed.defaultPrevented).toBe(true);
  });

  it('stops at the ends of the shown options and still prevents the caret move', () => {
    const last = press(filtering({ query: 'a', highlighted: 'steak' }), 'ArrowDown');
    expect(last.send).not.toHaveBeenCalled();
    expect(last.event.defaultPrevented).toBe(true);
    expect(press(list, 'ArrowUp').send).not.toHaveBeenCalled();
  });

  it('moves through every enabled option when the query is empty', () => {
    expect(press(filtering({ highlighted: 'cake' }), 'ArrowDown').sent).toMatchObject({ key: 'burger' });
  });

  it('chooses the highlighted option on Enter', () => {
    const { sent, event: pressed } = press(list, 'Enter');
    expect(sent).toMatchObject({ type: 'LIST.CHOOSE' });
    expect(pressed.defaultPrevented).toBe(true);
  });

  it('closes with Escape, as a keyboard dismissal that returns focus to the trigger', () => {
    const { sent, event: pressed } = press(list, 'Escape');
    expect(sent).toMatchObject({ type: 'LIST.DISMISS', reason: 'escape' });
    expect(pressed.defaultPrevented).toBe(true);
  });

  it('closes with Tab and leaves the focus move to the browser', () => {
    const { sent, event: pressed } = press(list, 'Tab');
    expect(sent).toMatchObject({ type: 'LIST.DISMISS', reason: 'blur' });
    expect(pressed.defaultPrevented).toBe(false);
    expect(press(list, 'Tab', { shiftKey: true }).sent).toMatchObject({ type: 'LIST.DISMISS', reason: 'blur' });
  });

  it.each([
    ['a letter', 'a', {}],
    ['Space', ' ', {}],
    ['Home', 'Home', {}],
    ['End', 'End', {}],
    ['ArrowLeft', 'ArrowLeft', {}],
    ['PageDown', 'PageDown', {}],
    ['ArrowDown with Alt', 'ArrowDown', { altKey: true }],
    ['ArrowDown with Ctrl', 'ArrowDown', { ctrlKey: true }],
    ['ArrowDown with Meta', 'ArrowDown', { metaKey: true }],
    ['ArrowDown with Shift', 'ArrowDown', { shiftKey: true }],
    ['Enter in a composition', 'Enter', { isComposing: true }],
  ])('leaves %s to the text field', (_name, keyName, init) => {
    const { send, event: pressed } = press(list, keyName, init);
    expect(send).not.toHaveBeenCalled();
    expect(pressed.defaultPrevented).toBe(false);
  });

  it('is wired to the onKeyDown of the search part', () => {
    const send = vi.fn<(sent: SelectEvent) => void>();
    getSelectProps(list, send).search.onKeyDown(key('Enter'));
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ type: 'LIST.CHOOSE' }));
  });
});

describe('transitions with a filter (select-07)', () => {
  const sendClick = { type: 'TRIGGER.CLICK', event } as const;

  it('opens with focus in the search input', () => {
    expect(transitionSelect(filtering({ open: false }), sendClick)).toMatchObject({
      open: { open: true, reason: 'trigger' },
      focus: 'search',
    });
    expect(transitionSelect(base(), sendClick)).not.toHaveProperty('focus');
  });

  it('sets the query and highlights the first option that is shown and enabled', () => {
    expect(transitionSelect(filtering({ highlighted: 'cake' }), { type: 'SEARCH.INPUT', value: 'bur', event })).toEqual(
      {
        query: 'bur',
        highlight: 'burger',
        reveal: true,
      },
    );
    expect(transitionSelect(filtering({ highlighted: 'cake' }), { type: 'SEARCH.INPUT', value: 'zzz', event })).toEqual(
      {
        query: 'zzz',
        highlight: null,
        reveal: true,
      },
    );
  });

  it.each([
    ['without filter', opened(), 'bur'],
    ['while closed', filtering({ open: false }), 'bur'],
    ['with the same query', filtering({ query: 'bur' }), 'bur'],
  ])('ignores typing %s', (_name, state, value) => {
    expect(transitionSelect(state, { type: 'SEARCH.INPUT', value, event })).toBeNull();
  });

  const closes: readonly [string, SelectEvent, 'trigger' | undefined][] = [
    ['a trigger press', { type: 'TRIGGER.CLICK', event }, 'trigger'],
    ['Escape', { type: 'LIST.DISMISS', reason: 'escape', event }, 'trigger'],
    ['an outside press', { type: 'LIST.DISMISS', reason: 'outside-press', event }, undefined],
    ['Tab', { type: 'LIST.DISMISS', reason: 'blur', event }, undefined],
    ['a choice', { type: 'OPTION.CLICK', key: 'burger', event }, 'trigger'],
    ['Alt+ArrowUp', { type: 'LIST.CHOOSE_AND_CLOSE', event }, 'trigger'],
  ];

  it.each(closes)(
    'clears the query when the list closes by %s, and returns focus only after a choice',
    (_name, sent, focus) => {
      const result = transitionSelect(filtering({ query: 'bur', highlighted: 'burger' }), sent);
      expect(result).toMatchObject({ query: '' });
      expect(result?.focus).toBe(focus);
    },
  );

  it('does not clear the query of a multiple list that stays open after a toggle', () => {
    const result = transitionSelect(filtering({ multiple: true, value: [], query: 'bur', highlighted: 'burger' }), {
      type: 'OPTION.CLICK',
      key: 'burger',
      event,
    });
    expect(result).toEqual({ value: ['Burger'] });
  });

  it('adds no query and no focus to a close without a filter', () => {
    const result = transitionSelect(opened(), { type: 'LIST.DISMISS', reason: 'escape', event });
    expect(result).toEqual({ open: { open: false, reason: 'escape' }, highlight: null });
  });

  it('never chooses a hidden option with the keyboard (the highlight moved off it)', () => {
    const result = transitionSelect(filtering({ query: 'ste', highlighted: 'steak' }), { type: 'LIST.CHOOSE', event });
    expect(result).toMatchObject({ value: 'Steak' });
  });
});

describe('footer (select-08)', () => {
  it('does not close the list: the part has no handler and no role', () => {
    const { footer } = getSelectProps(filtering(), vi.fn());
    expect(footer).toEqual({ class: 'cck-select__footer' });
  });
});

describe('count (select-06)', () => {
  it.each([
    ['a single Select', { value: 'Cake' }, undefined],
    ['a single Select with an empty value', { value: '' }, undefined],
    ['a multiple Select with no value', { multiple: true, value: [] }, undefined],
    ['a multiple Select with one value', { multiple: true, value: ['Cake'] }, undefined],
    ['a multiple Select with two values', { multiple: true, value: ['Cake', 'Steak'] }, '+1'],
    ['a multiple Select with four values', { multiple: true, value: ['Cake', 'Steak', 'Burger', 'Pizza'] }, '+3'],
  ] as const)('shows %s', (_name, over, text) => {
    const state = base(over);
    expect(getSelectCountText(state)).toBe(text);
    const { count } = getSelectProps(state, vi.fn());
    expect(count).toEqual(text === undefined ? null : { class: 'cck-select__count', text });
  });

  it('shows the first value in the trigger text, the others in the count', () => {
    const state = base({ multiple: true, value: ['Steak', 'Cake', 'Burger'] });
    expect(getSelectValueText(state)).toBe('Steak');
    expect(getSelectCountText(state)).toBe('+2');
  });
});

describe('option description and leading (select-09)', () => {
  it('describes an option by its description part only while it has one', () => {
    const parts = getSelectProps(opened(), vi.fn());
    const described: SelectItem = { ...burger, hasDescription: true };
    expect(parts.option(burger)['aria-describedby']).toBeUndefined();
    expect(parts.option(described)['aria-describedby']).toBe('s1-option-burger-description');
    expect(parts.optionDescription(described).id).toBe('s1-option-burger-description');
  });

  it('builds the description id from the option element id, so an author id carries over', () => {
    const custom: SelectItem = { ...steak, id: 'my-steak', hasDescription: true };
    expect(selectOptionDescriptionId('s1', custom)).toBe('my-steak-description');
    expect(getSelectProps(opened(), vi.fn()).option(custom)['aria-describedby']).toBe('my-steak-description');
  });

  it('keeps the description of a disabled option', () => {
    const described: SelectItem = { ...pizza, hasDescription: true };
    expect(getSelectProps(opened(), vi.fn()).option(described)['aria-describedby']).toBe('s1-option-pizza-description');
  });
});
