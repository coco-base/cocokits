// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SvgIcon } from '../../svg-icon';
import { strictThemed } from '../../internal/tests/icon-fixtures';
import { IconButton } from '../index';

const cases: readonly [string, ReactElement][] = [
  [
    'button',
    <IconButton aria-label="Add">
      <SvgIcon iconName="star" />
    </IconButton>,
  ],
  ['disabled button', <IconButton aria-label="Add" disabled />],
  ['disabled link', <IconButton aria-label="Go" nativeButton={false} disabled render={<a href="#go" />} />],
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('IconButton hydration', () => {
  it.each(cases)('hydrates the server HTML without a mismatch: %s', (_name, ui) => {
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = renderToString(strictThemed(ui));
    const before = host.innerHTML;
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(strictThemed(ui), { container: host, hydrate: true });
    // A hydration mismatch logs through console.error; the development message of an unknown icon is no mismatch.
    expect(error.mock.calls.filter(([message]) => !String(message).startsWith('CocoKits:'))).toEqual([]);
    expect(host.innerHTML).toBe(before);
  });
});
