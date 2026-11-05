import { expect } from 'vitest';
import { screen, waitFor } from '@testing-library/angular';

/** Returns the value, or fails the test when it is missing. */
export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected a value.');
  return value;
}

/** The select trigger. */
export const trigger = (): HTMLButtonElement => screen.getByRole('combobox');

/** Resolves once the list is out of the document. */
export const gone = (): Promise<void> =>
  waitFor(() => {
    expect(screen.queryByRole('listbox')).toBeNull();
  });

/** The text of the option the trigger points at with `aria-activedescendant`. */
export const activeName = (): string =>
  document.getElementById(trigger().getAttribute('aria-activedescendant') ?? '')?.textContent.trim() ?? '';

/** Resolves after `ms` milliseconds. */
export const nextTask = (ms = 10): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
