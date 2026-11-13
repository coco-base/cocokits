// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Accordion } from '../../accordion';
import { Checkbox } from '../../checkbox';
import { Select } from '../../select';
import { withPartIcons } from './part-icon-fixtures';

/** Name, element and whether the server HTML holds an icon. */
const cases: readonly [string, ReactElement, boolean][] = [
  [
    'Accordion',
    <Accordion.Root type="single" collapsible defaultValue="a">
      <Accordion.Item value="a">
        <Accordion.Header>
          <Accordion.Trigger>Shipping</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Orders leave in two days.</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>,
    true,
  ],
  [
    'Accordion with render',
    <Accordion.Root type="single" collapsible>
      <Accordion.Item value="a">
        <Accordion.Header>
          <Accordion.Trigger render={(props) => <button {...props} />}>Shipping</Accordion.Trigger>
        </Accordion.Header>
      </Accordion.Item>
    </Accordion.Root>,
    true,
  ],
  [
    'Select',
    <Select.Root defaultValue="Cake">
      <Select.Trigger aria-label="Dish">
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
    </Select.Root>,
    true,
  ],
  ['Checkbox checked', <Checkbox defaultChecked>Accept</Checkbox>, true],
  [
    'Checkbox mixed',
    <Checkbox defaultChecked indeterminate>
      Accept
    </Checkbox>,
    false,
  ],
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('part icons hydration', () => {
  it.each(cases)('hydrates the server HTML without a mismatch: %s', (_name, ui, hasIcon) => {
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = renderToString(withPartIcons(ui));
    const before = host.innerHTML;
    expect(before.includes('cck-svg-icon')).toBe(hasIcon);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(withPartIcons(ui), { container: host, hydrate: true });
    // A hydration mismatch logs through console.error; the development message of an unknown icon is no mismatch.
    expect(error.mock.calls.filter(([message]) => !String(message).startsWith('CocoKits:'))).toEqual([]);
    expect(host.innerHTML).toBe(before);
  });
});
