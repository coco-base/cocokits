// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, type VNode } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Radio } from '../../radio';
import { Switch } from '../../switch';
import { Checkbox } from '../index';
import { mountView } from '../../internal/tests/mount-helpers';
import { field } from './fixtures';

afterEach(cleanup);

const kinds = [
  ['Checkbox', Checkbox],
  ['Switch', Switch],
] as const;

describe.each(kinds)('%s accessibility', (_label, component) => {
  const control =
    (props: Record<string, unknown> = {}, content: string | null = 'Email me'): (() => VNode) =>
    () =>
      h(component, props, content === null ? undefined : () => content);

  it.each<[string, () => VNode]>([
    ['alone', control()],
    ['checked', control({ modelValue: true })],
    ['disabled', control({ disabled: true })],
    ['read-only', control({ readonly: true, modelValue: true })],
    ['with an aria-label only', control({ 'aria-label': 'Email me' }, null)],
    ['in a field', () => field(control())],
    ['required in a field', () => field(control(), { required: true })],
    ['invalid and touched in a field', () => field(control({ invalid: true, touched: true }))],
  ])('has no axe violations: %s', async (_name, ui) => {
    const { container } = mountView(ui);
    await nextTick();
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe('Checkbox accessibility', () => {
  it('has no axe violations while mixed', async () => {
    const { container } = mountView(() => h(Checkbox, { indeterminate: true }, () => 'All'));
    await nextTick();
    expect((await axe(container)).violations).toEqual([]);
    expect(screen.getByRole<HTMLInputElement>('checkbox', { name: 'All' }).indeterminate).toBe(true);
  });
});

describe('Switch accessibility', () => {
  it('has the role switch, no aria-checked and a name without the decoration', () => {
    mountView(() => h(Switch, null, () => 'Notify me'));
    const input = screen.getByRole('switch', { name: 'Notify me' });
    expect(input.hasAttribute('aria-checked')).toBe(false);
  });

  it('toggles from the keyboard with Space', async () => {
    mountView(() => h(Switch, null, () => 'Notify me'));
    const input = screen.getByRole<HTMLInputElement>('switch');
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(input.checked).toBe(true);
  });
});

describe('Radio accessibility', () => {
  it('has no axe violations alone', async () => {
    const { container } = mountView(() => h(Radio, { name: 'x' }, () => 'Free'));
    await nextTick();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no axe violations: three same-name radios in a fieldset', async () => {
    const { container } = mountView(() =>
      h('fieldset', null, [
        h('legend', null, 'Plan'),
        h(Radio, { name: 'plan', modelValue: true }, () => 'Free'),
        h(Radio, { name: 'plan' }, () => 'Pro'),
        h(Radio, { name: 'plan', disabled: true }, () => 'Team'),
      ]),
    );
    await nextTick();
    expect((await axe(container)).violations).toEqual([]);
  });
});
