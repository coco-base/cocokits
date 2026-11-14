// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { checkboxMeta } from '@cocokits/machines/checkbox';
import { radioMeta } from '@cocokits/machines/radio';
import { switchMeta } from '@cocokits/machines/switch';
import { Radio } from '../../radio';
import { Switch } from '../../switch';
import { Checkbox } from '../index';
import { mountView } from '../../internal/tests/mount-helpers';
import { dataNames, expectDefaultElements, must } from '../../internal/tests/choice-helpers';

afterEach(cleanup);

describe('Checkbox, Switch and Radio parts', () => {
  it.each([
    [Checkbox, 'checkbox', checkboxMeta],
    [Switch, 'switch', switchMeta],
    [Radio, 'radio', radioMeta],
  ] as const)('renders the default element of every part of %#', (component, block, meta) => {
    mountView(() => h(component, { name: 'n' }, () => 'Caption'));
    expectDefaultElements(must(document.querySelector(`.cck-${block}`)), block, meta.defaultElements);
  });

  it('renders exactly the root data attributes of the Checkbox and the Switch meta', async () => {
    const disabled = ref(false);
    const facts = {
      readonly: true,
      required: true,
      invalid: true,
      pending: true,
      touched: true,
      dirty: true,
      submitted: true,
    };
    mountView(() => [
      h(Checkbox, { modelValue: true, indeterminate: true, disabled: disabled.value, ...facts }, () => 'Box'),
      h(Switch, { modelValue: true, disabled: disabled.value, ...facts }, () => 'Toggle'),
    ]);
    const [box, toggle] = [...document.querySelectorAll('.cck-checkbox, .cck-switch')];
    const names = (root: Element | undefined): Set<string> => new Set(dataNames(must(root)));
    const first = [names(box), names(toggle)];
    screen.getByRole<HTMLInputElement>('checkbox').focus();
    await nextTick();
    const focusedBox = names(box);
    screen.getByRole<HTMLInputElement>('switch').focus();
    await nextTick();
    const focused = [focusedBox, names(toggle)];
    // A disabled input cannot hold focus, so the two steps add up.
    disabled.value = true;
    await nextTick();
    const all = [names(box), names(toggle)];
    const union = (index: number): string[] =>
      [...new Set([...(first[index] ?? []), ...(focused[index] ?? []), ...(all[index] ?? [])])].sort();
    expect(union(0)).toEqual([...checkboxMeta.dataAttrs.root].sort());
    expect(union(1)).toEqual([...switchMeta.dataAttrs.root].sort());
    expect(union(1)).not.toContain('data-indeterminate');
  });

  it('renders exactly the root data attributes of the Radio meta', () => {
    mountView(() => h(Radio, { name: 'n', disabled: true, required: true, modelValue: true }, () => 'Caption'));
    expect(dataNames(must(document.querySelector('.cck-radio')))).toEqual([...radioMeta.dataAttrs.root].sort());
  });

  it('renders the types, the switch role and the decorative parts from the machine', () => {
    mountView(() => [h(Checkbox, null, () => 'A'), h(Switch, null, () => 'B'), h(Radio, { name: 'n' }, () => 'C')]);
    const inputs = [...document.querySelectorAll('input')];
    expect(inputs.map((input) => input.getAttribute('type'))).toEqual(['checkbox', 'checkbox', 'radio']);
    expect(inputs.map((input) => input.getAttribute('role'))).toEqual([null, 'switch', null]);
    const hidden = [...document.querySelectorAll('[aria-hidden]')].map((element) => element.className);
    expect(hidden.sort()).toEqual(
      [
        'cck-checkbox__backdrop',
        'cck-checkbox__background',
        'cck-switch__thumb',
        'cck-switch__backdrop',
        'cck-radio__backdrop',
        'cck-radio__background',
      ].sort(),
    );
  });
});

describe('Keyboard', () => {
  describe.each([
    [Checkbox, 'checkbox'],
    [Switch, 'switch'],
  ] as const)('%#', (component, role) => {
    it('skips a disabled control with Tab and reaches a read-only one', async () => {
      mountView(() => [
        h(component, { 'aria-label': 'A' }),
        h(component, { 'aria-label': 'B', disabled: true }),
        h(component, { 'aria-label': 'C', readonly: true }),
        h(component, { 'aria-label': 'D' }),
      ]);
      const user = userEvent.setup();
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole(role, { name: 'A' }));
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole(role, { name: 'C' }));
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole(role, { name: 'D' }));
      await user.tab({ shift: true });
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(screen.getByRole(role, { name: 'A' }));
    });
  });

  describe('Radio', () => {
    const group = (...radios: ReturnType<typeof h>[]) => h('fieldset', null, radios);
    const radio = (label: string, props: Record<string, unknown> = {}) =>
      h(Radio, { name: 'plan', ...props }, () => label);
    const input = (name: string): HTMLInputElement => screen.getByRole<HTMLInputElement>('radio', { name });

    it('checks the focused radio with Space', async () => {
      mountView(() => group(radio('Free'), radio('Pro')));
      const user = userEvent.setup();
      await user.tab();
      expect(document.activeElement).toBe(input('Free'));
      expect(input('Free').checked).toBe(false);
      await user.keyboard(' ');
      expect(input('Free').checked).toBe(true);
    });

    it('enters a group at the checked radio', async () => {
      mountView(() => group(radio('Free'), radio('Pro', { modelValue: true }), radio('Team')));
      await userEvent.setup().tab();
      expect(document.activeElement).toBe(input('Pro'));
    });

    it('enters a group at the first radio when none is checked', async () => {
      mountView(() => group(radio('Free'), radio('Pro'), radio('Team')));
      await userEvent.setup().tab();
      expect(document.activeElement).toBe(input('Free'));
    });

    it('tabs past a disabled radio', async () => {
      mountView(() => group(radio('Free', { disabled: true }), radio('Pro'), radio('Team')));
      await userEvent.setup().tab();
      expect(document.activeElement).toBe(input('Pro'));
    });

    it('moves with the arrow keys, wraps at both ends and skips a disabled radio', async () => {
      mountView(() => group(radio('Free', { modelValue: true }), radio('Pro', { disabled: true }), radio('Team')));
      const user = userEvent.setup();
      await user.tab();
      await user.keyboard('{ArrowDown}');
      expect(input('Team').checked).toBe(true);
      await user.keyboard('{ArrowDown}');
      expect(input('Free').checked).toBe(true);
      await user.keyboard('{ArrowUp}');
      expect(input('Team').checked).toBe(true);
      await user.keyboard('{ArrowLeft}');
      expect(input('Free').checked).toBe(true);
      await user.keyboard('{ArrowRight}');
      expect(input('Team').checked).toBe(true);
    });
  });
});
