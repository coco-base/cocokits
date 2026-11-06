// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, ref, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { formFieldMeta } from '@cocokits/machines/form-field';
import { labelMeta } from '@cocokits/machines/label';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { Input } from '../index';
import { mountView } from '../../internal/tests/mount-helpers';
import { control, emailField, field, nextFrame } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const root = (): HTMLElement => screen.getByTestId('field');
const named = (text: string): HTMLElement => screen.getByText(text, { exact: false });

describe('Input in a FormField: ids, label and description', () => {
  it('wires the id, the label for and the description with nothing written', () => {
    mountView(() => emailField('email'));
    expect(control().id).toBe('email-control');
    expect(named('Email').getAttribute('for')).toBe('email-control');
    expect(control().getAttribute('aria-describedby')).toBe('email-feedback');
    expect(document.getElementById('email-feedback')?.querySelectorAll('.cck-hint')).toHaveLength(2);
    expect(screen.getByRole('textbox', { name: 'Email address' })).toBe(control());
  });

  it('generates the field id and renders no id on the root', () => {
    mountView(() => field());
    expect(root().hasAttribute('id')).toBe(false);
    expect(control().id).toMatch(/-control$/);
    expect(control().getAttribute('aria-describedby')).toBe(`${control().id.replace(/-control$/, '')}-feedback`);
  });

  it('works whatever order the label is written in, and in the default slot', () => {
    mountView(() => h(FormField, { id: 'f' }, { default: () => [h(Input), h(Label, null, () => 'Late label')] }));
    expect(screen.getByText('Late label').getAttribute('for')).toBe('f-control');
    expect(screen.getByRole('textbox', { name: 'Late label' })).toBe(control());
  });

  it('lets an author id win and the label follows after mount', async () => {
    mountView(() => field({ id: 'f' }, () => h(Input, { id: 'mine' })));
    await nextTick();
    expect(control().id).toBe('mine');
    expect(named('Name').getAttribute('for')).toBe('mine');
  });

  it('keeps the author description first and adds the feedback id once', () => {
    mountView(() => field({ id: 'f' }, () => h(Input, { 'aria-describedby': 'mine f-feedback' })));
    expect(control().getAttribute('aria-describedby')).toBe('mine f-feedback');
    expect(control().getAttribute('aria-describedby')).not.toBe('mine f-feedback f-feedback');
  });

  it('follows a bound field id', async () => {
    const id = ref('one');
    mountView(() =>
      field(
        { id: id.value },
        () => h(Input),
        () => h(Label, null, () => 'Name'),
      ),
    );
    id.value = 'two';
    await nextTick();
    expect(control().id).toBe('two-control');
    expect(named('Name').getAttribute('for')).toBe('two-control');
    expect(control().getAttribute('aria-describedby')).toBe('two-feedback');
    expect(root().id).toBe('two');
  });

  it('keeps an explicit for and drops the default for a native input', async () => {
    mountView(() => [
      field(
        { id: 'a' },
        () => h('input', { id: 'mine' }),
        () => h(Label, { for: 'mine' }, () => 'Native'),
      ),
      field(
        { id: 'b' },
        () => h('input', { id: 'other' }),
        () => h(Label, null, () => 'Default'),
      ),
    ]);
    await nextTick();
    expect(screen.getByText('Native').getAttribute('for')).toBe('mine');
    expect(screen.getByText('Default').hasAttribute('for')).toBe(false);
  });

  it('adds nothing outside a field', () => {
    mountView(() => h(Input));
    expect(control().hasAttribute('id')).toBe(false);
    expect(control().hasAttribute('aria-describedby')).toBe(false);
  });

  it('follows an Input that appears and disappears', async () => {
    const show = ref(false);
    mountView(() => field({ id: 'f' }, () => (show.value ? h(Input) : [])));
    await nextTick();
    expect(named('Name').hasAttribute('for')).toBe(false);
    show.value = true;
    await nextTick();
    expect(named('Name').getAttribute('for')).toBe('f-control');
    show.value = false;
    await nextTick();
    expect(named('Name').hasAttribute('for')).toBe(false);
  });
});

