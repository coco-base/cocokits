import { describe, expect, it, vi } from 'vitest';
import {
  accordionAnatomy,
  accordionContentSizeVariables,
  accordionIds,
  accordionKeymap,
  accordionMeta,
  getAccordionItemProps,
  getAccordionProps,
  transitionAccordion,
  type AccordionEvent,
  type AccordionItem,
  type AccordionState,
} from '../index';

const items: AccordionItem[] = [{ key: 'a' }, { key: 'b', disabled: true }, { key: 'c' }, { key: 'd' }];

const base = (over: Partial<AccordionState> = {}): AccordionState => ({
  items,
  value: [],
  ...over,
});

const event = new Event('click', { cancelable: true });
const click = (key: string): AccordionEvent => ({ type: 'TRIGGER.CLICK', key, event });

interface KeyInit {
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}

/** A keydown for the node environment, which has no KeyboardEvent. */
function key(keyName: string, init: KeyInit = {}): KeyboardEvent {
  const keydown = new Event('keydown', { cancelable: true });
  return Object.assign(keydown, {
    key: keyName,
    isComposing: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    shiftKey: false,
    ...init,
  }) as unknown as KeyboardEvent;
}

function keyOn(state: AccordionState, itemKey: string, keyName: string, init: KeyInit = {}) {
  const send = vi.fn<(e: AccordionEvent) => void>();
  const keydown = key(keyName, init);
  getAccordionItemProps(state, { id: itemKey, key: itemKey }, send).trigger.onKeyDown(keydown);
  return { send, event: keydown };
}

const sentKey = (send: ReturnType<typeof vi.fn>): unknown =>
  (send.mock.calls[0]?.[0] as { key: string } | undefined)?.key;

describe('anatomy, ids and size variables', () => {
  it('renders the part classes', () => {
    expect(accordionAnatomy.classes).toMatchObject({
      root: 'cck-accordion',
      item: 'cck-accordion__item',
      header: 'cck-accordion__header',
      trigger: 'cck-accordion__trigger',
      content: 'cck-accordion__content',
    });
    const root = getAccordionProps(base());
    const parts = getAccordionItemProps(base(), { id: 'a', key: 'a' }, vi.fn());
    expect(root.class).toBe('cck-accordion');
    expect(parts.item.class).toBe('cck-accordion__item');
    expect(parts.header.class).toBe('cck-accordion__header');
    expect(parts.trigger.class).toBe('cck-accordion__trigger');
    expect(parts.content.class).toBe('cck-accordion__content');
  });

  it('derives the trigger and content ids from the item id', () => {
    expect(accordionIds('item-1')).toEqual({ trigger: 'item-1-trigger', content: 'item-1-content' });
  });

  it('names the two unprefixed size variables', () => {
    expect(accordionContentSizeVariables).toEqual({
      height: '--accordion-content-height',
      width: '--accordion-content-width',
    });
  });
});

describe('roles and ARIA', () => {
  it('wires trigger and content to each other', () => {
    const parts = getAccordionItemProps(base({ value: ['c'] }), { id: 'x', key: 'c' }, vi.fn());
    expect(parts.trigger).toMatchObject({
      id: 'x-trigger',
      type: 'button',
      'aria-expanded': 'true',
      'aria-controls': 'x-content',
    });
    expect(parts.content).toMatchObject({ id: 'x-content', role: 'region', 'aria-labelledby': 'x-trigger' });
  });

  it('renders aria-expanded false on a closed trigger', () => {
    expect(getAccordionItemProps(base(), { id: 'a', key: 'a' }, vi.fn()).trigger['aria-expanded']).toBe('false');
  });

  it('drops aria-controls only while the content element is unmounted', () => {
    // Mounted (the default) keeps aria-controls even while closed: the element exists, hidden.
    expect(getAccordionItemProps(base(), { id: 'a', key: 'a' }, vi.fn()).trigger['aria-controls']).toBe('a-content');
    expect(
      getAccordionItemProps(base(), { id: 'a', key: 'a', contentMounted: false }, vi.fn()).trigger['aria-controls'],
    ).toBeUndefined();
  });

  it('gives the open trigger aria-disabled when it cannot be collapsed, never native disabled', () => {
    const state = base({ type: 'single', value: ['a'] });
    const trigger = getAccordionItemProps(state, { id: 'a', key: 'a' }, vi.fn()).trigger;
    expect(trigger['aria-disabled']).toBe('true');
    expect(trigger.disabled).toBeUndefined();
    expect(trigger['data-disabled']).toBeUndefined();
  });

  it('gives no aria-disabled when collapsible, closed, multiple or in the unset single default', () => {
    const aria = (state: AccordionState, itemKey: string) =>
      getAccordionItemProps(state, { id: itemKey, key: itemKey }, vi.fn()).trigger['aria-disabled'];
    expect(aria(base({ value: ['a'], collapsible: true }), 'a')).toBeUndefined();
    expect(aria(base({ value: ['a'] }), 'c')).toBeUndefined();
    expect(aria(base({ type: 'multiple', value: ['a'] }), 'a')).toBeUndefined();
  });

  it('leaves aria-disabled to native disabled on a disabled item', () => {
    const state = base({ value: ['b'] });
    expect(
      getAccordionItemProps(state, { id: 'b', key: 'b', disabled: true }, vi.fn()).trigger['aria-disabled'],
    ).toBeUndefined();
  });
});

