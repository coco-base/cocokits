// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Chip } from '../index';

const cases: readonly [string, ReactElement][] = [
  ['plain', <Chip>Pizza</Chip>],
  ['removable', <Chip removable>Pizza</Chip>],
  [
    'disabled and removable',
    <Chip removable disabled id="x">
      Pizza
    </Chip>,
  ],
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Chip hydration', () => {
  it.each(cases)('hydrates the server HTML without a mismatch: %s', (_name, ui) => {
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = renderToString(<StrictMode>{ui}</StrictMode>);
    const before = host.innerHTML;
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<StrictMode>{ui}</StrictMode>, { container: host, hydrate: true });
    expect(error.mock.calls).toEqual([]);
    expect(host.innerHTML).toBe(before);
  });
});
