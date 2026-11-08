// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { formFieldMeta } from '@cocokits/machines/form-field';
import { FormField, type FormFieldState } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { Input } from '../index';
import { control, EmailField, nextFrame, strict } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const field = (): HTMLElement => screen.getByTestId('field');
const label = (): HTMLElement => screen.getByText('Email', { exact: false });

describe('Input in a FormField: ids, label and description', () => {
  it('wires the id, the label for and the description with nothing written', () => {
    render(strict(<EmailField id="email" />));
    expect(control().id).toBe('email-control');
    expect(label().getAttribute('for')).toBe('email-control');
    expect(control().getAttribute('aria-describedby')).toBe('email-hint-1 email-hint-2');
    const feedback = document.getElementById('email-feedback');
    expect(feedback?.querySelectorAll('.cck-hint')).toHaveLength(2);
    expect(screen.getByRole('textbox', { name: 'Email address' })).toBe(control());
  });

  it('generates the field id and renders no id on the root', () => {
    render(
      <FormField data-testid="field" label={<Label>Name</Label>}>
        <Input />
      </FormField>,
    );
    expect(field().hasAttribute('id')).toBe(false);
    expect(control().id).toMatch(/-control$/);
    expect(control().getAttribute('aria-describedby')).toBeNull();
  });

  it('works whatever order the label is written in, and as children', () => {
    render(
      <FormField data-testid="field" id="f">
        <Input />
        <Label>Late label</Label>
      </FormField>,
    );
    expect(screen.getByText('Late label').getAttribute('for')).toBe('f-control');
    expect(screen.getByRole('textbox', { name: 'Late label' })).toBe(control());
  });

  it('lets an author id win and the label follows after mount', () => {
    render(
      <FormField id="f" label={<Label>Name</Label>}>
        <Input id="mine" />
      </FormField>,
    );
    expect(control().id).toBe('mine');
    expect(screen.getByText('Name').getAttribute('for')).toBe('mine');
  });

  it('keeps the author description first and adds the hint id once', () => {
    render(
      <FormField id="f" label={<Label>Name</Label>} hint={<Hint>Help</Hint>}>
        <Input aria-describedby="mine f-hint-1" />
      </FormField>,
    );
    expect(control().getAttribute('aria-describedby')).toBe('mine f-hint-1');
  });

  it('follows a bound field id', () => {
    function Bound(): ReactElement {
      const [id, setId] = useState('one');
      return (
        <>
          <button
            onClick={() => {
              setId('two');
            }}
          >
            change
          </button>
          <FormField id={id} label={<Label>Name</Label>} hint={<Hint>Help</Hint>}>
            <Input />
          </FormField>
        </>
      );
    }
    render(<Bound />);
    act(() => {
      screen.getByText('change').click();
    });
    expect(control().id).toBe('two-control');
    expect(screen.getByText('Name').getAttribute('for')).toBe('two-control');
    expect(control().getAttribute('aria-describedby')).toBe('two-hint-1');
  });

  it('keeps an explicit htmlFor and drops the default for a native input', () => {
    render(
      <>
        <FormField id="a" label={<Label htmlFor="mine">Native</Label>}>
          <input id="mine" />
        </FormField>
        <FormField id="b" label={<Label>Default</Label>}>
          <input id="other" />
        </FormField>
      </>,
    );
    expect(screen.getByText('Native').getAttribute('for')).toBe('mine');
    expect(screen.getByText('Default').hasAttribute('for')).toBe(false);
  });

  it('adds nothing outside a field', () => {
    render(<Input />);
    expect(control().hasAttribute('id')).toBe(false);
    expect(control().hasAttribute('aria-describedby')).toBe(false);
  });

  it('follows an Input that appears and disappears', () => {
    function Toggle({ show }: { readonly show: boolean }): ReactElement {
      return (
        <FormField id="f" label={<Label>Name</Label>}>
          {show ? <Input /> : null}
        </FormField>
      );
    }
    const { rerender } = render(<Toggle show={false} />);
    expect(screen.getByText('Name').hasAttribute('for')).toBe(false);
    rerender(<Toggle show />);
    expect(screen.getByText('Name').getAttribute('for')).toBe('f-control');
    rerender(<Toggle show={false} />);
    expect(screen.getByText('Name').hasAttribute('for')).toBe(false);
  });
});