describe('data attributes', () => {
  it('renders state and orientation on every part, and nothing else on the root', () => {
    const state = base({ value: ['a'], orientation: 'horizontal' });
    const parts = getAccordionItemProps(state, { id: 'a', key: 'a' }, vi.fn());
    for (const part of [parts.item, parts.header, parts.trigger, parts.content]) {
      expect(part['data-state']).toBe('open');
      expect(part['data-orientation']).toBe('horizontal');
    }
    expect(getAccordionProps(state)['data-orientation']).toBe('horizontal');
    expect(getAccordionProps(base())['data-orientation']).toBe('vertical');
    expect(getAccordionItemProps(base(), { id: 'a', key: 'a' }, vi.fn()).item['data-state']).toBe('closed');
  });

  it('renders disabled as a presence attribute from the item or the root', () => {
    const own = getAccordionItemProps(base(), { id: 'b', key: 'b', disabled: true }, vi.fn());
    for (const part of [own.item, own.header, own.trigger, own.content]) expect(part['data-disabled']).toBe('');
    expect(own.trigger.disabled).toBe(true);
    const root = base({ disabled: true });
    expect(getAccordionProps(root)['data-disabled']).toBe('');
    const inherited = getAccordionItemProps(root, { id: 'a', key: 'a' }, vi.fn());
    expect(inherited.trigger['data-disabled']).toBe('');
    expect(inherited.trigger.disabled).toBe(true);
    expect(getAccordionProps(base())['data-disabled']).toBeUndefined();
    expect(getAccordionProps(base())['data-multiple']).toBeUndefined();
    expect(getAccordionProps(base({ type: 'single' }))['data-multiple']).toBeUndefined();
    expect(getAccordionProps(base({ type: 'multiple' }))['data-multiple']).toBe('');
    expect(getAccordionItemProps(base(), { id: 'a', key: 'a' }, vi.fn()).trigger['data-disabled']).toBeUndefined();
  });

  it('renders focus-visible on the trigger of the tracked item only', () => {
    const state = base({ focusVisibleKey: 'c' });
    expect(getAccordionItemProps(state, { id: 'c', key: 'c' }, vi.fn()).trigger['data-focus-visible']).toBe('');
    expect(getAccordionItemProps(state, { id: 'a', key: 'a' }, vi.fn()).trigger['data-focus-visible']).toBeUndefined();
  });

  it('renders exactly the attributes the meta declares', () => {
    const dataKeys = (props: object): string[] =>
      Object.entries(props)
        .filter(([name, value]) => name.startsWith('data-') && value !== undefined)
        .map(([name]) => name)
        .sort();
    const state = base({ value: ['b'], disabled: true, focusVisibleKey: 'b' });
    const parts = getAccordionItemProps(state, { id: 'b', key: 'b' }, vi.fn());
    expect(dataKeys(getAccordionProps({ ...state, type: 'multiple' }))).toEqual(
      [...accordionMeta.dataAttrs.root].sort(),
    );
    expect(dataKeys(parts.item)).toEqual([...accordionMeta.dataAttrs.item].sort());
    expect(dataKeys(parts.header)).toEqual([...accordionMeta.dataAttrs.header].sort());
    expect(dataKeys(parts.trigger)).toEqual([...accordionMeta.dataAttrs.trigger].sort());
    expect(dataKeys(parts.content)).toEqual([...accordionMeta.dataAttrs.content].sort());
    expect(accordionMeta.dataAttrs.root).toEqual(['data-orientation', 'data-disabled', 'data-multiple']);
  });
});

