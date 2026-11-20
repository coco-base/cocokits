// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, ref, type Component, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FieldError } from '../../field-error';
import { Hint } from '../../hint';
import { Input } from '../../input';
import { Label } from '../../label';
import { Leading } from '../../leading';
import { Prefix } from '../../prefix';
import { Suffix } from '../../suffix';
import { Textarea } from '../../textarea';
import { Trailing } from '../../trailing';
import { FormField } from '../index';
import { mountView, pick } from '../../internal/tests/mount-helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const classOf = (element: Element): string => element.className.split(' ')[0] ?? '';
const childClasses = (selector: string): string[] =>
  [...(document.querySelector(selector)?.children ?? [])].map(classOf);

describe('FormField zones', () => {
  it.each<[string, Component, string]>([
    ['Textarea', Textarea, 'cck-textarea'],
    ['Input', Input, 'cck-input'],
  ])('renders the Anatomy order whatever the order of the slots, with a %s', async (_name, Control, controlClass) => {
    mountView(() =>
      h(FormField, null, {
        error: () => h(FieldError, { force: true }, () => 'Error'),
        hint: () => h(Hint, null, () => 'Hint'),
        trailing: () => h(Trailing, null, () => 'T'),
        suffix: () => h(Suffix, null, () => 'S'),
        prefix: () => h(Prefix, null, () => 'P'),
        leading: () => h(Leading, null, () => 'L'),
        label: () => h(Label, null, () => 'Label'),
        default: () => h(Control),
      }),
    );
    await nextTick();
    expect(childClasses('.cck-form-field')).toEqual([
      'cck-label',
      'cck-form-field__wrapper',
      'cck-form-field__feedback-wrapper',
    ]);
    expect(childClasses('.cck-form-field__wrapper')).toEqual([
      'cck-leading',
      'cck-form-field__input-wrapper',
      'cck-trailing',
    ]);
    expect(childClasses('.cck-form-field__input-wrapper')).toEqual(['cck-prefix', controlClass, 'cck-suffix']);
    expect(childClasses('.cck-form-field__feedback-wrapper')).toEqual(['cck-hint', 'cck-field-error']);
  });

  it('renders nothing for an empty zone', () => {
    mountView(() => h(FormField, { 'data-testid': 'field' }, () => h(Input, { 'aria-label': 'Name' })));
    expect(childClasses('.cck-form-field__wrapper')).toEqual(['cck-form-field__input-wrapper']);
    expect(childClasses('.cck-form-field__input-wrapper')).toEqual(['cck-input']);
  });

  it('renders a zone component passed in the default slot inside the input wrapper in source order', () => {
    mountView(() => h(FormField, null, () => [h(Input, { 'aria-label': 'Name' }), h(Suffix, null, () => 'S')]));
    expect(childClasses('.cck-form-field__input-wrapper')).toEqual(['cck-input', 'cck-suffix']);
  });

  it('renders the zones inside the child with asChild', () => {
    mountView(() =>
      h(
        FormField,
        { asChild: true },
        {
          prefix: () => h(Prefix, null, () => 'P'),
          default: () => h('section', { 'data-testid': 'host' }, [h(Input, { 'aria-label': 'Name' })]),
        },
      ),
    );
    expect(screen.getByTestId('host').tagName.toLowerCase()).toBe('section');
    expect(childClasses('.cck-form-field__input-wrapper')).toEqual(['cck-prefix', 'cck-input']);
  });
});

describe('FormField with a Textarea', () => {
  it('gives it the control id, points the Label at it and describes it by the hint', async () => {
    mountView(() =>
      h(
        FormField,
        { id: 'msg' },
        {
          label: () => h(Label, null, () => 'Message'),
          hint: () => h(Hint, null, () => 'Help'),
          default: () => h(Textarea),
        },
      ),
    );
    await nextTick();
    const area = screen.getByRole('textbox', { name: 'Message' });
    expect(area.id).toBe('msg-control');
    expect(area.getAttribute('aria-describedby')).toBe('msg-hint-1');
    expect(document.querySelector('.cck-form-field__input-wrapper:has(> .cck-textarea)')).not.toBeNull();
  });

  it('keeps an author id and lets the Label follow it', async () => {
    mountView(() =>
      h(FormField, null, { label: () => h(Label, null, () => 'Message'), default: () => h(Textarea, { id: 'mine' }) }),
    );
    await nextTick();
    expect(screen.getByRole('textbox', { name: 'Message' }).id).toBe('mine');
  });

  it('makes the first control of a mixed field the control and warns for the second', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() =>
      h(
        FormField,
        { id: 'f' },
        {
          label: () => h(Label, null, () => 'Name'),
          default: () => [
            h(Textarea, { 'data-testid': 'first' }),
            h(Input, { 'data-testid': 'second', 'aria-label': 'Other' }),
          ],
        },
      ),
    );
    await nextTick();
    expect(screen.getByTestId('first').id).toBe('f-control');
    expect(screen.getByTestId('second').id).toBe('');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('holds one control'));
  });

  it('reaches the field root with the facts of the Textarea', async () => {
    mountView(() =>
      h(FormField, { 'data-testid': 'field' }, () =>
        h(Textarea, { 'aria-label': 'Message', required: true, modelValue: 'x' }),
      ),
    );
    await nextTick();
    const root = screen.getByTestId('field');
    expect(root.hasAttribute('data-required')).toBe(true);
    expect(root.hasAttribute('data-filled')).toBe(true);
  });
});

