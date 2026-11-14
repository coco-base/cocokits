// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FieldError } from '../../field-error';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { ChipList } from '../index';
import { must, nextFrame, textbox } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const field = (): HTMLElement => screen.getByTestId('field');

function Field({ list, ...own }: { readonly list?: ReactElement } & Record<string, unknown>): ReactElement {
  return (
    <StrictMode>
      <FormField
        id="tags"
        data-testid="field"
        label={<Label>Toppings</Label>}
        hint={<Hint>Press Enter to add.</Hint>}
        error={<FieldError>Add at least one.</FieldError>}
        {...own}
      >
        {list ?? <ChipList defaultValue={['Pizza']} />}
      </FormField>
    </StrictMode>
  );
}

describe('ChipList in a FormField', () => {
  it('makes the text box the control: label for, id and description', () => {
    render(<Field />);
    expect(textbox().id).toBe('tags-control');
    expect(screen.getByText('Toppings').getAttribute('for')).toBe('tags-control');
    expect(screen.getByRole('textbox', { name: 'Toppings' })).toBe(textbox());
    expect(textbox().getAttribute('aria-describedby')).toContain('tags-hint-1');
  });

  it('keeps the author description first', () => {
    render(<Field list={<ChipList aria-describedby="mine" />} />);
    expect(textbox().getAttribute('aria-describedby')?.split(' ')[0]).toBe('mine');
  });

  it('shows data-filled on the field root with chips', () => {
    render(<Field />);
    expect(field().hasAttribute('data-filled')).toBe(true);
  });

  it.each([
    ['disabled', { disabled: true }, 'data-disabled'],
    ['readOnly', { readOnly: true }, 'data-readonly'],
    ['required', { required: true }, 'data-required'],
    ['invalid', { invalid: true }, 'data-invalid'],
  ])('passes the field %s fact to the list', (_name, own, attribute) => {
    render(<Field {...own} />);
    expect(document.querySelector('.cck-chip-list')?.hasAttribute(attribute)).toBe(true);
    expect(field().hasAttribute(attribute)).toBe(true);
  });

  it('disables the text box and the remove buttons when the field is disabled', () => {
    render(<Field disabled />);
    expect(textbox().hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Pizza' }).hasAttribute('disabled')).toBe(true);
  });

  it('renders aria-required on the text box and gates aria-invalid', async () => {
    const user = userEvent.setup();
    render(<Field required invalid />);
    expect(textbox().getAttribute('aria-required')).toBe('true');
    expect(textbox().hasAttribute('required')).toBe(false);
    expect(textbox().hasAttribute('aria-invalid')).toBe(false);
    await user.click(textbox());
    await user.tab();
    expect(textbox().getAttribute('aria-invalid')).toBe('true');
  });

  it('focuses the text box on a click in the input wrapper', async () => {
    const user = userEvent.setup();
    render(<Field />);
    await user.click(must(document.querySelector<HTMLElement>('.cck-form-field__input-wrapper')));
    expect(document.activeElement).toBe(textbox());
  });
});

describe('ChipList without a name', () => {
  it('logs one CocoKits error outside a field with no name', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<ChipList />);
    await nextFrame();
    const calls = error.mock.calls.filter(([message]) => String(message).startsWith('CocoKits: a ChipList'));
    expect(calls).toHaveLength(1);
  });

  it.each([
    ['aria-label', <ChipList aria-label="Toppings" />],
    [
      'aria-labelledby',
      <>
        <span id="l">Toppings</span>
        <ChipList aria-labelledby="l" />
      </>,
    ],
  ])('logs nothing with %s', async (_name, ui) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(ui);
    await nextFrame();
    expect(error).not.toHaveBeenCalled();
  });

  it('logs nothing in a field with a Label', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<Field />);
    await nextFrame();
    await nextFrame();
    expect(error).not.toHaveBeenCalled();
  });
});
