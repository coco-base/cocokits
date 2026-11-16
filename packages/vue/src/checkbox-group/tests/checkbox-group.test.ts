// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h, nextTick, ref, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { CHECKBOX_GROUP_NAME_WARNING, checkboxGroupMeta } from '@cocokits/machines/checkbox-group';
import { Checkbox } from '../../checkbox';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { must, nextFrame } from '../../internal/tests/choice-helpers';
import { mountView } from '../../internal/tests/mount-helpers';
import { CheckboxGroup } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const group = (): HTMLElement => must(document.querySelector<HTMLElement>('.cck-checkbox-group'));
const boxes = (): HTMLInputElement[] => screen.getAllByRole<HTMLInputElement>('checkbox');

/** A group of three checkboxes; `props` go on the group. */
function toppings(props: Record<string, unknown> = {}): VNode {
  return h(CheckboxGroup, { 'aria-label': 'Toppings', ...props }, () => [
    h(Checkbox, { value: 'cheese' }, () => 'Cheese'),
    h(Checkbox, { value: 'olives' }, () => 'Olives'),
    h(Checkbox, { value: 'ham', disabled: true }, () => 'Ham'),
  ]);
}

describe('CheckboxGroup contract (checkbox-06)', () => {
  it('renders a div with role group, the block class and the vertical orientation', () => {
    mountView(() => toppings());
    expect(group().tagName).toBe('DIV');
    expect(group().getAttribute('role')).toBe('group');
    expect(group().className).toBe('cck-checkbox-group');
    expect(group().getAttribute('data-orientation')).toBe('vertical');
    expect(group().getAttribute('aria-label')).toBe('Toppings');
    expect(screen.getByRole('group', { name: 'Toppings' })).toBe(group());
  });

  it('renders only the data attributes of the meta', () => {
    mountView(() => toppings({ disabled: true, orientation: 'horizontal' }));
    expect(
      group()
        .getAttributeNames()
        .filter((name) => name.startsWith('data-')),
    ).toEqual(expect.arrayContaining(checkboxGroupMeta.dataAttrs.root));
    expect(group().getAttribute('data-orientation')).toBe('horizontal');
  });

  it('has no axe violations, alone and in a field', async () => {
    const { container } = mountView(() => toppings());
    expect((await axe(container)).violations).toEqual([]);
    cleanup();
    const inField = mountView(() =>
      h(
        FormField,
        { id: 'f' },
        { label: () => h(Label, null, () => 'Toppings'), default: () => toppings({ 'aria-label': undefined }) },
      ),
    );
    await nextTick();
    expect((await axe(inField.container)).violations).toEqual([]);
  });
});

describe('CheckboxGroup value', () => {
  it('checks the boxes whose value is in the list and emits the new list in the order of the checks', async () => {
    const onUpdate = vi.fn();
    mountView(() => toppings({ defaultValue: ['olives'], 'onUpdate:modelValue': onUpdate }));
    expect(boxes().map((box) => box.checked)).toEqual([false, true, false]);
    await userEvent.click(boxes()[0]);
    expect(onUpdate).toHaveBeenLastCalledWith(['olives', 'cheese']);
    await userEvent.click(boxes()[1]);
    expect(onUpdate).toHaveBeenLastCalledWith(['cheese']);
    expect(boxes().map((box) => box.checked)).toEqual([true, false, false]);
  });

  it('follows a bound v-model and keeps the old list when the parent ignores an update', async () => {
    const value = ref<string[]>(['cheese']);
    mountView(() => toppings({ modelValue: value.value, 'onUpdate:modelValue': () => undefined }));
    await userEvent.click(boxes()[1]);
    expect(boxes().map((box) => box.checked)).toEqual([true, false, false]);
    value.value = ['olives'];
    await nextTick();
    expect(boxes().map((box) => box.checked)).toEqual([false, true, false]);
  });

  it('ignores the own v-model of a checkbox inside the group', async () => {
    const onOwn = vi.fn();
    mountView(() =>
      h(CheckboxGroup, { 'aria-label': 'Toppings' }, () =>
        h(Checkbox, { value: 'cheese', modelValue: true, 'onUpdate:modelValue': onOwn }, () => 'Cheese'),
      ),
    );
    expect(boxes()[0]?.checked).toBe(false);
    await userEvent.click(boxes()[0]);
    expect(onOwn).not.toHaveBeenCalled();
    expect(boxes()[0]?.checked).toBe(true);
  });

  it('gives each checkbox the name and the disabled of the group, and lets a checkbox name win', () => {
    mountView(() =>
      h(CheckboxGroup, { 'aria-label': 'Toppings', name: 'toppings', disabled: true }, () => [
        h(Checkbox, { value: 'cheese' }, () => 'Cheese'),
        h(Checkbox, { value: 'olives', name: 'own' }, () => 'Olives'),
      ]),
    );
    expect(boxes().map((box) => box.name)).toEqual(['toppings', 'own']);
    expect(boxes().every((box) => box.disabled)).toBe(true);
    expect(group().hasAttribute('data-disabled')).toBe(true);
  });

  it('submits one entry for each checked box under the name', () => {
    mountView(() => h('form', null, [toppings({ name: 'toppings', defaultValue: ['cheese', 'olives'] })]));
    const data = new FormData(must(document.querySelector('form')));
    expect(data.getAll('toppings')).toEqual(['cheese', 'olives']);
  });
});