describe('closed content', () => {
  it('hides the content element while it is not present', () => {
    expect(getAccordionItemProps(base(), { id: 'a', key: 'a' }, vi.fn()).content.hidden).toBe(true);
    expect(
      getAccordionItemProps(base({ value: ['a'] }), { id: 'a', key: 'a' }, vi.fn()).content.hidden,
    ).toBeUndefined();
  });

  it('keeps an exiting item shown until the adapter says the exit is over', () => {
    const exiting = getAccordionItemProps(base(), { id: 'a', key: 'a', contentPresent: true }, vi.fn());
    expect(exiting.content.hidden).toBeUndefined();
    expect(exiting.content['data-state']).toBe('closed');
  });
});

describe('transitionAccordion: single mode', () => {
  it('opens an item and closes the open one', () => {
    expect(transitionAccordion(base({ value: ['a'] }), click('c'))).toEqual({ value: ['c'] });
    expect(transitionAccordion(base(), click('a'))).toEqual({ value: ['a'] });
  });

  it('does nothing when the open item is clicked and collapsing is not allowed', () => {
    expect(transitionAccordion(base({ value: ['a'] }), click('a'))).toEqual({});
  });

  it('closes the open item when collapsible', () => {
    expect(transitionAccordion(base({ value: ['a'], collapsible: true }), click('a'))).toEqual({ value: [] });
  });

  it('treats single as the default type', () => {
    expect(transitionAccordion(base({ type: 'single', value: ['a'] }), click('c'))).toEqual({ value: ['c'] });
  });
});

describe('transitionAccordion: multiple mode', () => {
  const multiple = (value: string[]) => base({ type: 'multiple', value });

  it('toggles each item on its own', () => {
    expect(transitionAccordion(multiple(['a']), click('c'))).toEqual({ value: ['a', 'c'] });
    expect(transitionAccordion(multiple(['a', 'c']), click('a'))).toEqual({ value: ['c'] });
  });

  it('closes the last open item without collapsible', () => {
    expect(transitionAccordion(multiple(['a']), click('a'))).toEqual({ value: [] });
  });
});

describe('transitionAccordion: disabled', () => {
  it('ignores a click on a disabled item', () => {
    expect(transitionAccordion(base(), click('b'))).toEqual({});
    expect(transitionAccordion(base({ value: ['b'], collapsible: true }), click('b'))).toEqual({});
  });

  it('ignores every item when the root is disabled', () => {
    expect(transitionAccordion(base({ disabled: true }), click('a'))).toEqual({});
    expect(transitionAccordion(base({ disabled: true }), { type: 'ITEM.OPEN', key: 'a' })).toEqual({});
  });

  it('ignores open and close requests for a disabled item', () => {
    expect(transitionAccordion(base(), { type: 'ITEM.OPEN', key: 'b' })).toEqual({});
    expect(transitionAccordion(base({ value: ['b'] }), { type: 'ITEM.CLOSE', key: 'b' })).toEqual({});
  });
});

describe('transitionAccordion: open and close requests', () => {
  it('opens like a click, closing the open item in single mode', () => {
    expect(transitionAccordion(base({ value: ['a'] }), { type: 'ITEM.OPEN', key: 'c' })).toEqual({ value: ['c'] });
    expect(transitionAccordion(base({ type: 'multiple', value: ['a'] }), { type: 'ITEM.OPEN', key: 'c' })).toEqual({
      value: ['a', 'c'],
    });
  });

  it('closes regardless of collapsible, and does nothing when already in that state', () => {
    expect(transitionAccordion(base({ value: ['a'] }), { type: 'ITEM.CLOSE', key: 'a' })).toEqual({ value: [] });
    expect(transitionAccordion(base({ value: ['a'] }), { type: 'ITEM.CLOSE', key: 'c' })).toEqual({});
    expect(transitionAccordion(base({ value: ['a'] }), { type: 'ITEM.OPEN', key: 'a' })).toEqual({});
  });
});

