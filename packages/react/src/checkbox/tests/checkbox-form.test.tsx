// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../index';
import { isSet, must, nextTask, strict } from '../../internal/tests/choice-fixtures';

afterEach(cleanup);

const box = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('checkbox');
const rootOf = (): HTMLElement => must(box().closest<HTMLElement>('.cck-checkbox'));
const form = (): HTMLFormElement => screen.getByTestId<HTMLFormElement>('form');
const data = (): FormData => new FormData(form());

/** A submit handler that cancels the submit, as a forms library does. */
const cancel = (event: { preventDefault: () => void }): void => {
  event.preventDefault();
};

describe('Checkbox in a real form', () => {
  it('submits on while checked, the value when given, and nothing while unchecked', async () => {
    render(
      <form data-testid="form">
        <Checkbox name="a">A</Checkbox>
        <Checkbox name="b" value="yes" defaultChecked>
          B
        </Checkbox>
      </form>,
    );
    expect(data().has('a')).toBe(false);
    expect(data().get('b')).toBe('yes');
    await userEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(data().get('a')).toBe('on');
  });

  it('blocks checkValidity while required and unchecked', async () => {
    render(
      <form data-testid="form">
        <Checkbox required>Accept</Checkbox>
      </form>,
    );
    expect(form().checkValidity()).toBe(false);
    await userEvent.click(box());
    expect(form().checkValidity()).toBe(true);
  });

  it('sets submitted on a submit attempt and marks aria-invalid', () => {
    render(
      <form data-testid="form" onSubmit={cancel}>
        <Checkbox invalid>Accept</Checkbox>
      </form>,
    );
    expect(isSet(box(), 'aria-invalid')).toBe(false);
    act(() => {
      form().requestSubmit();
    });
    expect(box().getAttribute('aria-invalid')).toBe('true');
    expect(isSet(rootOf(), 'data-submitted')).toBe(true);
  });

  it('renders data-disabled from a disabling fieldset and disables the input natively', async () => {
    const view = render(
      <form>
        <fieldset disabled={false}>
          <Checkbox>A</Checkbox>
        </fieldset>
      </form>,
    );
    expect(isSet(rootOf(), 'data-disabled')).toBe(false);
    view.rerender(
      <form>
        <fieldset disabled>
          <Checkbox>A</Checkbox>
        </fieldset>
      </form>,
    );
    await act(nextTask);
    expect(isSet(rootOf(), 'data-disabled')).toBe(true);
    expect(box().disabled).toBe(true);
  });

  describe('reset', () => {
    it('restores the value at mount, reports form-reset and clears touched, dirty and submitted', async () => {
      const onCheckedChange = vi.fn();
      render(
        strict(
          <form data-testid="form" onSubmit={cancel}>
            <Checkbox defaultChecked onCheckedChange={onCheckedChange}>
              A
            </Checkbox>
          </form>,
        ),
      );
      const user = userEvent.setup();
      await user.click(box());
      await user.tab();
      act(() => {
        form().requestSubmit();
      });
      expect(box().checked).toBe(false);
      onCheckedChange.mockClear();
      act(() => {
        form().reset();
      });
      await act(nextTask);
      expect(box().checked).toBe(true);
      expect(isSet(rootOf(), 'data-checked')).toBe(true);
      expect(onCheckedChange).toHaveBeenCalledTimes(1);
      expect(onCheckedChange).toHaveBeenCalledWith(true, { reason: 'form-reset', event: expect.any(Event) as Event });
      expect((onCheckedChange.mock.calls[0] as [boolean, { event: Event }])[1].event.type).toBe('reset');
      for (const name of ['touched', 'dirty', 'submitted']) expect(isSet(rootOf(), `data-${name}`), name).toBe(false);
    });

    it('writes the mount value of a controlled checkbox through the parent and the DOM', async () => {
      function Controlled(): ReactElement {
        const [checked, setChecked] = useState(true);
        return (
          <form data-testid="form">
            <Checkbox checked={checked} onCheckedChange={setChecked}>
              A
            </Checkbox>
          </form>
        );
      }
      render(strict(<Controlled />));
      await userEvent.click(box());
      expect(box().checked).toBe(false);
      act(() => {
        form().reset();
      });
      await act(nextTask);
      expect(box().checked).toBe(true);
      expect(isSet(rootOf(), 'data-checked')).toBe(true);
    });

    it('keeps the value when a listener cancels the reset', async () => {
      const onCheckedChange = vi.fn();
      render(
        <form data-testid="form" onReset={cancel}>
          <Checkbox onCheckedChange={onCheckedChange}>A</Checkbox>
        </form>,
      );
      await userEvent.click(box());
      onCheckedChange.mockClear();
      act(() => {
        form().reset();
      });
      await act(nextTask);
      expect(box().checked).toBe(true);
      expect(onCheckedChange).not.toHaveBeenCalled();
    });

    it('resets through a React form action', async () => {
      const onCheckedChange = vi.fn();
      render(
        <form data-testid="form" action={() => undefined}>
          <Checkbox name="a" onCheckedChange={onCheckedChange}>
            A
          </Checkbox>
          <button type="submit">Send</button>
        </form>,
      );
      await userEvent.click(box());
      onCheckedChange.mockClear();
      await userEvent.click(screen.getByText('Send'));
      await vi.waitFor(() => {
        expect(onCheckedChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'form-reset' }));
      });
      expect(box().checked).toBe(false);
    });

    it('re-targets submit and reset through the form attribute', async () => {
      const onCheckedChange = vi.fn();
      render(
        <>
          <form id="f" data-testid="form" />
          <Checkbox form="f" name="a" onCheckedChange={onCheckedChange}>
            A
          </Checkbox>
        </>,
      );
      await userEvent.click(box());
      expect(data().get('a')).toBe('on');
      act(() => {
        form().reset();
      });
      await act(nextTask);
      expect(box().checked).toBe(false);
      expect(onCheckedChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'form-reset' }));
    });
  });
});
