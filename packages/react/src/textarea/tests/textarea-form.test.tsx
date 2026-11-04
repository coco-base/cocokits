// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormField } from '../../form-field';
import { Textarea } from '../index';
import { must, nextTask, strict } from './fixtures';

afterEach(cleanup);

const form = (): HTMLFormElement => must(document.querySelector('form'));
const control = (): HTMLTextAreaElement => screen.getByRole<HTMLTextAreaElement>('textbox');

const CRLF = 'a\r\nb';
const LF = 'a\nb';

describe('Textarea in a native form', () => {
  it('puts the value in FormData under its name, and blocks checkValidity while required and empty', async () => {
    render(
      <form>
        <Textarea name="message" required />
      </form>,
    );
    expect(form().checkValidity()).toBe(false);
    await userEvent.type(control(), 'a{Enter}b');
    expect(form().checkValidity()).toBe(true);
    expect(new FormData(form()).get('message')).toMatch(/^a\r?\nb$/);
  });

  it('reset: restores defaultValue, reports form-reset and clears touched and dirty', async () => {
    const onValueChange = vi.fn();
    render(
      strict(
        <form>
          <Textarea defaultValue="start" onValueChange={onValueChange} />
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

  it('reset of a controlled Textarea reports the value at mount, and the parent decides', async () => {
    function Parent(): ReactElement {
      const [text, setText] = useState('mount');
      return (
        <form>
          <Textarea value={text} onValueChange={setText} />
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

  it('reset of a controlled Textarea mounted with CRLF reports the LF form, as an uncontrolled one does', async () => {
    const reported: string[] = [];
    const record = (value: string, details: { readonly reason: string }): void => {
      if (details.reason === 'form-reset') reported.push(value);
    };
    function Parent(): ReactElement {
      const [text, setText] = useState(CRLF);
      return (
        <form>
          <Textarea
            value={text}
            onValueChange={(value, details) => {
              setText(value);
              record(value, details);
            }}
          />
          <Textarea defaultValue={CRLF} onValueChange={record} aria-label="Uncontrolled" />
          <button type="reset">Reset</button>
        </form>
      );
    }
    render(<Parent />);
    await userEvent.type(screen.getAllByRole('textbox')[0], '!');
    await userEvent.click(screen.getByText('Reset'));
    await act(nextTask);
    expect(reported).toEqual([LF, LF]);
  });

  it('follows fieldset[disabled] on the Textarea and the field root', () => {
    render(
      <fieldset disabled>
        <FormField data-testid="field">
          <Textarea />
        </FormField>
      </fieldset>,
    );
    expect(control().hasAttribute('data-disabled')).toBe(true);
    expect(screen.getByTestId('field').hasAttribute('data-disabled')).toBe(true);
  });

  it('marks an invalid untouched field on a submit, and a native reset clears it', async () => {
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Textarea required invalid />
        <button type="reset">Reset</button>
      </form>,
    );
    expect(control().hasAttribute('aria-invalid')).toBe(false);
    act(() => {
      fireEvent.submit(form());
    });
    expect(control().getAttribute('aria-invalid')).toBe('true');
    expect(control().hasAttribute('data-submitted')).toBe(true);
    await userEvent.click(screen.getByText('Reset'));
    await act(nextTask);
    expect(control().hasAttribute('aria-invalid')).toBe(false);
    expect(control().hasAttribute('data-submitted')).toBe(false);
  });
});
