// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Input } from '@cocokits/react/input';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { FormField } from '../src/index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function App(): ReactElement {
  return (
    <StrictMode>
      <ThemeProvider themeConfig={cocokitsThemeConfig}>
        <FormField size="lg">
          <Input aria-label="Email" />
        </FormField>
        <FormField>
          <Input aria-label="Email" />
        </FormField>
      </ThemeProvider>
    </StrictMode>
  );
}

describe('theme FormField hydration', () => {
  it('hydrates the server markup without a mismatch and keeps data-size on both parts', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<App />);
    const serverHtml = container.innerHTML;

    render(<App />, { container, hydrate: true });

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
    expect([...container.querySelectorAll('[data-size]')].map((el) => el.getAttribute('data-size'))).toEqual([
      'lg',
      'lg',
      'md',
      'md',
    ]);
  });
});