describe('transitionAccordion: focus when content closes', () => {
  it('moves focus to the trigger of the closing item when focus was inside its content', () => {
    const state = base({ value: ['a'], collapsible: true, focusInContent: 'a' });
    expect(transitionAccordion(state, click('a'))).toEqual({ value: [], focus: 'a' });
    expect(transitionAccordion(state, { type: 'ITEM.CLOSE', key: 'a' })).toEqual({ value: [], focus: 'a' });
  });

  it('does it when another item closes it in single mode', () => {
    const state = base({ value: ['a'], focusInContent: 'a' });
    expect(transitionAccordion(state, click('c'))).toEqual({ value: ['c'], focus: 'a' });
  });

  it('does it when the value is set from outside', () => {
    const state = base({ value: ['a'], focusInContent: 'a' });
    expect(transitionAccordion(state, { type: 'VALUE.SYNC', value: [] })).toEqual({ focus: 'a' });
    expect(transitionAccordion(state, { type: 'VALUE.SYNC', value: ['c'] })).toEqual({ focus: 'a' });
  });

  it('moves no focus when focus is elsewhere, in another item or when nothing closes', () => {
    expect(transitionAccordion(base({ value: ['a'], collapsible: true }), click('a'))).toEqual({ value: [] });
    expect(transitionAccordion(base({ type: 'multiple', value: ['a', 'c'], focusInContent: 'c' }), click('a'))).toEqual(
      {
        value: ['c'],
      },
    );
    expect(
      transitionAccordion(base({ value: ['a'], focusInContent: 'a' }), { type: 'VALUE.SYNC', value: ['a'] }),
    ).toEqual({});
  });

  it('never moves focus when an item opens', () => {
    expect(transitionAccordion(base({ focusInContent: 'a' }), click('c'))).toEqual({ value: ['c'] });
  });

  it('falls back to the next enabled trigger when the closing trigger is disabled', () => {
    const state = base({ value: ['b'], focusInContent: 'b' });
    expect(transitionAccordion(state, { type: 'VALUE.SYNC', value: [] })).toEqual({ focus: 'c' });
  });

  it('skips disabled triggers and falls back to the previous one after the last', () => {
    const list: AccordionItem[] = [
      { key: 'a' },
      { key: 'b' },
      { key: 'c', disabled: true },
      { key: 'd', disabled: true },
    ];
    expect(
      transitionAccordion({ items: list, value: ['c'], focusInContent: 'c' }, { type: 'VALUE.SYNC', value: [] }),
    ).toEqual({ focus: 'b' });
  });

  it('moves no focus when no trigger is enabled', () => {
    const list: AccordionItem[] = [
      { key: 'a', disabled: true },
      { key: 'b', disabled: true },
    ];
    expect(
      transitionAccordion({ items: list, value: ['a'], focusInContent: 'a' }, { type: 'VALUE.SYNC', value: [] }),
    ).toEqual({});
    expect(
      transitionAccordion(
        { items: items, disabled: true, value: ['a'], focusInContent: 'a' },
        { type: 'VALUE.SYNC', value: [] },
      ),
    ).toEqual({});
  });
});

describe('click', () => {
  it('sends TRIGGER.CLICK with the key', () => {
    const send = vi.fn();
    getAccordionItemProps(base(), { id: 'c', key: 'c' }, send).trigger.onClick(event);
    expect(send).toHaveBeenCalledWith({ type: 'TRIGGER.CLICK', key: 'c', event });
  });

  it('sends nothing when a consumer handler vetoed the click', () => {
    const send = vi.fn();
    const vetoed = new Event('click', { cancelable: true });
    vetoed.preventDefault();
    getAccordionItemProps(base(), { id: 'c', key: 'c' }, send).trigger.onClick(vetoed);
    expect(send).not.toHaveBeenCalled();
  });
});

describe('transitionAccordion: navigation', () => {
  it('focuses the key it was sent and changes no value', () => {
    expect(transitionAccordion(base(), { type: 'TRIGGER.NAVIGATE', key: 'c', event })).toEqual({ focus: 'c' });
  });
});

