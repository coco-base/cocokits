// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { defineComponent, h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccordionContent, AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from '../index';
import { mountView } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const Pill = defineComponent({
  inheritAttrs: false,
  setup:
    (_props, { attrs, slots }) =>
    () =>
      h('button', attrs, slots.default?.()),
});

describe('Accordion as and asChild', () => {
  it('renders the heading level given to the header and the tags given to the other parts', async () => {
    mountView(() => [
      h(AccordionRoot, { defaultValue: 'a', as: 'section' }, () =>
        h(AccordionItem, { value: 'a' }, () => [
          h(AccordionHeader, { as: 'h2' }, () => h(AccordionTrigger, null, () => 'A')),
          h(AccordionContent, { as: 'article' }, () => 'x'),
        ]),
      ),
    ]);
    await nextTick();
    expect(screen.getByRole('heading', { level: 2 })).toBeTruthy();
    expect(document.querySelector('section.cck-accordion')).not.toBeNull();
    expect(document.querySelector('article.cck-accordion__content')?.getAttribute('role')).toBe('region');
  });

  it('merges the trigger onto a composed button and keeps the state markers', async () => {
    mountView(() => [
      h(AccordionRoot, { collapsible: true, defaultValue: 'a' }, () =>
        h(AccordionItem, { value: 'a' }, () => [
          h(AccordionHeader, null, () =>
            h(AccordionTrigger, { asChild: true }, () => h(Pill, { 'aria-expanded': 'x' }, () => 'A')),
          ),
          h(AccordionContent, null, () => 'x'),
        ]),
      ),
    ]);
    await nextTick();
    const trigger = screen.getByRole('button', { name: 'A' });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('type')).toBeNull();
    await userEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('gives a trigger rendered as another tag the button role, a tab stop and Enter and Space', async () => {
    mountView(() => [
      h(AccordionRoot, null, () => [
        h(AccordionItem, { value: 'a' }, () => [
          h(AccordionHeader, null, () => h(AccordionTrigger, { as: 'div' }, () => 'A')),
          h(AccordionContent, null, () => 'x'),
        ]),
        h(AccordionItem, { value: 'b', disabled: true }, () => [
          h(AccordionHeader, null, () => h(AccordionTrigger, { as: 'div' }, () => 'B')),
          h(AccordionContent, null, () => 'y'),
        ]),
      ]),
    ]);
    const a = screen.getByRole('button', { name: 'A' });
    expect(a.localName).toBe('div');
    expect(a.getAttribute('type')).toBeNull();
    a.focus();
    await userEvent.keyboard('{Enter}');
    expect(a.getAttribute('aria-expanded')).toBe('true');
    const b = screen.getByRole('button', { name: 'B' });
    expect(b.getAttribute('aria-disabled')).toBe('true');
    expect(b.hasAttribute('disabled')).toBe(false);
    expect(a.getAttribute('tabindex')).toBe('0');
    expect(b.getAttribute('tabindex')).toBe('-1');
  });

  it('takes a non-native trigger out of the Tab sequence while the root or the item is disabled, and back after', async () => {
    const rootDisabled = ref(true);
    mountView(() => [
      h(AccordionRoot, { disabled: rootDisabled.value }, () =>
        h(AccordionItem, { value: 'a' }, () => [
          h(AccordionHeader, null, () => h(AccordionTrigger, { as: 'div' }, () => 'A')),
          h(AccordionContent, null, () => 'x'),
        ]),
      ),
    ]);
    const a = screen.getByRole('button', { name: 'A' });
    expect(a.getAttribute('tabindex')).toBe('-1');
    rootDisabled.value = false;
    await nextTick();
    expect(a.getAttribute('tabindex')).toBe('0');
  });

  it('throws outside a root and outside an item', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => mountView(() => h(AccordionTrigger))).toThrow(
      '<AccordionTrigger> must be used inside <AccordionRoot>',
    );
    expect(() => mountView(() => h(AccordionRoot, null, () => h(AccordionContent)))).toThrow(
      '<AccordionContent> must be used inside <AccordionItem>',
    );
  });
});
