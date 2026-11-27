import { describe, expect, it, vi } from 'vitest';
import { getAccordionItemProps, type AccordionItemInput, type AccordionState } from '../index';

const state = (value: readonly string[]): AccordionState => ({
  items: [{ key: 'a' }, { key: 'b' }],
  value,
});

describe('closed content (accordion-13): the element stays, hidden, and the trigger still controls it', () => {
  it.each([
    ['closed, the default', [], { id: 'i', key: 'a' }, true, 'i-content'],
    ['open', ['a'], { id: 'i', key: 'a' }, undefined, 'i-content'],
    ['closed while its exit animation runs', [], { id: 'i', key: 'a', contentPresent: true }, undefined, 'i-content'],
    ['open, the element kept', ['a'], { id: 'i', key: 'a', contentMounted: true }, undefined, 'i-content'],
    ['closed, the element kept', [], { id: 'i', key: 'a', contentMounted: true }, true, 'i-content'],
    ['closed, the element not rendered', [], { id: 'i', key: 'a', contentMounted: false }, true, undefined],
  ] as readonly (readonly [string, readonly string[], AccordionItemInput, true | undefined, string | undefined])[])(
    '%s',
    (_name, value, item, hidden, controls) => {
      const { content, trigger } = getAccordionItemProps(state(value), item, vi.fn());
      expect(content.hidden).toBe(hidden);
      expect(trigger['aria-controls']).toBe(controls);
      expect(content.id).toBe('i-content');
      expect(content).toMatchObject({ role: 'region', 'aria-labelledby': 'i-trigger' });
    },
  );

  it('marks the closed content with data-state closed, as the item', () => {
    const { content, item } = getAccordionItemProps(state([]), { id: 'i', key: 'a' }, vi.fn());
    expect(content['data-state']).toBe('closed');
    expect(item['data-state']).toBe('closed');
  });
});
