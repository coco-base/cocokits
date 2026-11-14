// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, type ReactElement, type SyntheticEvent } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { ChipList } from '../index';
import { chipTexts, listRoot, must, nextTask, removeOf, textbox } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const submitHandler = (): ReturnType<typeof vi.fn<(event: SyntheticEvent<HTMLFormElement>) => void>> =>
  vi.fn((event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
  });
const dataOf = (handler: ReturnType<typeof submitHandler>, call = 0): FormData => {
  const form = handler.mock.calls[call]?.[0].target;
  if (!(form instanceof HTMLFormElement)) throw new Error('Expected a submit event of a form.');
  return new FormData(form);
};
const hiddenInputs = (): HTMLInputElement[] => [
  ...document.querySelectorAll<HTMLInputElement>('input[aria-hidden="true"]'),
];

describe('ChipList submit', () => {
  it('keeps the form from submitting on Enter with text, and lets it submit with an empty draft', async () => {
    const user = userEvent.setup();
    const handler = submitHandler();
    render(
      <form onSubmit={handler}>
        <ChipList aria-label="Toppings" name="toppings" />
        <button type="submit">Send</button>
      </form>,
    );
    await user.type(textbox(), 'Pizza{Enter}');
    expect(handler).not.toHaveBeenCalled();
    expect(chipTexts()).toEqual(['Pizza']);
    await user.keyboard('{Enter}');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(dataOf(handler).getAll('toppings')).toEqual(['Pizza']);
  });

  it('sends one entry per chip under the name and none from the text box', async () => {
    const user = userEvent.setup();
    const handler = submitHandler();
    const { container } = render(
      <form onSubmit={handler}>
        <ChipList aria-label="Toppings" name="toppings" defaultValue={['A', 'B']} />
      </form>,
    );
    await user.type(textbox(), 'draft');
    container.querySelector('form')?.requestSubmit();
    const data = dataOf(handler);
    expect(data.getAll('toppings')).toEqual(['A', 'B']);
    expect([...data.keys()]).toEqual(['toppings', 'toppings']);
    expect(textbox().hasAttribute('name')).toBe(false);
  });

  it('renders no hidden input without a name or required, and none for an empty named list', () => {
    const { unmount } = render(<ChipList aria-label="Toppings" defaultValue={['A']} />);
    expect(hiddenInputs()).toHaveLength(0);
    unmount();
    const empty = render(<ChipList aria-label="Toppings" name="toppings" />);
    expect(hiddenInputs()).toHaveLength(0);
    empty.unmount();
    render(<ChipList aria-label="Toppings" name="toppings" defaultValue={['A']} />);
    expect(hiddenInputs()).toHaveLength(1);
  });

  it('renders the hidden inputs as clipped text inputs with no class and no tab stop', () => {
    render(<ChipList aria-label="Toppings" name="toppings" defaultValue={['A']} />);
    const [input] = hiddenInputs();
    expect(input.getAttribute('type')).toBe('text');
    expect(input.getAttribute('tabindex')).toBe('-1');
    expect(input.hasAttribute('class')).toBe(false);
    expect(input.value).toBe('A');
  });

  it('sends the entries to the form named by the form prop', () => {
    const handler = submitHandler();
    render(
      <>
        <form id="other" onSubmit={handler} />
        <ChipList aria-label="Toppings" name="toppings" form="other" defaultValue={['A']} />
      </>,
    );
    must(document.querySelector<HTMLFormElement>('#other')).requestSubmit();
    expect(dataOf(handler).getAll('toppings')).toEqual(['A']);
  });
});

describe('ChipList required', () => {
  it('is invalid while empty, valid with a chip, and the blocked submit focuses the text box', async () => {
    const user = userEvent.setup();
    const handler = submitHandler();
    const { container } = render(
      <form onSubmit={handler}>
        <ChipList aria-label="Toppings" name="toppings" required />
        <button type="submit">Send</button>
      </form>,
    );
    const form = must(container.querySelector('form'));
    expect(form.checkValidity()).toBe(false);
    expect(hiddenInputs()).toHaveLength(1);
    expect(hiddenInputs()[0]?.required).toBe(true);
    expect(textbox().hasAttribute('required')).toBe(false);
    await user.click(screen.getByText('Send'));
    expect(handler).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(document.activeElement).toBe(textbox());
    });
    expect(listRoot().hasAttribute('data-invalid')).toBe(true);
    await user.type(textbox(), 'Pizza{Enter}');
    expect(form.checkValidity()).toBe(true);
    await user.click(screen.getByText('Send'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('requires with no name too', () => {
    const { container } = render(
      <form>
        <ChipList aria-label="Toppings" required />
      </form>,
    );
    expect(must(container.querySelector('form')).checkValidity()).toBe(false);
  });
});

describe('ChipList reset', () => {
  it('restores the default value, reports form-reset, clears the draft and the submitted fact', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <StrictMode>
        <form onSubmit={submitHandler()}>
          <ChipList aria-label="Toppings" name="t" defaultValue={['A']} onValueChange={onValueChange} />
          <button type="submit">Send</button>
          <button type="reset">Reset</button>
        </form>
      </StrictMode>,
    );
    await user.type(textbox(), 'B{Enter}draft');
    await user.click(screen.getByText('Send'));
    expect(listRoot().hasAttribute('data-submitted')).toBe(true);
    onValueChange.mockClear();
    await user.click(screen.getByText('Reset'));
    await act(nextTask);
    expect(chipTexts()).toEqual(['A']);
    expect(textbox().value).toBe('');
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith(['A'], expect.objectContaining({ reason: 'form-reset' }));
    expect(listRoot().hasAttribute('data-submitted')).toBe(false);
    expect(listRoot().hasAttribute('data-dirty')).toBe(false);
  });

  it('keeps the value when the reset is canceled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <form
        onReset={(event) => {
          event.preventDefault();
        }}
      >
        <ChipList aria-label="Toppings" defaultValue={['A']} onValueChange={onValueChange} />
        <button type="reset">Reset</button>
      </form>,
    );
    await user.type(textbox(), 'B{Enter}');
    onValueChange.mockClear();
    await user.click(screen.getByText('Reset'));
    await act(nextTask);
    expect(chipTexts()).toEqual(['A', 'B']);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('ChipList disabled fieldset', () => {
  it('disables the text box and the buttons and sets data-disabled', () => {
    render(
      <fieldset disabled>
        <ChipList aria-label="Toppings" name="t" defaultValue={['A']} />
      </fieldset>,
    );
    expect(textbox().hasAttribute('disabled')).toBe(true);
    expect(removeOf('A').hasAttribute('disabled')).toBe(true);
    expect(listRoot().hasAttribute('data-disabled')).toBe(true);
    expect(hiddenInputs()[0]?.disabled).toBe(true);
  });
});

describe('ChipList in a FormField in a form', () => {
  it('submits its chips', async () => {
    const user = userEvent.setup();
    const handler = submitHandler();
    const ui: ReactElement = (
      <form onSubmit={handler}>
        <FormField label={<Label>Toppings</Label>}>
          <ChipList name="toppings" />
        </FormField>
        <button type="submit">Send</button>
      </form>
    );
    render(ui);
    await user.type(textbox(), 'Salad{Enter}');
    await user.click(screen.getByText('Send'));
    expect(dataOf(handler).getAll('toppings')).toEqual(['Salad']);
  });
});
