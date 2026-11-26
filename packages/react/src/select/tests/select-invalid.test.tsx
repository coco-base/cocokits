// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dishes, must, nextTask, Opt, stubTopLayer, trigger } from './fixtures';

beforeEach(() => {
  stubTopLayer();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const rootOf = (): Element | null => trigger().parentElement;

function Form({ invalid }: { readonly invalid?: boolean }): React.ReactElement {
  return (
    <form>
      <Dishes name="dish" required invalid={invalid} triggerProps={{ 'aria-describedby': 'hint' }}>
        <Opt value="Cake">Cake</Opt>
        <Opt value="Pizza">Pizza</Opt>
      </Dishes>
      <p id="hint">Pick one</p>
    </form>
  );
}

/** The text the trigger's `aria-describedby` points at. */
const description = (): string =>
  (trigger().getAttribute('aria-describedby') ?? '')
    .split(' ')
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join('|');

async function submitEmpty(container: HTMLElement): Promise<void> {
  must(container.querySelector('form')).requestSubmit();
  await act(nextTask);
}

describe('Select invalid state after a blocked submit', () => {
  it('marks the trigger and the root invalid and describes the browser message', async () => {
    const { container } = render(<Form />);
    expect(trigger().hasAttribute('aria-invalid')).toBe(false);
    await submitEmpty(container);
    expect(document.activeElement).toBe(trigger());
    expect(trigger().getAttribute('aria-invalid')).toBe('true');
    expect(rootOf()?.hasAttribute('data-invalid')).toBe(true);
    const message = must(container.querySelector('input')).validationMessage;
    expect(description()).toBe(`Pick one|${message}`);
    expect(
      container.querySelector(`#${CSS.escape(must(trigger().getAttribute('aria-describedby')).split(' ')[1] ?? '')}`),
    ).not.toBeNull();
  });

  it('clears both on the next value change', async () => {
    const user = userEvent.setup();
    const { container } = render(<Form />);
    await submitEmpty(container);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    expect(trigger().hasAttribute('aria-invalid')).toBe(false);
    expect(rootOf()?.hasAttribute('data-invalid')).toBe(false);
    expect(trigger().getAttribute('aria-describedby')).toBe('hint');
  });

  it('clears both on a form reset', async () => {
    const { container } = render(<Form />);
    await submitEmpty(container);
    expect(trigger().getAttribute('aria-invalid')).toBe('true');
    must(container.querySelector('form')).reset();
    await act(nextTask);
    expect(trigger().hasAttribute('aria-invalid')).toBe(false);
    expect(rootOf()?.hasAttribute('data-invalid')).toBe(false);
    expect(trigger().getAttribute('aria-describedby')).toBe('hint');
  });

  it('keeps a consumer invalid prop when the flag clears', async () => {
    const user = userEvent.setup();
    const { container } = render(<Form invalid />);
    await submitEmpty(container);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    expect(rootOf()?.hasAttribute('data-invalid')).toBe(true);
    expect(trigger().getAttribute('aria-describedby')).toBe('hint');
  });
});

describe('Select touched, dirty and submitted from the owner', () => {
  const Owned = (facts: { touched?: boolean; dirty?: boolean; submitted?: boolean }): React.ReactElement => (
    <Dishes required invalid {...facts}>
      <Opt value="Cake">Cake</Opt>
    </Dishes>
  );

  it('shows the invalid state while a passed touched or submitted is true, and clears it when the owner resets', () => {
    const { rerender } = render(<Owned touched />);
    expect(trigger().getAttribute('aria-invalid')).toBe('true');
    expect(rootOf()?.hasAttribute('data-invalid')).toBe(true);
    rerender(<Owned touched={false} />);
    expect(trigger().hasAttribute('aria-invalid')).toBe(false);
    rerender(<Owned submitted />);
    expect(trigger().getAttribute('aria-invalid')).toBe('true');
    rerender(<Owned submitted={false} />);
    expect(trigger().hasAttribute('aria-invalid')).toBe(false);
  });

  it('lets a passed touched win over the blur of the trigger', async () => {
    const user = userEvent.setup();
    render(<Owned touched={false} />);
    trigger().focus();
    await user.tab();
    expect(trigger().hasAttribute('aria-invalid')).toBe(false);
  });
});
