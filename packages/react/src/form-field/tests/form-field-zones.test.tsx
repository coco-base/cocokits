// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function must<T>(value: T | null): T {
  if (value === null) throw new Error('Expected the element to exist.');
  return value;
}
const classOf = (element: Element): string => element.className.split(' ')[0] ?? '';
const childClasses = (selector: string): string[] =>
  [...(document.querySelector(selector)?.children ?? [])].map(classOf);

describe('FormField zones', () => {
  it.each([
    ['Textarea', <Textarea key="t" />],
    ['Input', <Input key="i" />],
  ])('renders the Anatomy order whatever the order of the props, with a %s', (_name, control) => {
    render(
      <FormField
        error={<FieldError force>Error</FieldError>}
        hint={<Hint>Hint</Hint>}
        trailing={<Trailing>T</Trailing>}
        suffix={<Suffix>S</Suffix>}
        prefix={<Prefix>P</Prefix>}
        leading={<Leading>L</Leading>}
        label={<Label>Label</Label>}
      >
        {control}
      </FormField>,
    );
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
    expect(childClasses('.cck-form-field__input-wrapper')).toEqual([
      'cck-prefix',
      control.type === Input ? 'cck-input' : 'cck-textarea',
      'cck-suffix',
    ]);
    expect(childClasses('.cck-form-field__feedback-wrapper')).toEqual(['cck-hint', 'cck-field-error']);
  });

  it('renders nothing for an empty zone and accepts no rdfa prefix string on the root', () => {
    render(
      <FormField data-testid="field">
        <Input aria-label="Name" />
      </FormField>,
    );
    expect(childClasses('.cck-form-field__wrapper')).toEqual(['cck-form-field__input-wrapper']);
    expect(childClasses('.cck-form-field__input-wrapper')).toEqual(['cck-input']);
    expect(screen.getByTestId('field').hasAttribute('prefix')).toBe(false);
  });

  it('renders a zone component passed as children inside the input wrapper in source order', () => {
    render(
      <FormField>
        <Input aria-label="Name" />
        <Suffix>S</Suffix>
      </FormField>,
    );
    expect(childClasses('.cck-form-field__input-wrapper')).toEqual(['cck-input', 'cck-suffix']);
  });
});

describe('FormField with a Textarea', () => {
  it('gives it the control id, points the Label at it and describes it by the feedback wrapper', () => {
    render(
      <FormField id="msg" label={<Label>Message</Label>} hint={<Hint>Help</Hint>}>
        <Textarea />
      </FormField>,
    );
    const area = screen.getByRole('textbox', { name: 'Message' });
    expect(area.id).toBe('msg-control');
    expect(area.getAttribute('aria-describedby')).toBe('msg-feedback');
    expect(document.querySelector('.cck-form-field__input-wrapper:has(> .cck-textarea)')).not.toBeNull();
  });

  it('keeps an author id and lets the Label follow it', () => {
    render(
      <FormField label={<Label>Message</Label>}>
        <Textarea id="mine" />
      </FormField>,
    );
    expect(screen.getByRole('textbox', { name: 'Message' }).id).toBe('mine');
  });

  it('makes the first control of a mixed field the control and warns for the second', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <FormField id="f" label={<Label>Name</Label>}>
        <Textarea data-testid="first" />
        <Input data-testid="second" aria-label="Other" />
      </FormField>,
    );
    expect(screen.getByTestId('first').id).toBe('f-control');
    expect(screen.getByTestId('second').id).toBe('');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('holds one control'));
  });

  it('reaches the field root with the facts of the Textarea', () => {
    render(
      <FormField data-testid="field">
        <Textarea aria-label="Message" required defaultValue="x" />
      </FormField>,
    );
    const root = screen.getByTestId('field');
    expect(root.hasAttribute('data-required')).toBe(true);
    expect(root.hasAttribute('data-filled')).toBe(true);
  });
});

describe('FormField container click', () => {
  const field = (control: ReactElement, extra: Record<string, ReactElement> = {}): ReactElement => (
    <FormField
      label={<Label>Name</Label>}
      prefix={<Prefix data-testid="prefix">P</Prefix>}
      suffix={
        <Suffix data-testid="suffix">
          S <button type="button">Go</button>
        </Suffix>
      }
      leading={<Leading data-testid="leading">L</Leading>}
      trailing={<Trailing data-testid="trailing">T</Trailing>}
      {...extra}
    >
      {control}
    </FormField>
  );
  const inputWrapper = (): Element => must(document.querySelector('.cck-form-field__input-wrapper'));

  it.each([
    ['Textarea', <Textarea key="t" />],
    ['Input', <Input key="i" />],
  ])('focuses the %s from the padding, a Prefix and a Suffix', async (_name, control) => {
    render(field(control));
    const target = screen.getByRole('textbox');
    for (const element of [inputWrapper(), screen.getByTestId('prefix'), screen.getByTestId('suffix')]) {
      (document.activeElement as HTMLElement).blur();
      await userEvent.click(element);
      expect(document.activeElement, element.className).toBe(target);
    }
  });

  it('does not focus from a Button, a Leading, a Trailing or a disabled control', async () => {
    const { rerender } = render(field(<Textarea />));
    const target = screen.getByRole('textbox');
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(document.activeElement).not.toBe(target);
    await userEvent.click(screen.getByTestId('leading'));
    await userEvent.click(screen.getByTestId('trailing'));
    expect(document.activeElement).not.toBe(target);
    rerender(field(<Textarea disabled />));
    await userEvent.click(inputWrapper());
    expect(document.activeElement).not.toBe(target);
  });

  it('focuses a read-only control', async () => {
    render(field(<Textarea readOnly />));
    await userEvent.click(screen.getByTestId('prefix'));
    expect(document.activeElement).toBe(screen.getByRole('textbox'));
  });

  it('does not focus after text in a Prefix was selected', () => {
    render(field(<Textarea />));
    const text = screen.getByTestId('prefix').firstChild as Text;
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, 1);
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    // A real press would collapse the selection first; the click that follows a drag-select does not.
    fireEvent.click(inputWrapper());
    expect(document.activeElement).not.toBe(screen.getByRole('textbox'));
    selection?.removeAllRanges();
  });

  it('keeps focus on a mousedown on the padding of a focused, empty, required, untouched control', async () => {
    render(
      field(<Textarea required invalid />, {
        error: <FieldError data-testid="error">Required</FieldError>,
      }),
    );
    const target = screen.getByRole('textbox');
    target.focus();
    await userEvent.pointer({ keys: '[MouseLeft]', target: inputWrapper() });
    expect(document.activeElement).toBe(target);
    expect(target.hasAttribute('data-touched')).toBe(false);
    expect(screen.getByTestId('error').textContent).toBe('');
  });

  it('does not focus a native input that is not a CocoKits control', async () => {
    render(
      <FormField prefix={<Prefix data-testid="prefix">P</Prefix>}>
        <input aria-label="Native" />
      </FormField>,
    );
    await userEvent.click(screen.getByTestId('prefix'));
    expect(document.activeElement).not.toBe(screen.getByLabelText('Native'));
  });

  it('forgets the control when it unmounts', async () => {
    const { rerender } = render(field(<Textarea />));
    rerender(field(<span />));
    await userEvent.click(inputWrapper());
    expect(document.activeElement).toBe(document.body);
  });
});
