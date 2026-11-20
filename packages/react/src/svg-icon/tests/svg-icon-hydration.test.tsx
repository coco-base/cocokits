// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkIcon } from '@cocokits/icons';
import { SvgIcon } from '../index';
import { strictThemed, svgOf } from '../../internal/tests/icon-fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SvgIcon hydration', () => {
  it.each<[string, ReactElement]>([
    ['a registered icon', <SvgIcon iconName="heart" />],
    ['a labelled icon', <SvgIcon iconName="dots" label="Dots" />],
    ['an unknown name', <SvgIcon iconName="nope" />],
  ])('hydrates the server HTML without a mismatch: %s', (_label, ui) => {
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

describe('SvgIcon hydration of an svg string', () => {
  it('hydrates the empty server HTML without a mismatch and draws the string after mount', () => {
    const ui = <SvgIcon svg={svgOf(checkIcon)} />;
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = renderToString(strictThemed(ui));
    expect(host.querySelector('path')).toBeNull();
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(strictThemed(ui), { container: host, hydrate: true });
    expect(error.mock.calls.filter(([message]) => !String(message).startsWith('CocoKits:'))).toEqual([]);
    expect(host.querySelector('svg')?.getAttribute('viewBox')).toBe(checkIcon.viewBox);
    expect(host.querySelectorAll('path')).toHaveLength(1);
  });
});
