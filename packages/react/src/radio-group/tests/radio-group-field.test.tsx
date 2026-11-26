// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FieldError } from '../../field-error';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Input } from '../../input';
import { Label } from '../../label';
import { Leading } from '../../leading';
import { Radio } from '../../radio';
import { RadioGroup, type RadioGroupProps } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const Plans = (props: RadioGroupProps): ReactElement => (
  <RadioGroup {...props}>
    <Radio value="free">Free</Radio>
    <Radio value="pro">Pro</Radio>
  </RadioGroup>
);

const group = (): HTMLElement => screen.getByRole('radiogroup');
const radio = (name: string): HTMLInputElement => screen.getByRole<HTMLInputElement>('radio', { name });

describe('RadioGroup in a FormField', () => {
  it('is named by the Label through aria-labelledby and described by the hint, and the Label has no for', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <FormField label={<Label>Plan</Label>} hint={<Hint>Billed monthly.</Hint>}>
        <Plans />
      </FormField>,
    );
    const label = screen.getByText('Plan');
    expect(label.hasAttribute('for')).toBe(false);
    expect(group().getAttribute('aria-labelledby')).toBe(label.id);
    expect(group().id).toMatch(/-control$/);
    expect(group().getAttribute('aria-describedby')).toContain(screen.getByText('Billed monthly.').id);
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBe(group());
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps an aria-label and an id of the author over the Label and the control id', () => {
    render(
      <FormField label={<Label>Plan</Label>}>
        <Plans id="mine" aria-label="Mine" />
      </FormField>,
    );
    expect(group().hasAttribute('aria-labelledby')).toBe(false);
    expect(group().getAttribute('aria-label')).toBe('Mine');
    expect(group().id).toBe('mine');
  });

  it('takes the disabled and required state of the field', () => {
    render(
      <FormField label={<Label>Plan</Label>} disabled required>
        <Plans />
      </FormField>,
    );
    expect(group().getAttribute('aria-disabled')).toBe('true');
    expect(group().getAttribute('aria-required')).toBe('true');
    expect(radio('Free').disabled).toBe(true);
    expect(radio('Free').required).toBe(true);
  });

  it('shows the field error and the invalid state after a required group with no value is left', async () => {
    const user = userEvent.setup();
    render(
      <>
        <FormField label={<Label>Plan</Label>} error={<FieldError>Pick a plan.</FieldError>}>
          <Plans required />
        </FormField>
        <button type="button">after</button>
      </>,
    );
    expect(screen.queryByText('Pick a plan.')).toBeNull();
    act(() => {
      radio('Free').focus();
    });
    await user.click(screen.getByRole('button', { name: 'after' }));
    expect(group().getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Pick a plan.')).toBeTruthy();
  });

  it('does not claim the field from a zone', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <FormField
        label={<Label>Amount</Label>}
        leading={
          <Leading>
            <Plans aria-label="Unit" />
          </Leading>
        }
      >
        <Input />
      </FormField>,
    );
    expect(screen.getByRole('textbox', { name: 'Amount' }).id).toMatch(/-control$/);
    expect(group().id).toBe('');
    expect(group().hasAttribute('aria-labelledby')).toBe(false);
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('RadioGroup and a blocked submit', () => {
  it('shows the invalid state of a required group with no value after a blocked submit, and a reset clears it', async () => {
    const { container } = render(
      <form>
        <Plans aria-label="Plan" required />
      </form>,
    );
    const form = container.querySelector('form');
    if (!form) throw new Error('No form rendered.');
    expect(group().hasAttribute('aria-invalid')).toBe(false);
    act(() => {
      expect(form.checkValidity()).toBe(false);
    });
    expect(group().getAttribute('aria-invalid')).toBe('true');
    expect(group().hasAttribute('data-invalid')).toBe(true);
    act(() => {
      form.reset();
    });
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(group().hasAttribute('aria-invalid')).toBe(false);
  });
});