describe('FormField container click', () => {
  const field = (control: () => VNode, extra: Record<string, () => VNode | VNode[]> = {}): VNode =>
    h(FormField, null, {
      label: () => h(Label, null, () => 'Name'),
      prefix: () => h(Prefix, { 'data-testid': 'prefix' }, () => 'P'),
      suffix: () => h(Suffix, { 'data-testid': 'suffix' }, () => ['S ', h('button', { type: 'button' }, 'Go')]),
      leading: () => h(Leading, { 'data-testid': 'leading' }, () => 'L'),
      trailing: () => h(Trailing, { 'data-testid': 'trailing' }, () => 'T'),
      default: control,
      ...extra,
    });
  const inputWrapper = (): Element => pick(document.body, '.cck-form-field__input-wrapper');

  it.each<[string, Component]>([
    ['Textarea', Textarea],
    ['Input', Input],
  ])('focuses the %s from the padding, a Prefix and a Suffix', async (_name, Control) => {
    mountView(() => field(() => h(Control)));
    await nextTick();
    const target = screen.getByRole('textbox');
    for (const element of [inputWrapper(), screen.getByTestId('prefix'), screen.getByTestId('suffix')]) {
      (document.activeElement as HTMLElement).blur();
      await userEvent.click(element);
      expect(document.activeElement, element.className).toBe(target);
    }
  });

  it('does not focus from a Button, a Leading, a Trailing or a disabled control', async () => {
    const disabled = ref(false);
    mountView(() => field(() => h(Textarea, { disabled: disabled.value })));
    await nextTick();
    const target = screen.getByRole('textbox');
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(document.activeElement).not.toBe(target);
    await userEvent.click(screen.getByTestId('leading'));
    await userEvent.click(screen.getByTestId('trailing'));
    expect(document.activeElement).not.toBe(target);
    disabled.value = true;
    await nextTick();
    await userEvent.click(inputWrapper());
    expect(document.activeElement).not.toBe(target);
  });

  it('focuses a read-only control', async () => {
    mountView(() => field(() => h(Textarea, { readonly: true })));
    await nextTick();
    await userEvent.click(screen.getByTestId('prefix'));
    expect(document.activeElement).toBe(screen.getByRole('textbox'));
  });

  it('does not focus after text in a Prefix was selected', async () => {
    mountView(() => field(() => h(Textarea)));
    await nextTick();
    // A slot leaves empty text anchors around its content.
    const text = [...screen.getByTestId('prefix').childNodes].find((node) => node.textContent === 'P') as Text;
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, 1);
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    // A real press would collapse the selection first; the click that follows a drag-select does not.
    await fireEvent.click(inputWrapper());
    expect(document.activeElement).not.toBe(screen.getByRole('textbox'));
    selection?.removeAllRanges();
  });

  it('keeps focus on a mousedown on the padding of a focused, empty, required, untouched control', async () => {
    mountView(() =>
      field(() => h(Textarea, { required: true, invalid: true }), {
        error: () => h(FieldError, { 'data-testid': 'error' }, () => 'Required'),
      }),
    );
    await nextTick();
    const target = screen.getByRole('textbox');
    target.focus();
    await userEvent.pointer({ keys: '[MouseLeft]', target: inputWrapper() });
    expect(document.activeElement).toBe(target);
    expect(target.hasAttribute('data-touched')).toBe(false);
    expect(screen.getByTestId('error').textContent).toBe('');
  });

  it('does not focus a native input that is not a CocoKits control', async () => {
    mountView(() =>
      h(FormField, null, {
        prefix: () => h(Prefix, { 'data-testid': 'prefix' }, () => 'P'),
        default: () => h('input', { 'aria-label': 'Native' }),
      }),
    );
    await nextTick();
    await userEvent.click(screen.getByTestId('prefix'));
    expect(document.activeElement).not.toBe(screen.getByLabelText('Native'));
  });

  it('forgets the control when it unmounts', async () => {
    const shown = ref(true);
    mountView(() => field(() => (shown.value ? h(Textarea) : h('span'))));
    await nextTick();
    shown.value = false;
    await nextTick();
    await userEvent.click(inputWrapper());
    expect(document.activeElement).toBe(document.body);
  });
});

describe('FormField description without a theme', () => {
  it('reads the hint and the shown error as two phrases', async () => {
    mountView(() =>
      h(
        FormField,
        { id: 'msg' },
        {
          label: () => h(Label, null, () => 'Message'),
          hint: () => h(Hint, null, () => 'Help'),
          error: () => h(FieldError, { force: true }, () => 'Enter a message.'),
          default: () => h(Textarea),
        },
      ),
    );
    await nextTick();
    const area = screen.getByRole('textbox', { description: 'Help Enter a message.' });
    expect(area.getAttribute('aria-describedby')).toBe('msg-hint-1 msg-error-1');
  });

  it('keeps an author id on a part and lists it', async () => {
    mountView(() =>
      h(
        FormField,
        { id: 'msg' },
        {
          label: () => h(Label, null, () => 'Message'),
          hint: () => h(Hint, { id: 'mine' }, () => 'Help'),
          default: () => h(Textarea, { ariaDescribedby: 'first' }),
        },
      ),
    );
    await nextTick();
    expect(screen.getByRole('textbox').getAttribute('aria-describedby')).toBe('first mine');
  });
});
