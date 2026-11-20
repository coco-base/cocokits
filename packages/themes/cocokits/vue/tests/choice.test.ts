// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/vue';
import { h, nextTick, ref, type Component, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox as BaseCheckbox } from '@cocokits/vue/checkbox';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Checkbox, Radio, Switch } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const CASES = [
  ['checkbox', 'Checkbox', Checkbox],
  ['switch', 'Switch', Switch],
  ['radio', 'Radio', Radio],
] as const;

describe.each(CASES)('theme %s', (block, _name, Component) => {
  const options = cocokitsThemeConfig.components[block];
  const root = (container: Element): Element => {
    const element = container.querySelector(`.cck-${block}`);
    if (!element) throw new Error(`no .cck-${block}`);
    return element;
  };
  const ui = (props: Record<string, unknown> = {}): VNode =>
    h(Component as Component, { name: 'group', ...props }, () => 'Label');

  it('renders the config defaults on the root', () => {
    const { container } = render(themed(() => ui()));
    expect(root(container).getAttribute('data-size')).toBe('md');
    expect(root(container).getAttribute('data-cck-color')).toBe('brand');
    expect(root(container).getAttribute('data-label-position')).toBe('after');
  });

  it.each(options.size.values)('moves data-size to %s', (value) => {
    const { container } = render(themed(() => ui({ size: value })));
    expect(root(container).getAttribute('data-size')).toBe(value);
  });

  it.each(options.color.values)('moves data-cck-color to %s', (value) => {
    const { container } = render(themed(() => ui({ color: value })));
    expect(root(container).getAttribute('data-cck-color')).toBe(value);
  });

  it.each(options.labelPosition.values)('moves data-label-position to %s', (value) => {
    const { container } = render(themed(() => ui({ labelPosition: value })));
    expect(root(container).getAttribute('data-label-position')).toBe(value);
  });

  it('renders the options on the root only', () => {
    const { container } = render(themed(() => ui()));
    expect(container.querySelectorAll('[data-size]')).toHaveLength(1);
    expect(container.querySelector('input')?.hasAttribute('data-size')).toBe(false);
  });

  it('removes an attribute with null', () => {
    const { container } = render(themed(() => ui({ size: null, color: null, labelPosition: null })));
    for (const name of ['data-size', 'data-cck-color', 'data-label-position']) {
      expect(root(container).hasAttribute(name)).toBe(false);
    }
  });

  it('lets a provider override win over the default, and the own prop over the override', () => {
    const { container } = render(
      themed(() => ui({ size: 'sm' }), { [block]: { size: 'lg', labelPosition: 'before' } }),
    );
    expect(root(container).getAttribute('data-size')).toBe('sm');
    expect(root(container).getAttribute('data-label-position')).toBe('before');
  });

  it('follows a changed option', async () => {
    const current = ref<'sm' | 'lg'>('sm');
    const { container } = render(themed(() => ui({ size: current.value })));
    expect(root(container).getAttribute('data-size')).toBe('sm');
    current.value = 'lg';
    await nextTick();
    expect(root(container).getAttribute('data-size')).toBe('lg');
  });

  it('keeps the base facts, forwards props and the slot, and falls attrs through', () => {
    const { container } = render(
      themed(() => ui({ modelValue: true, disabled: true, 'data-testid': 'x', 'aria-label': 'Named' })),
    );
    expect(root(container).hasAttribute('data-checked')).toBe(true);
    expect(root(container).hasAttribute('data-disabled')).toBe(true);
    expect(container.querySelector('input')?.disabled).toBe(true);
    expect(container.querySelector('label')?.textContent).toContain('Label');
    expect(container.querySelector('input')?.getAttribute('aria-label')).toBe('Named');
  });

  it('emits update:modelValue on a click', async () => {
    const onUpdate = vi.fn();
    const { container } = render(themed(() => ui({ 'onUpdate:modelValue': onUpdate, modelValue: false })));
    await fireEvent.click(root(container).querySelector('input') ?? container);
    expect(onUpdate).toHaveBeenCalledWith(true);
  });
});

describe('theme Checkbox and Switch', () => {
  it('renders the mixed fact and the native Switch role', () => {
    const { container } = render(themed(() => h(Checkbox, { indeterminate: true }, () => 'Select all')));
    expect(container.querySelector('.cck-checkbox')?.hasAttribute('data-indeterminate')).toBe(true);
    cleanup();
    const switchRender = render(themed(() => h(Switch, null, () => 'Alerts')));
    expect(switchRender.container.querySelector('input')?.getAttribute('role')).toBe('switch');
  });

  it('exposes the root and the input', () => {
    const checkbox = ref<{ element: Element | null; inputElement: HTMLInputElement | null } | null>(null);
    render(themed(() => h(Checkbox, { ref: checkbox }, () => 'Label')));
    expect(checkbox.value?.element?.classList.contains('cck-checkbox')).toBe(true);
    expect(checkbox.value?.inputElement?.type).toBe('checkbox');
  });

  it('renders no theme data-* for a base without a theme provider', () => {
    const { container } = render(BaseCheckbox, { slots: { default: () => 'Label' } });
    const names = container.querySelector('.cck-checkbox')?.getAttributeNames() ?? [];
    expect(names.filter((name) => /^data-(size|cck-color|label-position)$/.test(name))).toEqual([]);
  });
});
