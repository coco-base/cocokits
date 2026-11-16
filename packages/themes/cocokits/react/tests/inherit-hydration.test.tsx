// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { attrIn, dataAttrsIn, inheritCases } from './inherit-cases';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const app = (ui: ReactElement): ReactElement => (
  <StrictMode>
    <ThemeProvider themeConfig={cocokitsThemeConfig}>{ui}</ThemeProvider>
  </StrictMode>
);

describe.each(inheritCases.map((c) => [c.name, c] as const))('group inheritance hydration: %s', (_name, c) => {
  it.each([
    ['the parent value', c.parent, undefined, c.parent],
    ['an own value over the parent', c.parent, c.own, c.own],
    ['an own null', c.parent, null, null],
    ['a null parent', null, undefined, null],
  ])('keeps %s unchanged after hydration', (_label, parent, own, expected) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(app(c.ui(parent, own)));
    const serverHtml = container.innerHTML;
    expect(attrIn(serverHtml, c.root, c.attr)).toBe(expected);

    render(app(c.ui(parent, own)), { container, hydrate: true });

    expect(error).not.toHaveBeenCalled();
    expect(dataAttrsIn(container.innerHTML)).toEqual(dataAttrsIn(serverHtml));
    expect(attrIn(container.innerHTML, c.root, c.attr)).toBe(expected);
  });
});
