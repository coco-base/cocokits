// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../../checkbox';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { CheckboxGroup, type CheckboxGroupProps } from '../index';

const group = (props: CheckboxGroupProps): ReactElement => (
  <CheckboxGroup aria-label="Toppings" {...props}>
    <Checkbox value="a">A</Checkbox>
    <Checkbox value="b">B</Checkbox>
  </CheckboxGroup>
);

const cases: readonly [string, ReactElement][] = [
  ['plain', group({})],
  ['with a start list', group({ defaultValue: ['b'], name: 'n' })],
  ['disabled and horizontal', group({ disabled: true, orientation: 'horizontal' })],
  ['in a FormField', <FormField label={<Label>Toppings</Label>}>{group({ 'aria-label': undefined })}</FormField>],
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('CheckboxGroup hydration', () => {
  it.each(cases)('hydrates the server HTML without a mismatch: %s', (_name, ui) => {
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = renderToString(<StrictMode>{ui}</StrictMode>);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<StrictMode>{ui}</StrictMode>, { container: host, hydrate: true });
    expect(error.mock.calls).toEqual([]);
  });
});
