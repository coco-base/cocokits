// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccordionContent, AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from '../index';
import { accordionView, mountView, sectionView } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const trigger = (name: string): HTMLElement => screen.getByRole('button', { name });
const regionOf = (name: string): HTMLElement | null =>
  document.getElementById(`${trigger(name).id.replace(/-trigger$/, '')}-content`);
const open = (): (string | null)[] =>
  screen
    .getAllByRole('button')
    .flatMap((element) => (element.getAttribute('aria-expanded') === 'true' ? [element.textContent] : []));

describe('Accordion rendered contract', () => {
  it('renders root > item > header(h3) > trigger(button) and content with the classes and ARIA of the contract', async () => {
    const { container } = mountView(accordionView({ root: { defaultValue: 'shipping' } }));
    await nextTick();
    const root = container.querySelector('.cck-accordion');
    expect(root?.tagName).toBe('DIV');
    expect(root?.getAttribute('data-orientation')).toBe('vertical');
    expect(root?.hasAttribute('data-disabled')).toBe(false);
    expect(root?.getAttribute('role')).toBeNull();
  });

  it('nests the item, the header and the trigger, and links the trigger and the region', async () => {
    const { container } = mountView(accordionView({ root: { defaultValue: 'shipping' } }));
    await nextTick();
    const root = container.querySelector('.cck-accordion');
    const item = root?.querySelector(':scope > .cck-accordion__item');
    expect(item?.tagName).toBe('DIV');
    expect(item?.getAttribute('data-state')).toBe('open');
    const header = item?.querySelector(':scope > .cck-accordion__header');
    expect(header?.tagName).toBe('H3');
    const shipping = trigger('Shipping');
    expect(shipping.parentElement).toBe(header);
    expect(shipping.className).toBe('cck-accordion__trigger');
    expect(shipping.getAttribute('type')).toBe('button');
    expect(shipping.getAttribute('aria-expanded')).toBe('true');
    const region = regionOf('Shipping');
    expect(region?.className).toBe('cck-accordion__content');
    expect(region?.getAttribute('role')).toBe('region');
    expect(region?.getAttribute('aria-labelledby')).toBe(shipping.id);
    expect(shipping.getAttribute('aria-controls')).toBe(region?.id);
    expect(region?.id).toMatch(/-content$/);
    expect(shipping.id).toMatch(/-trigger$/);
  });

  it('marks the open and the closed item', async () => {
    mountView(accordionView({ root: { defaultValue: 'shipping' } }));
    await nextTick();
    expect(regionOf('Shipping')?.hidden).toBe(false);
    expect(trigger('Returns').getAttribute('aria-expanded')).toBe('false');
    expect(regionOf('Returns')?.getAttribute('data-state')).toBe('closed');
  });
});

describe('Accordion single mode', () => {
  it('opens one item and closes the open one', async () => {
    mountView(accordionView({ root: { defaultValue: 'shipping' } }));
    await userEvent.click(trigger('Returns'));
    expect(open()).toEqual(['Returns']);
  });

  it('does nothing on the open item unless collapsible, and marks it aria-disabled', async () => {
    mountView(accordionView({ root: { defaultValue: 'shipping' } }));
    expect(trigger('Shipping').getAttribute('aria-disabled')).toBe('true');
    expect(trigger('Shipping').hasAttribute('disabled')).toBe(false);
    expect(trigger('Shipping').hasAttribute('data-disabled')).toBe(false);
    await userEvent.click(trigger('Shipping'));
    expect(open()).toEqual(['Shipping']);
  });

  it('closes the open item when collapsible, and emits undefined', async () => {
    const onUpdate = vi.fn();
    mountView(
      accordionView({ root: { defaultValue: 'shipping', collapsible: true, 'onUpdate:modelValue': onUpdate } }),
    );
    expect(trigger('Shipping').hasAttribute('aria-disabled')).toBe(false);
    await userEvent.click(trigger('Shipping'));
    expect(open()).toEqual([]);
    expect(onUpdate).toHaveBeenCalledWith(undefined);
  });
});

