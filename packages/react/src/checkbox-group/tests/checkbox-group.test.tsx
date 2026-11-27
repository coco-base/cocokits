// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../../checkbox';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { Label } from '../../label';
import { CheckboxGroup, type CheckboxGroupChangeDetails, type CheckboxGroupProps } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const group = (): HTMLElement => screen.getByRole('group');
const box = (name: string): HTMLInputElement => screen.getByRole<HTMLInputElement>('checkbox', { name });
const frame = (): Promise<void> =>
  act(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      }),
  );

function Pizza(props: CheckboxGroupProps): ReactElement {
  return (
    <CheckboxGroup aria-label="Toppings" {...props}>
      <Checkbox value="cheese">Cheese</Checkbox>
      <Checkbox value="olives">Olives</Checkbox>
      <Checkbox value="onion">Onion</Checkbox>
    </CheckboxGroup>
  );
}

describe('CheckboxGroup parts', () => {
  it('renders a div with role group, the class and the orientation', () => {
    render(<Pizza />);
    expect(group().tagName).toBe('DIV');
    expect(group().className).toBe('cck-checkbox-group');
    expect(group().getAttribute('aria-label')).toBe('Toppings');
    expect(group().getAttribute('data-orientation')).toBe('vertical');
    expect(group().hasAttribute('data-disabled')).toBe(false);
  });

  it('renders no fieldset or legend', () => {
    render(<Pizza />);
    expect(document.querySelector('fieldset, legend')).toBeNull();
  });

  it('passes native props to the root and renders the author element', () => {
    render(<Pizza className="mine" data-test="x" orientation="horizontal" render={<section />} />);
    expect(group().tagName).toBe('SECTION');
    expect(group().className).toBe('cck-checkbox-group mine');
    expect(group().getAttribute('data-orientation')).toBe('horizontal');
    expect(group().getAttribute('data-test')).toBe('x');
  });
});

describe('CheckboxGroup value', () => {
  it('checks the boxes of defaultValue and reports a user change in order', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: readonly string[], details: CheckboxGroupChangeDetails) => void>();
    render(<Pizza defaultValue={['cheese']} onValueChange={onValueChange} />);
    expect(box('Cheese').checked).toBe(true);
    expect(box('Olives').checked).toBe(false);
    await user.click(box('Onion'));
    await user.click(box('Cheese'));
    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([['cheese', 'onion'], ['onion']]);
    expect(onValueChange.mock.calls[0]?.[1]).toMatchObject({ reason: 'user' });
    expect(box('Cheese').checked).toBe(false);
    expect(box('Onion').checked).toBe(true);
  });

  it('is controlled by value and keeps the old list when the parent refuses', async () => {
    const user = userEvent.setup();
    render(<Pizza value={['olives']} onValueChange={() => undefined} />);
    await user.click(box('Cheese'));
    expect(box('Cheese').checked).toBe(false);
    expect(box('Olives').checked).toBe(true);
  });

  it('follows a parent that takes every change', async () => {
    const user = userEvent.setup();
    function Parent(): ReactElement {
      const [value, setValue] = useState<readonly string[]>([]);
      return (
        <Pizza
          value={value}
          onValueChange={(next) => {
            setValue(next);
          }}
        />
      );
    }
    render(<Parent />);
    await user.click(box('Olives'));
    expect(box('Olives').checked).toBe(true);
  });

  it('restores the start list on a form reset, once', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <form>
        <Pizza defaultValue={['cheese']} onValueChange={onValueChange} />
        <button type="reset">Reset</button>
      </form>,
    );
    await user.click(box('Olives'));
    onValueChange.mockClear();
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await act(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 0);
        }),
    );
    expect(box('Cheese').checked).toBe(true);
    expect(box('Olives').checked).toBe(false);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(['cheese'], expect.objectContaining({ reason: 'form-reset' }));
  });
});

describe('CheckboxGroup facts for the checkboxes', () => {
  it.each<[string, CheckboxGroupProps, { name: string; disabled: boolean }]>([
    ['name', { name: 'toppings' }, { name: 'toppings', disabled: false }],
    ['disabled', { disabled: true }, { name: '', disabled: true }],
  ])('gives each checkbox the %s of the group', (_label, props, expected) => {
    render(<Pizza {...props} />);
    for (const name of ['Cheese', 'Olives', 'Onion']) {
      expect(box(name).name).toBe(expected.name);
      expect(box(name).disabled).toBe(expected.disabled);
    }
    expect(group().hasAttribute('data-disabled')).toBe(expected.disabled);
  });

  it('sends the checked values under the name in FormData', async () => {
    const user = userEvent.setup();
    render(
      <form>
        <Pizza name="toppings" defaultValue={['cheese']} />
      </form>,
    );
    await user.click(box('Onion'));
    const form = document.querySelector('form');
    expect(new FormData(form ?? undefined).getAll('toppings')).toEqual(['cheese', 'onion']);
  });
});

describe('CheckboxGroup in a FormField', () => {
  it('is named by the Label through aria-labelledby and the Label renders no for', async () => {
    render(
      <FormField label={<Label>Toppings</Label>}>
        <Pizza aria-label={undefined} />
      </FormField>,
    );
    await frame();
    const label = screen.getByText('Toppings');
    expect(group().getAttribute('aria-labelledby')).toBe(label.id);
    expect(label.hasAttribute('for')).toBe(false);
    expect(screen.getByRole('group', { name: 'Toppings' })).toBe(group());
  });

  it('keeps the checkboxes free of the field: no second-control warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <FormField label={<Label>Toppings</Label>}>
        <Pizza aria-label={undefined} />
      </FormField>,
    );
    await frame();
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps the field for the group when a control sits inside it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <FormField label={<Label>Toppings</Label>}>
        <CheckboxGroup>
          <Checkbox value="cheese">Cheese</Checkbox>
          <Input aria-label="Other" />
        </CheckboxGroup>
      </FormField>,
    );
    await frame();
    expect(group().id).toMatch(/-control$/);
    expect(screen.getByRole('textbox', { name: 'Other' }).id).not.toMatch(/-control$/);
    expect(screen.getByRole('group', { name: 'Toppings' })).toBe(group());
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps the author name over the Label', () => {
    render(
      <FormField label={<Label>Toppings</Label>}>
        <Pizza aria-label="Own name" />
      </FormField>,
    );
    expect(group().getAttribute('aria-label')).toBe('Own name');
    expect(group().hasAttribute('aria-labelledby')).toBe(false);
  });

  it('disables the checkboxes when the field is disabled', () => {
    render(
      <FormField label={<Label>Toppings</Label>} disabled>
        <Pizza aria-label={undefined} />
      </FormField>,
    );
    expect(group().hasAttribute('data-disabled')).toBe(true);
    expect(box('Cheese').disabled).toBe(true);
  });
});

describe('CheckboxGroup name warning', () => {
  it.each<[string, CheckboxGroupProps, number]>([
    ['no name', { 'aria-label': undefined }, 1],
    ['aria-label', {}, 0],
    ['aria-labelledby', { 'aria-label': undefined, 'aria-labelledby': 'x' }, 0],
  ])('warns in development for %s: %i time(s)', async (_name, props, calls) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Pizza {...props} />);
    await frame();
    expect(warn).toHaveBeenCalledTimes(calls);
  });
});
