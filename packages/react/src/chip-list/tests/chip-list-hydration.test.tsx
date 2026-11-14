// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { ChipList } from '../index';

const cases: readonly [string, ReactElement][] = [
  ['empty', <ChipList aria-label="Toppings" />],
  ['with chips and a name', <ChipList aria-label="Toppings" name="t" defaultValue={['Pizza', 'Salad']} />],
  ['required and empty', <ChipList aria-label="Toppings" name="t" required />],
  ['duplicates from the parent', <ChipList aria-label="Toppings" value={['A', 'A']} />],
  ['disabled', <ChipList aria-label="Toppings" defaultValue={['A']} disabled />],
  [
    'in a field',
    <FormField id="f" label={<Label>Toppings</Label>}>
      <ChipList defaultValue={['Pizza']} />
    </FormField>,
  ],
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ChipList hydration', () => {
  it.each(cases)('hydrates the server HTML without a mismatch: %s', (_name, ui) => {
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = renderToString(<StrictMode>{ui}</StrictMode>);
    // The field root shows the facts of its control after mount, so the list is compared on its own.
    const list = (): string | undefined => host.querySelector('.cck-chip-list')?.outerHTML;
    const before = list();
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<StrictMode>{ui}</StrictMode>, { container: host, hydrate: true });
    expect(error.mock.calls).toEqual([]);
    expect(list()).toBe(before);
    expect(before).toBeDefined();
  });
});
