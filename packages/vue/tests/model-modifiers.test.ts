// @vitest-environment jsdom
import { createApp, h, nextTick, type Component } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../src/checkbox';
import { Input } from '../src/input';
import { Radio } from '../src/radio';
import { Switch } from '../src/switch';
import { Textarea } from '../src/textarea';

const mounted: HTMLElement[] = [];

function mount(component: Component, props: Record<string, unknown>): HTMLElement {
  const host = document.createElement('div');
  document.body.append(host);
  mounted.push(host);
  createApp({ render: () => h(component, props) }).mount(host);
  return host;
}

afterEach(() => {
  for (const host of mounted.splice(0)) host.remove();
});

// `v-model.trim` gives the component `modelModifiers: { trim: true }`. It is a declared prop, so it never lands in
// `$attrs` and so never on the native element.
const hasModifiersAttribute = (host: HTMLElement): boolean =>
  [...host.querySelectorAll('*')].some((element) => element.hasAttribute('modelmodifiers'));

describe.each([
  ['Input', Input, 'input'],
  ['Textarea', Textarea, 'textarea'],
] as [string, Component, string][])('%s with v-model.trim', (_name, component, selector) => {
  it('adds no attribute and trims the emitted text', async () => {
    const update = vi.fn();
    const host = mount(component, {
      modelValue: '',
      modelModifiers: { trim: true },
      'onUpdate:modelValue': update,
    });
    expect(hasModifiersAttribute(host)).toBe(false);
    const control = host.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
    if (control === null) throw new Error(`no ${selector}`);
    control.value = '  hi  ';
    control.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    expect(update).toHaveBeenCalledWith('hi');
  });
});

describe.each([
  ['Checkbox', Checkbox],
  ['Radio', Radio],
  ['Switch', Switch],
] as [string, Component][])('%s with a model modifier', (_name, component) => {
  it('adds no attribute', () => {
    const host = mount(component, { modelValue: false, modelModifiers: { trim: true } });
    expect(hasModifiersAttribute(host)).toBe(false);
  });
});