describe('Accordion multiple mode', () => {
  it('toggles each item on its own and emits the list', async () => {
    const onUpdate = vi.fn();
    mountView(accordionView({ root: { type: 'multiple', 'onUpdate:modelValue': onUpdate } }));
    await userEvent.click(trigger('Shipping'));
    await userEvent.click(trigger('Returns'));
    expect(open()).toEqual(['Shipping', 'Returns']);
    expect(onUpdate).toHaveBeenLastCalledWith(['shipping', 'returns']);
    await userEvent.click(trigger('Shipping'));
    expect(open()).toEqual(['Returns']);
    expect(trigger('Returns').hasAttribute('aria-disabled')).toBe(false);
  });

  it('infers multiple from a list value', async () => {
    mountView(accordionView({ root: { defaultValue: ['shipping', 'returns'] } }));
    await nextTick();
    expect(open()).toEqual(['Shipping', 'Returns']);
  });
});

describe('Accordion value model', () => {
  it('is controlled when modelValue is bound with a listener: a parent that refuses keeps the value', async () => {
    const onUpdate = vi.fn();
    mountView(accordionView({ root: { modelValue: 'shipping', 'onUpdate:modelValue': onUpdate } }));
    await userEvent.click(trigger('Returns'));
    expect(onUpdate).toHaveBeenCalledWith('returns');
    expect(open()).toEqual(['Shipping']);
  });

  it('starts an unbound accordion from defaultValue and keeps its own value', async () => {
    const onUpdate = vi.fn();
    mountView(accordionView({ root: { defaultValue: 'returns', 'onUpdate:modelValue': undefined } }));
    expect(open()).toEqual(['Returns']);
    await userEvent.click(trigger('Warranty'));
    expect(open()).toEqual(['Warranty']);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('emits nothing when the parent writes the value', async () => {
    const value = ref<string | undefined>('shipping');
    const onUpdate = vi.fn();
    mountView(() => [
      h(AccordionRoot, { modelValue: value.value, 'onUpdate:modelValue': onUpdate }, () => [
        sectionView('shipping', 'Shipping', () => 'a'),
        sectionView('returns', 'Returns', () => 'b'),
      ]),
    ]);
    value.value = 'returns';
    await nextTick();
    expect(open()).toEqual(['Returns']);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('gives the root slot the value and the item slot the open state', async () => {
    mountView(() => [
      h(
        AccordionRoot,
        { defaultValue: 'a' },
        {
          default: (slot: { modelValue: string | string[] | undefined }) => [
            h('output', JSON.stringify(slot.modelValue)),
            h(
              AccordionItem,
              { value: 'a' },
              {
                default: (item: { open: boolean }) => [
                  h(AccordionHeader, null, () => h(AccordionTrigger, null, () => `A ${String(item.open)}`)),
                  h(AccordionContent, null, () => 'x'),
                ],
              },
            ),
          ],
        },
      ),
    ]);
    await nextTick();
    expect(screen.getByRole('status').textContent).toBe('"a"');
    expect(trigger('A true')).toBeTruthy();
  });
});

describe('Accordion disabled', () => {
  it('disables an item: native disabled, data-disabled, no toggle, skipped by the arrows', async () => {
    mountView(accordionView({ returns: { disabled: true } }));
    const returns = trigger('Returns');
    expect(returns.hasAttribute('disabled')).toBe(true);
    expect(returns.hasAttribute('data-disabled')).toBe(true);
    expect(returns.closest('.cck-accordion__item')?.hasAttribute('data-disabled')).toBe(true);
    await userEvent.click(returns);
    expect(open()).toEqual([]);
    trigger('Shipping').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Warranty'));
  });

  it('disables every item from the root', () => {
    const { container } = mountView(accordionView({ root: { disabled: true } }));
    expect(container.querySelector('.cck-accordion')?.hasAttribute('data-disabled')).toBe(true);
    for (const name of ['Shipping', 'Returns', 'Warranty']) expect(trigger(name).hasAttribute('disabled')).toBe(true);
  });

  it('lets a bound value open a disabled item', async () => {
    mountView(accordionView({ root: { modelValue: 'returns' }, returns: { disabled: true } }));
    await nextTick();
    expect(open()).toEqual(['Returns']);
  });
});

describe('Accordion keyboard', () => {
  it('moves with the arrows, wraps, and goes to the ends with Home and End', async () => {
    mountView(accordionView());
    trigger('Shipping').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Returns'));
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(trigger('Warranty'));
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Shipping'));
    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(trigger('Warranty'));
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(trigger('Shipping'));
    expect(open()).toEqual([]);
  });

  it('ignores the horizontal arrows when vertical, and the vertical ones when horizontal', async () => {
    mountView(accordionView({ root: { orientation: 'horizontal' } }));
    trigger('Shipping').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Shipping'));
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(trigger('Returns'));
  });

  it('flips the horizontal arrows in rtl', async () => {
    mountView(accordionView({ root: { orientation: 'horizontal', dir: 'rtl' } }));
    trigger('Shipping').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(trigger('Returns'));
  });

  it('ignores an arrow with a modifier', async () => {
    mountView(accordionView());
    trigger('Shipping').focus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(document.activeElement).toBe(trigger('Shipping'));
  });

  it('toggles with Enter and Space and keeps every enabled trigger a Tab stop', async () => {
    mountView(accordionView());
    await userEvent.tab();
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger('Shipping'));
    await userEvent.keyboard('{Enter}');
    expect(open()).toEqual(['Shipping']);
    trigger('Returns').focus();
    await userEvent.keyboard(' ');
    expect(open()).toEqual(['Returns']);
    for (const name of ['Shipping', 'Returns', 'Warranty']) expect(trigger(name).tabIndex).toBe(0);
  });

  it('never reaches the headers of a nested accordion', async () => {
    mountView(() => [
      h(AccordionRoot, { defaultValue: 'outer', collapsible: true }, () => [
        h(AccordionItem, { value: 'outer' }, () => [
          h(AccordionHeader, null, () => h(AccordionTrigger, null, () => 'Outer')),
          h(AccordionContent, null, () =>
            h(AccordionRoot, { defaultValue: 'inner' }, () => [sectionView('inner', 'Inner', () => 'x')]),
          ),
        ]),
        sectionView('other', 'Other', () => 'y'),
      ]),
    ]);
    await nextTick();
    trigger('Outer').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Other'));
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Outer'));
    await userEvent.click(trigger('Inner'));
    expect(trigger('Outer').getAttribute('aria-expanded')).toBe('true');
  });
});

describe('Accordion closed content', () => {
  it('keeps the element, hidden and without children, by default', async () => {
    mountView(accordionView());
    const region = regionOf('Shipping');
    expect(region?.hidden).toBe(true);
    expect(region?.children).toHaveLength(0);
    expect(region?.getAttribute('data-state')).toBe('closed');
    expect(trigger('Shipping').getAttribute('aria-controls')).toBe(region?.id);
    await userEvent.click(trigger('Shipping'));
    expect(regionOf('Shipping')?.hidden).toBe(false);
    expect(screen.getByText('Shipping rates')).toBeTruthy();
    await userEvent.click(trigger('Returns'));
    expect(regionOf('Shipping')?.hidden).toBe(true);
    expect(regionOf('Shipping')?.children).toHaveLength(0);
  });

  it('keeps the children, with plain hidden, for unmountOnHide=false and forceMount', () => {
    mountView(accordionView({ root: { unmountOnHide: false } }));
    expect(regionOf('Shipping')?.hidden).toBe(true);
    expect(regionOf('Shipping')?.getAttribute('hidden')).toBe('');
    expect(regionOf('Shipping')?.querySelector('a')).not.toBeNull();
    cleanup();
    mountView(accordionView({ content: { forceMount: true } }));
    expect(regionOf('Shipping')?.hidden).toBe(true);
    expect(regionOf('Shipping')?.querySelector('a')).not.toBeNull();
    expect(regionOf('Returns')?.children).toHaveLength(0);
  });

  it('lets an item override the unmountOnHide of the root', () => {
    mountView(accordionView({ root: { unmountOnHide: false }, returns: { unmountOnHide: true } }));
    expect(regionOf('Shipping')?.querySelector('a')).not.toBeNull();
    expect(regionOf('Returns')?.children).toHaveLength(0);
  });
});

describe('Accordion focus when content closes', () => {
  async function focusLink(): Promise<HTMLElement> {
    await userEvent.click(trigger('Shipping'));
    const link = screen.getByText('Shipping rates');
    link.focus();
    return link;
  }

  it('moves focus to the trigger before the content is hidden, when another item opens', async () => {
    mountView(accordionView());
    await focusLink();
    // A script click: a pointer press would move focus to the trigger on its own.
    trigger('Returns').click();
    await nextTick();
    expect(open()).toEqual(['Returns']);
    expect(document.activeElement).toBe(trigger('Shipping'));
  });

  it('moves focus when the parent closes the item, and to the next enabled trigger when its own is disabled', async () => {
    const value = ref<string | undefined>('shipping');
    const disabled = ref(false);
    mountView(() => [
      h(AccordionRoot, { modelValue: value.value }, () => [
        sectionView('shipping', 'Shipping', () => h('a', { href: '#r' }, 'Rates'), { disabled: disabled.value }),
        sectionView('returns', 'Returns', () => 'b'),
      ]),
    ]);
    await nextTick();
    screen.getByText('Rates').focus();
    value.value = undefined;
    await nextTick();
    expect(document.activeElement).toBe(trigger('Shipping'));
    value.value = 'shipping';
    await nextTick();
    disabled.value = true;
    await nextTick();
    screen.getByText('Rates').focus();
    value.value = undefined;
    await nextTick();
    expect(document.activeElement).toBe(trigger('Returns'));
  });

  it('does not move focus when an item opens', async () => {
    mountView(accordionView());
    trigger('Returns').focus();
    await userEvent.keyboard('{Enter}');
    expect(document.activeElement).toBe(trigger('Returns'));
  });
});

describe('Accordion animation', () => {
  it('writes the size variables on a change after mount, never on the first render', async () => {
    mountView(accordionView({ root: { defaultValue: 'shipping', collapsible: true } }));
    await nextTick();
    expect(regionOf('Shipping')?.style.getPropertyValue('--accordion-content-height')).toBe('');
    await userEvent.click(trigger('Returns'));
    expect(regionOf('Returns')?.style.getPropertyValue('--accordion-content-height')).toBe('0px');
    expect(regionOf('Returns')?.style.getPropertyValue('--accordion-content-width')).toBe('0px');
    expect(regionOf('Shipping')?.style.getPropertyValue('--accordion-content-height')).toBe('0px');
  });

  it('keeps the closed content shown until its exit animation has finished', async () => {
    let finish: () => void = () => undefined;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const animation = {
      animationName: 'collapse',
      playState: 'running',
      effect: { getComputedTiming: () => ({ endTime: 100 }) },
      finished,
    };
    mountView(accordionView({ root: { defaultValue: 'shipping', collapsible: true } }));
    await nextTick();
    const region = regionOf('Shipping');
    if (!region) throw new Error('no region');
    region.getAnimations = (() => [animation]) as unknown as typeof region.getAnimations;
    await userEvent.click(trigger('Shipping'));
    expect(region.getAttribute('data-state')).toBe('closed');
    expect(region.hidden).toBe(false);
    expect(region.querySelector('a')).not.toBeNull();
    finish();
    await vi.waitFor(() => {
      expect(region.hidden).toBe(true);
    });
    expect(region.children).toHaveLength(0);
  });
});
