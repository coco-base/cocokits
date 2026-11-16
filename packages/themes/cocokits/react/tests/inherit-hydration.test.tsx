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

describe.each(inheritCases)('group inheritance hydration: $name', (c) => {
  it.each([
    { label: 'the parent value', parent: c.parent, own: undefined, expected: c.parent },
    { label: 'an own value over the parent', parent: c.parent, own: c.own, expected: c.own },
    { label: 'an own null', parent: c.parent, own: null, expected: null },
    { label: 'a null parent', parent: null, own: undefined, expected: null },
  ])('keeps $label unchanged after hydration', ({ parent, own, expected }) => {
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