describe('Input in a FormField: state', () => {
  it('shows the marker and data-required on the root when only the Input is required', () => {
    render(
      <FormField data-testid="field" label={<Label>Name</Label>}>
        <Input required />
      </FormField>,
    );
    const marker = screen.getByText('*');
    expect(marker.tagName).toBe('SPAN');
    expect(marker.getAttribute('aria-hidden')).toBe('true');
    expect(marker.className).toBe('cck-label__required-marker');
    expect(marker.parentElement).toBe(screen.getByText('Name', { exact: false }));
    expect(field().hasAttribute('data-required')).toBe(true);
  });

  it('reaches the Input from the field props, and hides the marker only', () => {
    render(
      <FormField data-testid="field" required disabled readOnly invalid hideRequiredMarker label={<Label>Name</Label>}>
        <Input />
      </FormField>,
    );
    expect(control().required).toBe(true);
    expect(control().disabled).toBe(true);
    expect(control().readOnly).toBe(true);
    expect(control().hasAttribute('data-invalid')).toBe(true);
    expect(screen.queryByText('*')).toBeNull();
    expect(field().hasAttribute('data-required')).toBe(true);
  });

  it('renders exactly the data-* set of the meta on the root', async () => {
    const ui = (disabled: boolean): ReactElement => (
      <FormField data-testid="field" label={<Label>Name</Label>}>
        <Input required invalid pending disabled={disabled} readOnly touched dirty submitted defaultValue="x" />
      </FormField>
    );
    const { rerender } = render(ui(false));
    await userEvent.click(control());
    rerender(ui(true));
    const names = field()
      .getAttributeNames()
      .filter((name) => name.startsWith('data-') && name !== 'data-testid')
      .sort();
    expect(names).toEqual([...formFieldMeta.dataAttrs.root].sort());
  });

  it('puts the control facts on the root as they change', async () => {
    render(
      <FormField data-testid="field" label={<Label>Name</Label>}>
        <Input />
      </FormField>,
    );
    await userEvent.click(control());
    expect(field().hasAttribute('data-focused')).toBe(true);
    await userEvent.keyboard('a');
    expect(field().hasAttribute('data-filled')).toBe(true);
    expect(field().hasAttribute('data-dirty')).toBe(true);
    await userEvent.tab();
    expect(field().hasAttribute('data-focused')).toBe(false);
    expect(field().hasAttribute('data-touched')).toBe(true);
  });

  it('keeps the facts of the machine over an author data-* attribute on the root', () => {
    render(
      <FormField data-testid="field" data-invalid="x" data-filled="x" className="mine" title="T">
        <Input />
      </FormField>,
    );
    expect(field().hasAttribute('data-invalid')).toBe(false);
    expect(field().hasAttribute('data-filled')).toBe(false);
    expect(field().className).toBe('cck-form-field mine');
    expect(field().title).toBe('T');
  });

  it('hides the field root with the control, and never strips an author hidden', () => {
    const { rerender } = render(
      <FormField data-testid="field">
        <Input hidden />
      </FormField>,
    );
    expect(field().hidden).toBe(true);
    rerender(
      <FormField data-testid="field" hidden>
        <Input />
      </FormField>,
    );
    expect(field().hidden).toBe(true);
  });

  it('hides the root when the control is hidden, whatever the author hidden says', () => {
    render(
      <FormField data-testid="field" hidden={false}>
        <Input hidden />
      </FormField>,
    );
    expect(field().hidden).toBe(true);
  });

  it('renders no id attribute on the root for an empty id', () => {
    render(
      <FormField data-testid="field" id="">
        <Input />
      </FormField>,
    );
    expect(field().hasAttribute('id')).toBe(false);
  });

  it('passes the resolved facts to the function form of render', () => {
    const seen: FormFieldState[] = [];
    render(
      <FormField
        required
        render={(props, state) => {
          seen.push(state);
          return <section {...props} />;
        }}
      >
        <Input defaultValue="x" />
      </FormField>,
    );
    expect(seen.at(-1)).toMatchObject({ required: true, filled: true, disabled: false });
  });
});

describe('Input in a FormField: one control', () => {
  it('gives a second control no generated id and no description, and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      strict(
        <FormField id="f" label={<Label>Name</Label>}>
          <Input data-testid="first" />
          <Input data-testid="second" aria-describedby="mine" required />
        </FormField>,
      ),
    );
    expect(screen.getByTestId('first').id).toBe('f-control');
    expect(screen.getByTestId('second').hasAttribute('id')).toBe(false);
    expect(screen.getByTestId('second').getAttribute('aria-describedby')).toBe('mine');
    expect(screen.queryByText('*')).toBeNull();
    expect(warn.mock.calls.some(([message]) => String(message).includes('holds one control'))).toBe(true);
  });

  it('does not let the second take over when the first unmounts', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    function Pair({ first }: { readonly first: boolean }): ReactElement {
      return (
        <FormField id="f" label={<Label>Name</Label>}>
          {first ? <Input data-testid="first" /> : null}
          <Input data-testid="second" />
        </FormField>
      );
    }
    const { rerender } = render(<Pair first />);
    rerender(<Pair first={false} />);
    expect(screen.getByTestId('second').hasAttribute('id')).toBe(false);
    expect(screen.getByText('Name').hasAttribute('for')).toBe(false);
  });
});

describe('Input accessible name warning', () => {
  const message = 'has no accessible name';
  const warned = (spy: MockInstance<typeof console.warn>): boolean =>
    spy.mock.calls.some(([text]) => String(text).includes(message));

  it('warns after mount when nothing names the Input in a field', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <FormField>
        <Input />
      </FormField>,
    );
    await nextFrame();
    expect(warned(warn)).toBe(true);
  });

  it.each([
    [
      'a Label',
      <FormField key="a" label={<Label>Name</Label>}>
        <Input />
      </FormField>,
    ],
    [
      'aria-label',
      <FormField key="b">
        <Input aria-label="Name" />
      </FormField>,
    ],
    [
      'a wrapping label',
      <FormField key="c">
        <label>
          Name <Input />
        </label>
      </FormField>,
    ],
  ])('does not warn with %s', async (_name, ui) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(ui);
    await nextFrame();
    expect(warned(warn)).toBe(false);
  });

  it('does not warn outside a field', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Input />);
    await nextFrame();
    expect(warned(warn)).toBe(false);
  });
});
