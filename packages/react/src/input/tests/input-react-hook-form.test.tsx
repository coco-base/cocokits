// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, type ReactElement } from 'react';
import { Controller, useForm, type UseFormReturn } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { Input } from '../index';
import { control, nextTask, strict } from './fixtures';

afterEach(cleanup);

interface Values {
  readonly email: string;
}

let api: UseFormReturn<Values> | undefined;
const current = (): UseFormReturn<Values> => {
  if (!api) throw new Error('The form has not rendered.');
  return api;
};

function Registered({ onSubmit }: { readonly onSubmit?: (values: Values) => void }): ReactElement {
  const form = useForm<Values>({ defaultValues: { email: 'start@example.com' } });
  useEffect(() => {
    api = form;
  });
  return (
    <form noValidate onSubmit={(event) => void form.handleSubmit((values) => onSubmit?.(values))(event)}>
      <FormField label={<Label>Email</Label>}>
        <Input type="email" required submitted={form.formState.isSubmitted} {...form.register('email')} />
      </FormField>
      <button type="submit">Send</button>
    </form>
  );
}

function Controlled(): ReactElement {
  const form = useForm<Values>({ defaultValues: { email: '' }, mode: 'onBlur' });
  useEffect(() => {
    api = form;
  });
  return (
    <form>
      <Controller
        control={form.control}
        name="email"
        rules={{ required: true }}
        render={({ field, fieldState }) => (
          <FormField label={<Label>Email</Label>}>
            <Input
              ref={field.ref}
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              invalid={fieldState.invalid}
              touched={fieldState.isTouched}
              dirty={fieldState.isDirty}
            />
          </FormField>
        )}
      />
      <button type="reset">Reset</button>
    </form>
  );
}

describe('Input with react-hook-form register()', () => {
  it('shows the default value, tracks typing and submits the values', async () => {
    const onSubmit = vi.fn();
    render(strict(<Registered onSubmit={onSubmit} />));
    expect(control().value).toBe('start@example.com');
    expect(control().getAttribute('name')).toBe('email');
    expect(control().hasAttribute('data-filled')).toBe(true);
    await userEvent.clear(control());
    await userEvent.type(control(), 'a@b.c');
    await userEvent.click(screen.getByText('Send'));
    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.c' });
    });
  });

  it('shows a value written by setValue, with data-filled, and keeps it across renders', async () => {
    render(strict(<Registered />));
    await userEvent.clear(control());
    expect(control().hasAttribute('data-filled')).toBe(false);
    act(() => {
      current().setValue('email', 'set@example.com');
    });
    await userEvent.click(control());
    await userEvent.tab();
    expect(control().value).toBe('set@example.com');
    expect(control().hasAttribute('data-filled')).toBe(true);
  });

  it('reset(values) writes the values through the refs and clears the submitted fact', async () => {
    render(strict(<Registered />));
    await userEvent.clear(control());
    await userEvent.click(screen.getByText('Send'));
    await vi.waitFor(() => {
      expect(control().hasAttribute('data-submitted')).toBe(true);
    });
    act(() => {
      current().reset({ email: 'new@example.com' });
    });
    await vi.waitFor(() => {
      expect(control().value).toBe('new@example.com');
    });
    expect(control().hasAttribute('data-submitted')).toBe(false);
    expect(control().hasAttribute('aria-invalid')).toBe(false);
  });

  // The check the docs rely on: reset() with no values calls the native form.reset() of the first
  // registered DOM field (react-hook-form 7.91, `_reset`: `form.reset()`), so the Input sees a reset event.
  it('reset() with no values runs the native form reset, which the Input reports', async () => {
    render(strict(<Registered />));
    const reset = vi.spyOn(HTMLFormElement.prototype, 'reset');
    await userEvent.clear(control());
    await userEvent.type(control(), 'typed@example.com');
    act(() => {
      current().reset();
    });
    await act(nextTask);
    expect(reset).toHaveBeenCalled();
    expect(control().value).toBe('start@example.com');
    expect(control().hasAttribute('data-dirty')).toBe(false);
    reset.mockRestore();
  });

  it('reset(values) does not call the native form reset', async () => {
    render(strict(<Registered />));
    const reset = vi.spyOn(HTMLFormElement.prototype, 'reset');
    act(() => {
      current().reset({ email: 'new@example.com' });
    });
    await act(nextTask);
    expect(reset).not.toHaveBeenCalled();
    reset.mockRestore();
  });
});

describe('Input with react-hook-form Controller', () => {
  it('is controlled, maps fieldState to invalid, touched and dirty, and shows aria-invalid after blur', async () => {
    render(strict(<Controlled />));
    expect(control().hasAttribute('aria-invalid')).toBe(false);
    await userEvent.click(control());
    await userEvent.tab();
    await vi.waitFor(() => {
      expect(control().getAttribute('aria-invalid')).toBe('true');
    });
    expect(control().hasAttribute('data-touched')).toBe(true);
    await userEvent.type(control(), 'a');
    await vi.waitFor(() => {
      expect(control().hasAttribute('data-dirty')).toBe(true);
    });
    expect(control().value).toBe('a');
    expect(current().getValues('email')).toBe('a');
  });

  it('shows a value set with setValue', async () => {
    render(strict(<Controlled />));
    act(() => {
      current().setValue('email', 'set@example.com');
    });
    await vi.waitFor(() => {
      expect(control().value).toBe('set@example.com');
    });
    expect(control().hasAttribute('data-filled')).toBe(true);
  });
});
