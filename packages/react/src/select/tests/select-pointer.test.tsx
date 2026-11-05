// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  active,
  Dishes,
  Example,
  gone,
  lastReason,
  must,
  Opt,
  option,
  reasonsOf,
  stubTopLayer,
  trigger,
  valueText,
} from './fixtures';

beforeEach(() => {
  stubTopLayer();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Select pointer', () => {
  it('highlights under the pointer, skips a disabled option, and a press in the list keeps the focus on the trigger', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.hover(option('Steak'));
    expect(active()).toBe('Steak');
    await user.hover(option('Pizza'));
    expect(active()).toBe('Steak');
    await user.pointer({ keys: '[MouseLeft>]', target: option('Steak') });
    expect(document.activeElement).toBe(trigger());
  });

  it('chooses on click, marks it selected and closes', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Burger' }));
    await gone();
    expect(valueText()).toBe('Burger');
    expect(reasonsOf(onValueChange)).toEqual([['Burger', 'user']]);
    await user.click(trigger());
    await screen.findByRole('listbox');
    expect(option('Burger').getAttribute('aria-selected')).toBe('true');
    expect(option('Burger').hasAttribute('data-selected')).toBe(true);
    expect(option('Cake').getAttribute('aria-selected')).toBe('false');
  });

  it('does not choose a disabled option', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('lets a preventDefault in the option onClick veto the choice', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Dishes onValueChange={onValueChange}>
        <Opt
          value="Cake"
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          Cake
        </Opt>
        <Opt value="Pizza">Pizza</Opt>
      </Dishes>,
    );
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(option('Pizza'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('closes on an outside press with the outside-press reason, and not on a press inside the list', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.click(must(document.getElementById('empty')));
    await gone();
    expect(lastReason(onOpenChange)).toBe('outside-press');
  });

  it('closes when the trigger is clicked again', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.click(trigger());
    await gone();
    expect(lastReason(onOpenChange)).toBe('trigger');
  });
});

describe('Select multiple', () => {
  it('toggles values, stays open, and shows the values joined with a comma', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example multiple onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    await user.click(option('Steak'));
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['Cake', 'Steak']);
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(option('Cake').getAttribute('aria-selected')).toBe('true');
    expect(valueText()).toBe('Cake, Steak');
    await user.click(option('Cake'));
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['Steak']);
    expect(onValueChange).toHaveBeenCalledTimes(3);
  });
});

describe('Select value and open state', () => {
  function Controlled({ onSeen }: { readonly onSeen?: (value: unknown) => void }): ReactElement {
    const [value, setValue] = useState<string | null>('Cake');
    return (
      <>
        <Dishes
          value={value}
          onValueChange={(next) => {
            onSeen?.(next);
            setValue(next);
          }}
        >
          <Opt value="Cake">Cake</Opt>
          <Opt value="Pizza">Pizza</Opt>
        </Dishes>
        <p data-testid="selected">Selected: {String(value)}</p>
      </>
    );
  }

  it('is controlled with value and onValueChange', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    expect(valueText()).toBe('Cake');
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    expect(screen.getByTestId('selected').textContent).toBe('Selected: Pizza');
    expect(valueText()).toBe('Pizza');
  });

  it('keeps the value when the parent refuses the change', async () => {
    const user = userEvent.setup();
    render(
      <Dishes value="Cake" onValueChange={() => undefined}>
        <Opt value="Cake">Cake</Opt>
        <Opt value="Pizza">Pizza</Opt>
      </Dishes>,
    );
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    expect(valueText()).toBe('Cake');
  });

  it('is uncontrolled with defaultValue and reports a change of the controlled mode in development', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { rerender } = render(<Example defaultValue="Burger" />);
    expect(valueText()).toBe('Burger');
    rerender(<Example value="Cake" />);
    expect(error.mock.calls.some(([message]) => String(message).includes('<Select.Root value>'))).toBe(true);
  });

  it('shows a value written from outside without calling onValueChange', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Example value="Cake" onValueChange={onValueChange} />);
    rerender(<Example value="Steak" onValueChange={onValueChange} />);
    expect(valueText()).toBe('Steak');
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