describe('CheckboxGroup name (checkbox-06)', () => {
  it('is named by the field Label through aria-labelledby inside a FormField', async () => {
    mountView(() =>
      h(
        FormField,
        { id: 'f' },
        { label: () => h(Label, null, () => 'Toppings'), default: () => toppings({ 'aria-label': undefined }) },
      ),
    );
    await nextTick();
    expect(group().getAttribute('aria-labelledby')).toBe(must(document.querySelector('.cck-label')).id);
    expect(screen.getByRole('group', { name: 'Toppings' })).toBe(group());
    // A group is not labelable: the Label renders no `for`.
    expect(must(document.querySelector('.cck-label')).hasAttribute('for')).toBe(false);
  });

  it('lets aria-label win over the field Label, and aria-labelledby win over both', async () => {
    mountView(() =>
      h(FormField, { id: 'f' }, { label: () => h(Label, null, () => 'Toppings'), default: () => toppings() }),
    );
    await nextTick();
    expect(group().hasAttribute('aria-labelledby')).toBe(false);
    expect(group().getAttribute('aria-label')).toBe('Toppings');
    cleanup();
    mountView(() =>
      h(
        FormField,
        { id: 'f' },
        {
          label: () => h(Label, null, () => 'Toppings'),
          default: () => toppings({ 'aria-label': undefined, 'aria-labelledby': 'mine' }),
        },
      ),
    );
    await nextTick();
    expect(group().getAttribute('aria-labelledby')).toBe('mine');
  });

  it('warns in development while nothing names it, and not when something does', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() => h(CheckboxGroup, null, () => h(Checkbox, { value: 'a' }, () => 'A')));
    await nextFrame();
    expect(warn).toHaveBeenCalledWith(CHECKBOX_GROUP_NAME_WARNING);
    warn.mockClear();
    cleanup();
    mountView(() => toppings());
    await nextFrame();
    expect(warn).not.toHaveBeenCalledWith(CHECKBOX_GROUP_NAME_WARNING);
  });

  it('warns about a checkbox without a value inside the group', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() => h(CheckboxGroup, { 'aria-label': 'T' }, () => h(Checkbox, null, () => 'A')));
    expect(warn.mock.calls.some(([message]) => String(message).includes('has no value'))).toBe(true);
  });
});

describe('CheckboxGroup in a FormField', () => {
  it('is the control of the field: its facts reach the group and the checkboxes do not claim the field', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() =>
      h(
        FormField,
        { id: 'f', disabled: true },
        { label: () => h(Label, null, () => 'Toppings'), default: () => toppings({ 'aria-label': undefined }) },
      ),
    );
    await nextTick();
    expect(group().id).toBe('f-control');
    expect(group().hasAttribute('data-disabled')).toBe(true);
    expect(boxes().every((box) => box.disabled)).toBe(true);
    expect(warn.mock.calls.some(([message]) => String(message).includes('holds one control'))).toBe(false);
  });
});