describe('keyboard', () => {
  it('moves to the next enabled trigger with ArrowDown, skipping a disabled one', () => {
    const result = keyOn(base(), 'a', 'ArrowDown');
    expect(result.send).toHaveBeenCalledWith(expect.objectContaining({ type: 'TRIGGER.NAVIGATE', key: 'c' }));
    expect(result.event.defaultPrevented).toBe(true);
  });

  it('wraps from the last trigger to the first and back', () => {
    expect(sentKey(keyOn(base(), 'd', 'ArrowDown').send)).toBe('a');
    expect(sentKey(keyOn(base(), 'a', 'ArrowUp').send)).toBe('d');
  });

  it('goes to the first and last enabled trigger with Home and End', () => {
    expect(sentKey(keyOn(base(), 'c', 'Home').send)).toBe('a');
    expect(sentKey(keyOn(base(), 'a', 'End').send)).toBe('d');
    const disabledEdges = base({
      items: [{ key: 'a', disabled: true }, { key: 'b' }, { key: 'c' }, { key: 'd', disabled: true }],
    });
    expect(sentKey(keyOn(disabledEdges, 'c', 'Home').send)).toBe('b');
    expect(sentKey(keyOn(disabledEdges, 'b', 'End').send)).toBe('c');
  });

  it('uses the horizontal arrows only when horizontal, and ignores the vertical pair then', () => {
    const horizontal = base({ orientation: 'horizontal' });
    expect(sentKey(keyOn(horizontal, 'a', 'ArrowRight').send)).toBe('c');
    expect(sentKey(keyOn(horizontal, 'a', 'ArrowLeft').send)).toBe('d');
    expect(keyOn(horizontal, 'a', 'ArrowDown').send).not.toHaveBeenCalled();
    expect(keyOn(base(), 'a', 'ArrowRight').send).not.toHaveBeenCalled();
  });

  it('flips only the horizontal arrows in rtl', () => {
    const horizontal = base({ orientation: 'horizontal', dir: 'rtl' });
    expect(sentKey(keyOn(horizontal, 'c', 'ArrowLeft').send)).toBe('d');
    expect(sentKey(keyOn(horizontal, 'c', 'ArrowRight').send)).toBe('a');
    expect(sentKey(keyOn(base({ dir: 'rtl' }), 'a', 'ArrowDown').send)).toBe('c');
  });

  it('skips every item of a disabled root: nothing to move to', () => {
    expect(keyOn(base({ disabled: true }), 'a', 'ArrowDown').send).not.toHaveBeenCalled();
  });

  it('ignores a vetoed, modified or composing key and any other key', () => {
    const vetoed = key('ArrowDown');
    vetoed.preventDefault();
    const send = vi.fn();
    getAccordionItemProps(base(), { id: 'a', key: 'a' }, send).trigger.onKeyDown(vetoed);
    expect(send).not.toHaveBeenCalled();
    for (const init of [{ ctrlKey: true }, { altKey: true }, { metaKey: true }, { shiftKey: true }]) {
      expect(keyOn(base(), 'a', 'ArrowDown', init).send).not.toHaveBeenCalled();
    }
    const composing = Object.assign(key('ArrowDown'), { isComposing: true });
    getAccordionItemProps(base(), { id: 'a', key: 'a' }, send).trigger.onKeyDown(composing);
    expect(send).not.toHaveBeenCalled();
    expect(keyOn(base(), 'a', 'a').send).not.toHaveBeenCalled();
    expect(keyOn(base(), 'a', 'Tab').event.defaultPrevented).toBe(false);
  });

  it('keeps Enter and Space native and never toggles on an arrow', () => {
    for (const name of ['Enter', ' ']) {
      const { send, event: keydown } = keyOn(base(), 'a', name);
      expect(send).not.toHaveBeenCalled();
      expect(keydown.defaultPrevented).toBe(false);
    }
    expect(sentKey(keyOn(base(), 'a', 'ArrowDown').send)).not.toBe('a');
    expect(keyOn(base(), 'a', 'ArrowDown').send).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'TRIGGER.NAVIGATE' }),
    );
  });
});

describe('meta', () => {
  it('links the APG pattern, the roles and the default elements', () => {
    expect(accordionMeta.apg).toBe('https://www.w3.org/WAI/ARIA/apg/patterns/accordion/');
    expect(accordionMeta.roles).toMatchObject({
      root: null,
      item: null,
      header: null,
      trigger: null,
      content: 'region',
    });
    expect(accordionMeta.defaultElements).toEqual({
      root: 'div',
      item: 'div',
      header: 'h3',
      trigger: 'button',
      content: 'div',
    });
    expect(accordionMeta.form).toMatch(/^None/);
  });

  it('agrees with the keymap in both directions', () => {
    const metaKeys = accordionMeta.keyboard.map((row) => row.key);
    for (const binding of accordionKeymap) expect(metaKeys).toContain(binding.row);
    const handled = new Set(accordionKeymap.map((binding) => binding.row));
    for (const row of accordionMeta.keyboard) {
      if (!handled.has(row.key)) expect(row.action).toMatch(/^Native/);
    }
  });
});

describe('meta defaults', () => {
  it('names the orientation the root renders with no input', () => {
    expect(getAccordionProps(base())['data-orientation']).toBe(
      accordionMeta.dataAttrDetails?.['data-orientation']?.default,
    );
  });
});
