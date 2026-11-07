// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useActionState, useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { Input } from '../index';
import { control, must, nextTask, strict } from './fixtures';

afterEach(cleanup);

const form = (): HTMLFormElement => must(document.querySelector('form'));

describe('Input in a native form', () => {
  it('puts the value in FormData under its name, and blocks checkValidity while required and empty', async () => {
    render(
      <form>
        <Input name="email" required />
      </form>,
    );
    expect(form().checkValidity()).toBe(false);
    await userEvent.type(control(), 'a@b.c');
    expect(form().checkValidity()).toBe(true);
    expect(new FormData(form()).get('email')).toBe('a@b.c');
  });

  it('submits on Enter (implicit submission)', async () => {
    const onSubmit = vi.fn((event: { preventDefault(): void }) => {
      event.preventDefault();
    });
    render(
      <form onSubmit={onSubmit}>
        <Input name="q" />
        <button type="submit">Go</button>
      </form>,
    );
    await userEvent.type(control(), 'x{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('reset: restores defaultValue, reports form-reset and clears touched and dirty', async () => {
    const onValueChange = vi.fn();
    render(
      strict(
        <form>
          <Input defaultValue="start" onValueChange={onValueChange} />
          <button type="reset">Reset</button>
        </form>,
      ),
    );
    await userEvent.type(control(), '!');
    await userEvent.tab();
    expect(control().hasAttribute('data-touched')).toBe(true);
    expect(control().hasAttribute('data-dirty')).toBe(true);
    onValueChange.mockClear();
    await userEvent.click(screen.getByText('Reset'));
    await act(nextTask);
    expect(control().value).toBe('start');
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith('start', expect.objectContaining({ reason: 'form-reset' }));
    expect(control().hasAttribute('data-touched')).toBe(false);
    expect(control().hasAttribute('data-dirty')).toBe(false);
  });

  it('reset of a controlled Input reports the value at mount, and the parent decides', async () => {
    function Parent(): ReactElement {
      const [text, setText] = useState('mount');
      return (
        <form>
          <Input value={text} onValueChange={setText} />
          <button type="reset">Reset</button>
        </form>
      );
    }
    render(<Parent />);
    await userEvent.type(control(), '!');
    expect(control().value).toBe('mount!');
    await userEvent.click(screen.getByText('Reset'));
    await act(nextTask);
    expect(control().value).toBe('mount');
  });

  it('a canceled reset keeps the value', async () => {
    const onValueChange = vi.fn();
    render(
      <form
        onReset={(event) => {
          event.preventDefault();
        }}
      >
        <Input defaultValue="start" onValueChange={onValueChange} />
        <button type="reset">Reset</button>
      </form>,
    );
    await userEvent.type(control(), '!');
    onValueChange.mockClear();
    await userEvent.click(screen.getByText('Reset'));
    await act(nextTask);
    expect(control().value).toBe('start!');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('follows fieldset[disabled] on the Input and the field root, except in the first legend', () => {
    render(
      <fieldset disabled>
        <FormField data-testid="field">
          <Input />
        </FormField>
      </fieldset>,
    );
    expect(control().hasAttribute('data-disabled')).toBe(true);
    expect(screen.getByTestId('field').hasAttribute('data-disabled')).toBe(true);
  });

  it('follows a later change of the fieldset', () => {
    const { rerender } = render(
      <fieldset disabled={false}>
        <Input />
      </fieldset>,
    );
    expect(control().hasAttribute('data-disabled')).toBe(false);
    rerender(
      <fieldset disabled>
        <Input />
      </fieldset>,
    );
    return vi.waitFor(() => {
      expect(control().hasAttribute('data-disabled')).toBe(true);
    });
  });

  it('the form attribute re-targets submit and reset', async () => {
    render(
      <>
        <form id="a" data-testid="a" />
        <form id="b" data-testid="b" />
        <Input form="a" defaultValue="start" name="n" />
        <button type="reset" form="b">
          Reset b
        </button>
        <button type="reset" form="a">
          Reset a
        </button>
      </>,
    );
    await userEvent.type(control(), '!');
    expect(new FormData(screen.getByTestId<HTMLFormElement>('a')).get('n')).toBe('start!');
    await userEvent.click(screen.getByText('Reset b'));
    await act(nextTask);
    expect(control().value).toBe('start!');
    await userEvent.click(screen.getByText('Reset a'));
    await act(nextTask);
    expect(control().value).toBe('start');
  });
});

describe('Input and the submit attempt', () => {
  const submit = (): void => {
    fireEvent.submit(form());
  };

  it('marks an invalid untouched field on a submit, canceled ones included, and a native reset clears it', async () => {
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Input required invalid />
        <button type="reset">Reset</button>
      </form>,
    );
    expect(control().hasAttribute('aria-invalid')).toBe(false);
    act(submit);
    expect(control().getAttribute('aria-invalid')).toBe('true');
    expect(control().hasAttribute('data-submitted')).toBe(true);
    await userEvent.click(screen.getByText('Reset'));
    await act(nextTask);
    expect(control().hasAttribute('aria-invalid')).toBe(false);
    expect(control().hasAttribute('data-submitted')).toBe(false);
  });

  it('lets a submitted prop win, so a library reset can clear it', () => {
    const ui = (submitted: boolean | undefined): ReactElement => (
      <form>
        <Input required invalid submitted={submitted} />
      </form>
    );
    const { rerender } = render(ui(undefined));
    act(submit);
    expect(control().hasAttribute('data-submitted')).toBe(true);
    rerender(ui(false));
    expect(control().hasAttribute('data-submitted')).toBe(false);
    expect(control().hasAttribute('aria-invalid')).toBe(false);
  });

  it('does not mark anything for checkValidity()', () => {
    render(
      <form>
        <Input required invalid />
      </form>,
    );
    form().checkValidity();
    form().reportValidity();
    expect(control().hasAttribute('data-submitted')).toBe(false);
  });
});

describe('Input with a React form action', () => {
  it('reports form-reset when the action resets the form', async () => {
    const onValueChange = vi.fn();
    function Action(): ReactElement {
      const [, run] = useActionState((previous: number) => previous + 1, 0);
      return (
        <form action={run}>
          <Input name="q" defaultValue="start" onValueChange={onValueChange} />
          <button type="submit">Save</button>
        </form>
      );
    }
    render(<Action />);
    await userEvent.type(control(), '!');
    onValueChange.mockClear();
    await userEvent.click(screen.getByText('Save'));
    await vi.waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith('start', expect.objectContaining({ reason: 'form-reset' }));
    });
    expect(control().value).toBe('start');
  });
});

describe('Input and a Label that is clicked', () => {
  it('focuses the input', async () => {
    render(
      <FormField label={<Label>Name</Label>}>
        <Input />
      </FormField>,
    );
    await userEvent.click(screen.getByText('Name'));
    expect(document.activeElement).toBe(control());
  });
});