describe('Input in a FormField: state', () => {
  it('shows the marker and data-required on the root when only the Input is required', async () => {
    mountView(() => field({}, () => h(Input, { required: true })));
    await nextTick();
    const marker = screen.getByText('*');
    expect(marker.tagName.toLowerCase()).toBe(labelMeta.defaultElements?.requiredMarker);
    expect(marker.getAttribute('aria-hidden')).toBe('true');
    expect(marker.className).toBe('cck-label__required-marker');
    expect(marker.parentElement).toBe(named('Name'));
    expect(root().hasAttribute('data-required')).toBe(true);
  });

  it('reaches the Input from the field props, and hides the marker only', async () => {
    mountView(() => field({ required: true, disabled: true, readonly: true, invalid: true, hideRequiredMarker: true }));
    await nextTick();
    expect(control().required).toBe(true);
    expect(control().disabled).toBe(true);
    expect(control().readOnly).toBe(true);
    expect(control().hasAttribute('data-invalid')).toBe(true);
    expect(screen.queryByText('*')).toBeNull();
    expect(root().hasAttribute('data-required')).toBe(true);
  });

  it('renders exactly the data-* set of the meta on the root', async () => {
    const disabled = ref(false);
    mountView(() =>
      field({}, () =>
        h(Input, {
          required: true,
          invalid: true,
          pending: true,
          disabled: disabled.value,
          readonly: true,
          touched: true,
          dirty: true,
          submitted: true,
          modelValue: 'x',
        }),
      ),
    );
    await userEvent.click(control());
    disabled.value = true;
    await nextTick();
    const names = root()
      .getAttributeNames()
      .filter((name) => name.startsWith('data-') && name !== 'data-testid')
      .sort();
    expect(names).toEqual([...formFieldMeta.dataAttrs.root].sort());
  });

  it('puts the control facts on the root as they change', async () => {
    mountView(() => field());
    await userEvent.click(control());
    expect(root().hasAttribute('data-focused')).toBe(true);
    await userEvent.keyboard('a');
    expect(root().hasAttribute('data-filled')).toBe(true);
    expect(root().hasAttribute('data-dirty')).toBe(true);
    await userEvent.tab();
    expect(root().hasAttribute('data-focused')).toBe(false);
    expect(root().hasAttribute('data-touched')).toBe(true);
  });

  it('hides the field root with the control, and an author hidden of false never shows it again', async () => {
    const hiddenField = ref<boolean | undefined>(false);
    mountView(() => field({ hidden: hiddenField.value }, () => h(Input, { hidden: true })));
    await nextTick();
    expect(root().hidden).toBe(true);
    hiddenField.value = undefined;
    await nextTick();
    expect(root().hidden).toBe(true);
  });

  it('keeps an author hidden on the root while the control is visible', async () => {
    mountView(() => field({ hidden: true }, () => h(Input)));
    await nextTick();
    expect(root().hidden).toBe(true);
  });

  it('renders no id attribute on the root for an empty id, and generates the field id', async () => {
    mountView(() => field({ id: '' }));
    await nextTick();
    expect(root().hasAttribute('id')).toBe(false);
    expect(control().id).toMatch(/-control$/);
    expect(control().id).not.toBe('-control');
    const feedback = control().getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(feedback)?.className).toBe('cck-form-field__feedback-wrapper');
  });

  it('keeps the facts of the machine over an author data-* attribute on the root', () => {
    mountView(() => field({ 'data-invalid': 'x', 'data-filled': 'x', class: 'mine', title: 'T' }));
    expect(root().hasAttribute('data-invalid')).toBe(false);
    expect(root().hasAttribute('data-filled')).toBe(false);
    expect([...root().classList].sort()).toEqual(['cck-form-field', 'mine']);
    expect(root().title).toBe('T');
  });

  it('puts the root id only when the author gave one', () => {
    mountView(() => field({ id: 'mine' }));
    expect(root().id).toBe('mine');
  });
});

describe('Input in a FormField: one control', () => {
  it('gives a second control no generated id and no description, and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() =>
      field({ id: 'f' }, () => [
        h(Input, { 'data-testid': 'first' }),
        h(Input, { 'data-testid': 'second', 'aria-describedby': 'mine', required: true }),
      ]),
    );
    await nextTick();
    expect(screen.getByTestId('first').id).toBe('f-control');
    expect(screen.getByTestId('second').hasAttribute('id')).toBe(false);
    expect(screen.getByTestId('second').getAttribute('aria-describedby')).toBe('mine');
    expect(screen.queryByText('*')).toBeNull();
    expect(root().hasAttribute('data-required')).toBe(false);
    expect(warn.mock.calls.some(([message]) => String(message).includes('holds one control'))).toBe(true);
  });

  it('does not let the second take over when the first unmounts', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const first = ref(true);
    mountView(() =>
      field({ id: 'f' }, () => [
        ...(first.value ? [h(Input, { key: 'a', 'data-testid': 'first' })] : []),
        h(Input, { key: 'b', 'data-testid': 'second' }),
      ]),
    );
    await nextTick();
    first.value = false;
    await nextTick();
    await nextTick();
    expect(screen.getByTestId('second').hasAttribute('id')).toBe(false);
    expect(named('Name').hasAttribute('for')).toBe(false);
  });
});

describe('Input accessible name warning', () => {
  const warned = (spy: MockInstance<typeof console.warn>): boolean =>
    spy.mock.calls.some(([text]) => String(text).includes('has no accessible name'));

  it('warns after mount when nothing names the Input in a field', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() => field({}, () => h(Input), null));
    await nextFrame();
    expect(warned(warn)).toBe(true);
  });

  it.each<[string, () => VNode]>([
    ['a Label', () => field()],
    ['aria-label', () => field({}, () => h(Input, { 'aria-label': 'Name' }), null)],
    ['a wrapping label', () => field({}, () => h('label', null, ['Name ', h(Input)]), null)],
  ])('does not warn with %s', async (_name, ui) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(ui);
    await nextFrame();
    expect(warned(warn)).toBe(false);
  });

  it('does not warn outside a field', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() => h(Input));
    await nextFrame();
    expect(warned(warn)).toBe(false);
  });

  it('keeps several Hints inside the described feedback wrapper', () => {
    mountView(() =>
      h(
        FormField,
        { id: 'f' },
        { default: () => h(Input), hint: () => [h(Hint, null, () => 'One'), h(Hint, null, () => 'Two')] },
      ),
    );
    const feedback = document.getElementById('f-feedback');
    expect(feedback?.querySelectorAll('.cck-hint')).toHaveLength(2);
  });
});
