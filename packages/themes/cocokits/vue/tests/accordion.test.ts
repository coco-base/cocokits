// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/vue';
import { h, nextTick, ref, type Component, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccordionHeader as BaseAccordionHeader } from '@cocokits/vue/accordion';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { AccordionContent, AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const options = cocokitsThemeConfig.components.accordion;
const ATTRIBUTES = ['data-variant', 'data-size', 'data-toggle-position', 'data-hide-toggle'] as const;
const items = (): VNode[] => [
  h(AccordionItem, { value: 'shipping' }, () => [
    h(AccordionHeader, null, () => h(AccordionTrigger, null, () => 'Shipping')),
    h(AccordionContent, null, () => 'Orders leave in two days.'),
  ]),
  h(AccordionItem, { value: 'returns', disabled: true }, () => [
    h(AccordionHeader, null, () => h(AccordionTrigger, null, () => 'Returns')),
    h(AccordionContent, null, () => 'Send it back within 30 days.'),
  ]),
];
const example = (props: Record<string, unknown> = {}): VNode =>
  h(AccordionRoot as Component, { type: 'single', collapsible: true, ...props }, items);
const root = (container: Element): Element => {
  const element = container.querySelector('.cck-accordion');
  if (!element) throw new Error('no .cck-accordion');
  return element;
};

describe('theme accordion', () => {
  it('shares the base parts', () => {
    expect(AccordionHeader).toBe(BaseAccordionHeader);
  });

  it('renders the config defaults on the root', () => {
    const { container } = render(themed(() => example()));
    expect(root(container).getAttribute('data-variant')).toBe('default');
    expect(root(container).getAttribute('data-size')).toBe('md');
    expect(root(container).getAttribute('data-toggle-position')).toBe('after');
    expect(root(container).hasAttribute('data-hide-toggle')).toBe(false);
  });

  it.each([
    ['variant', 'data-variant'],
    ['size', 'data-size'],
    ['togglePosition', 'data-toggle-position'],
  ] as const)('moves %s to %s for every value', (option, attribute) => {
    for (const value of options[option].values) {
      const view = render(themed(() => example({ [option]: value })));
      expect(root(view.container).getAttribute(attribute)).toBe(value);
      view.unmount();
    }
  });

  it('renders data-hide-toggle only when hideToggle is true', () => {
    const on = render(themed(() => example({ hideToggle: true })));
    expect(root(on.container).getAttribute('data-hide-toggle')).toBe('');
    on.unmount();
    const off = render(themed(() => example({ hideToggle: false })));
    expect(root(off.container).hasAttribute('data-hide-toggle')).toBe(false);
  });

  it('renders the options on the root only', () => {
    const { container } = render(themed(() => example({ hideToggle: true })));
    for (const name of ATTRIBUTES) expect(container.querySelectorAll(`[${name}]`)).toHaveLength(1);
  });

  it('removes an attribute with null', () => {
    const { container } = render(themed(() => example({ variant: null, size: null, togglePosition: null })));
    for (const name of ATTRIBUTES) expect(root(container).hasAttribute(name)).toBe(false);
  });

  it('lets a provider override win over the default, and the own option over the override', () => {
    const { container } = render(
      themed(() => example({ size: 'md' }), { accordion: { variant: 'group', size: 'sm', hideToggle: true } }),
    );
    expect(root(container).getAttribute('data-variant')).toBe('group');
    expect(root(container).getAttribute('data-size')).toBe('md');
    expect(root(container).getAttribute('data-hide-toggle')).toBe('');
  });

  it('renders no theme attribute without a provider', () => {
    const { container } = render(example());
    for (const name of ATTRIBUTES) expect(root(container).hasAttribute(name)).toBe(false);
  });

  it('keeps the base behaviour: v-model, a disabled item and the attributes that fall through', async () => {
    const open = ref('');
    const onUpdate = vi.fn();
    const { container } = render(
      themed(() =>
        h(
          AccordionRoot as Component,
          {
            type: 'single',
            modelValue: open.value,
            'onUpdate:modelValue': (value: string) => {
              open.value = value;
              onUpdate(value);
            },
            id: 'accordion',
          },
          items,
        ),
      ),
    );
    expect(root(container).id).toBe('accordion');
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Returns' }).disabled).toBe(true);
    await fireEvent.click(screen.getByRole('button', { name: 'Shipping' }));
    await nextTick();
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith('shipping');
    expect(screen.getByRole('button', { name: 'Shipping' }).getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps its own value when no model is bound, and starts from defaultValue', async () => {
    render(themed(() => example({ defaultValue: 'shipping' })));
    expect(screen.getByRole('button', { name: 'Shipping' }).getAttribute('aria-expanded')).toBe('true');
    await fireEvent.click(screen.getByRole('button', { name: 'Shipping' }));
    await nextTick();
    expect(screen.getByRole('button', { name: 'Shipping' }).getAttribute('aria-expanded')).toBe('false');
  });
});
