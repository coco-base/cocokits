// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/vue';
import { h, nextTick, ref, type Component, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SelectItem as BaseSelectItem } from '@cocokits/vue/select';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { SelectGroup, SelectItem, SelectRoot } from '../src/index';
import { selectParts, type PartsOptions } from './select-parts';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const options = cocokitsThemeConfig.components.select;
const example = (props: Record<string, unknown> = {}, parts: PartsOptions = {}): VNode =>
  h(SelectRoot as Component, props, () => selectParts(parts));
const root = (container: Element): Element => {
  const element = container.querySelector('.cck-select');
  if (!element) throw new Error('no .cck-select');
  return element;
};

describe('theme select', () => {
  it('shares the base parts', () => {
    expect(SelectItem).toBe(BaseSelectItem);
    expect(SelectGroup).toBeDefined();
  });

  it('renders the config default on the root', () => {
    const { container } = render(themed(() => example()));
    expect(root(container).getAttribute('data-size')).toBe('md');
  });

  it('moves size to data-size for every value, on the root only', () => {
    for (const value of options.size.values) {
      const view = render(themed(() => example({ size: value })));
      expect(root(view.container).getAttribute('data-size')).toBe(value);
      expect(view.container.querySelectorAll('[data-size]')).toHaveLength(1);
      view.unmount();
    }
  });

  it('removes the attribute with null', () => {
    const { container } = render(themed(() => example({ size: null })));
    expect(root(container).hasAttribute('data-size')).toBe(false);
  });

  it('lets a provider override win over the default, and the own prop over the override', () => {
    const overrides = { select: { size: 'lg' } };
    expect(root(render(themed(() => example(), overrides)).container).getAttribute('data-size')).toBe('lg');
    cleanup();
    expect(root(render(themed(() => example({ size: 'sm' }), overrides)).container).getAttribute('data-size')).toBe(
      'sm',
    );
  });

  it('renders no theme attribute without a provider', () => {
    const { container } = render(example() as unknown as Component);
    expect(root(container).hasAttribute('data-size')).toBe(false);
  });

  it('keeps the base behaviour: the combobox, the placeholder and the value of a bound model', async () => {
    const value = ref<string | undefined>(undefined);
    const view = render(
      themed(() => example({ modelValue: value.value, 'onUpdate:modelValue': (next: string) => (value.value = next) })),
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger.textContent).toContain('Choose a dish');
    expect(root(view.container).hasAttribute('data-placeholder-shown')).toBe(true);
    value.value = 'Pizza';
    await nextTick();
    expect(trigger.textContent).toContain('Pizza');
    expect(root(view.container).hasAttribute('data-placeholder-shown')).toBe(false);
  });

  it('passes the value slot and the native attributes through', () => {
    const { container } = render(
      themed(() =>
        example(
          { class: 'wide', modelValue: 'Cake' },
          { valueSlot: (slot) => `${String((slot as { selectedLabel: string[] }).selectedLabel.length)} chosen` },
        ),
      ),
    );
    expect(root(container).classList.contains('wide')).toBe(true);
    expect(screen.getByRole('combobox').textContent).toContain('1 chosen');
  });

  it('narrows the model by multiple and joins the labels of items', () => {
    render(
      themed(() =>
        example({
          multiple: true,
          modelValue: ['a', 'b'],
          items: [
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Beta' },
          ],
        }),
      ),
    );
    expect(screen.getByRole('combobox').textContent).toContain('Alpha, Beta');
  });

  it('forwards asChild: the child becomes the root and keeps the part class', () => {
    const { container } = render(
      themed(() => h(SelectRoot as Component, { asChild: true }, () => h('section', { class: 'mine' }, selectParts()))),
    );
    const section = container.querySelector('section');
    expect(section?.classList.contains('cck-select')).toBe(true);
    expect(section?.classList.contains('mine')).toBe(true);
    expect(container.querySelectorAll('.cck-select')).toHaveLength(1);
  });

  it('exposes the trigger element through the component ref', async () => {
    const select = ref<{ element: HTMLElement | null } | null>(null);
    render(themed(() => h(SelectRoot as Component, { ref: select }, () => selectParts())));
    await nextTick();
    expect(select.value?.element).toBe(screen.getByRole('combobox'));
  });
});
