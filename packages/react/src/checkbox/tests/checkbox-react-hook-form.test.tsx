// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, type ReactElement } from 'react';
import { Controller, useForm, type UseFormReturn } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { Switch } from '../../switch';
import { Checkbox } from '../index';
import { isSet, must, nextTask, strict } from '../../internal/tests/choice-fixtures';

afterEach(cleanup);

interface Values {
  readonly terms: boolean;
}

let api: UseFormReturn<Values> | undefined;
const current = (): UseFormReturn<Values> => {
  if (!api) throw new Error('The form has not rendered.');
  return api;
};
const box = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('checkbox');
const rootOf = (): HTMLElement => must(box().closest<HTMLElement>('.cck-checkbox'));

function Registered({ onSubmit }: { readonly onSubmit?: (values: Values) => void }): ReactElement {
  const form = useForm<Values>({ defaultValues: { terms: true } });
  // Reading the formState subscribes to it, so a change re-renders this component and the Checkbox.
  const { isDirty } = form.formState;
  useEffect(() => {
    api = form;
  });
  return (
    <form noValidate onSubmit={(event) => void form.handleSubmit((values) => onSubmit?.(values))(event)}>
      <FormField label={<Label>Terms</Label>}>
        <Checkbox required submitted={form.formState.isSubmitted} {...form.register('terms')}>
          Accept {String(isDirty)}
        </Checkbox>
      </FormField>
      <button type="submit">Send</button>
    </form>
  );
}

function ControlledSwitch(): ReactElement {
  const form = useForm<Values>({ defaultValues: { terms: false }, mode: 'onBlur' });
  useEffect(() => {
    api = form;
  });
  return (
    <form>
      <Controller
        control={form.control}
        name="terms"
        rules={{ required: true }}
        render={({ field, fieldState }) => (
          <Switch
            ref={field.ref}
            name={field.name}
            checked={field.value}
            onCheckedChange={field.onChange}
            onBlur={field.onBlur}
            invalid={fieldState.invalid}
            touched={fieldState.isTouched}
            dirty={fieldState.isDirty}
          >
            Terms
          </Switch>
        )}
      />
      <button type="reset">Reset</button>
    </form>
  );
}

describe('Checkbox with react-hook-form register()', () => {
  it('shows the default value, tracks clicks and submits the values', async () => {
    const onSubmit = vi.fn();
    render(strict(<Registered onSubmit={onSubmit} />));
    expect(box().checked).toBe(true);
    expect(box().getAttribute('name')).toBe('terms');
    expect(isSet(rootOf(), 'data-checked')).toBe(true);
    await userEvent.click(box());
    expect(box().checked).toBe(false);
    await userEvent.click(box());
    await userEvent.click(screen.getByText('Send'));
    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ terms: true });
    });
  });

  it('shows a value written by setValue through the ref, and keeps it across renders', async () => {
    render(strict(<Registered />));
    await userEvent.click(box());
    expect(isSet(rootOf(), 'data-checked')).toBe(false);
    act(() => {
      current().setValue('terms', true, { shouldDirty: true });
    });
    await userEvent.click(box());
    await userEvent.click(box());
    await userEvent.tab();
    expect(box().checked).toBe(true);
    expect(isSet(rootOf(), 'data-checked')).toBe(true);
  });

  it('follows a ref write at the next commit', async () => {
    render(strict(<Registered />));
    expect(isSet(rootOf(), 'data-checked')).toBe(true);
    act(() => {
      current().setValue('terms', false, { shouldDirty: true });
    });
    await vi.waitFor(() => {
      expect(isSet(rootOf(), 'data-checked')).toBe(false);
    });
    expect(box().checked).toBe(false);
  });

  it('reset(values) writes the values through the ref and clears the submitted fact', async () => {
    render(strict(<Registered />));
    await userEvent.click(box());
    await userEvent.click(screen.getByText('Send'));
    await vi.waitFor(() => {
      expect(isSet(rootOf(), 'data-submitted')).toBe(true);
    });
    act(() => {
      current().reset({ terms: true });
    });
    await vi.waitFor(() => {
      expect(box().checked).toBe(true);
    });
    expect(isSet(rootOf(), 'data-submitted')).toBe(false);
    expect(isSet(box(), 'aria-invalid')).toBe(false);
  });

  it('reset() with no values runs the native form reset, which the Checkbox reports', async () => {
    render(strict(<Registered />));
    const reset = vi.spyOn(HTMLFormElement.prototype, 'reset');
    await userEvent.click(box());
    act(() => {
      current().reset();
    });
    await act(nextTask);
    expect(reset).toHaveBeenCalled();
    expect(box().checked).toBe(true);
    expect(isSet(rootOf(), 'data-dirty')).toBe(false);
    reset.mockRestore();
  });
});

describe('Switch with react-hook-form Controller', () => {
  const toggle = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('switch');

  it('is controlled, maps fieldState to invalid, touched and dirty, and shows aria-invalid after blur', async () => {
    render(strict(<ControlledSwitch />));
    expect(isSet(toggle(), 'aria-invalid')).toBe(false);
    await userEvent.click(toggle());
    await userEvent.click(toggle());
    await userEvent.tab();
    await vi.waitFor(() => {
      expect(toggle().getAttribute('aria-invalid')).toBe('true');
    });
    expect(isSet(must(toggle().closest('.cck-switch')), 'data-touched')).toBe(true);
    await userEvent.click(toggle());
    await vi.waitFor(() => {
      expect(toggle().checked).toBe(true);
    });
    expect(current().getValues('terms')).toBe(true);
  });

  it('shows a value set with setValue', async () => {
    render(strict(<ControlledSwitch />));
    act(() => {
      current().setValue('terms', true);
    });
    await vi.waitFor(() => {
      expect(toggle().checked).toBe(true);
    });
    expect(isSet(must(toggle().closest('.cck-switch')), 'data-checked')).toBe(true);
  });
});
