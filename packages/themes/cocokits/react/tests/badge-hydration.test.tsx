// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Badge } from '../src/index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function App(): ReactElement {
  return (
    <StrictMode>
      <ThemeProvider themeConfig={cocokitsThemeConfig}>
        <Badge content="120" max={99} color="danger" size="lg" />
        <Badge />
      </ThemeProvider>
    </StrictMode>
  );
}

describe('theme Badge hydration', () => {
  it('hydrates the server markup without a mismatch', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<App />);
    const serverHtml = container.innerHTML;

    render(<App />, { container, hydrate: true });

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
    expect(container.querySelector('span')?.getAttribute('data-size')).toBe('lg');
  });
});
