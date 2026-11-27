// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { allPartsConfig, Field } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function App(): ReactElement {
  return (
    <StrictMode>
      <ThemeProvider themeConfig={allPartsConfig}>
        <Field />
        <Label htmlFor="x">Alone</Label>
        <Hint>Alone</Hint>
      </ThemeProvider>
    </StrictMode>
  );
}

describe('FormField, Label and Hint hydration', () => {
  it('hydrates the server markup without a mismatch and leaves it unchanged', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<App />);
    const serverHtml = container.innerHTML;

    render(<App />, { container, hydrate: true });

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
  });
});
