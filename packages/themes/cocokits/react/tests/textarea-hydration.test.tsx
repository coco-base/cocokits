// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FieldError } from '@cocokits/react/field-error';
import { Prefix } from '@cocokits/react/prefix';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { FormField, Textarea } from '../src/index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function App(): ReactElement {
  return (
    <StrictMode>
      <ThemeProvider themeConfig={cocokitsThemeConfig}>
        <FormField prefix={<Prefix>P</Prefix>} error={<FieldError>Enter a message.</FieldError>}>
          <Textarea aria-label="Message" autoResize />
        </FormField>
        <Textarea aria-label="Plain" />
      </ThemeProvider>
    </StrictMode>
  );
}

describe('theme Textarea hydration', () => {
  it('hydrates the server markup without a mismatch and keeps data-auto-resize', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<App />);
    const serverHtml = container.innerHTML;

    render(<App />, { container, hydrate: true });

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
    expect(container.querySelectorAll('[data-auto-resize]')).toHaveLength(1);
    expect(container.querySelector('.cck-field-error')?.matches(':empty')).toBe(true);
  });
});
