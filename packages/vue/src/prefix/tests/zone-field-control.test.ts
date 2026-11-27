// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { h, nextTick, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../../checkbox';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { Label } from '../../label';
import { Leading } from '../../leading';
import { mountView } from '../../internal/tests/mount-helpers';
import { Suffix } from '../../suffix';
import { Trailing } from '../../trailing';
import { Prefix } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const holdsOne = (warn: { readonly mock: { readonly calls: unknown[][] } }): boolean =>
  warn.mock.calls.some(([message]) => String(message).includes('holds one control'));

/** A field named `label` with an Input and `content` in the zone `slot`. */
const field = (label: string, slot: string, zone: unknown, content: () => VNode, props = {}): (() => VNode) => {
  return () =>
    h(FormField, props, {
      label: () => h(Label, null, () => label),
      [slot]: () => h(zone as typeof Leading, null, content),
      default: () => h(Input),
    });
};

describe('A control in a zone of a FormField', () => {
  it.each([
    ['leading', Leading],
    ['trailing', Trailing],
    ['prefix', Prefix],
    ['suffix', Suffix],
  ])('leaves the Label, the id and the warning to the Input when a Checkbox is in the %s slot', async (slot, zone) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = mountView(
      field('Discount', slot, zone, () => h(Checkbox, { 'aria-label': 'Apply' }), { disabled: true }),
    );
    await nextTick();
    const input = screen.getByRole('textbox', { name: 'Discount' });
    const checkbox = screen.getByRole('checkbox', { name: 'Apply' });
    expect(input.id).toMatch(/-control$/);
    expect(container.querySelector('label')?.htmlFor).toBe(input.id);
    expect(checkbox.id).not.toMatch(/-control$/);
    expect(checkbox.getAttribute('aria-describedby')).toBeNull();
    expect(holdsOne(warn)).toBe(false);
    // The control still reads the field's state.
    expect((checkbox as HTMLInputElement).disabled).toBe(true);
  });
});
