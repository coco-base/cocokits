// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { BadgeContainer } from '../../badge-container';
import { Badge } from '../index';
import { testThemeConfig } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function App(): ReactElement {
  return (
    <StrictMode>
      <ThemeProvider themeConfig={testThemeConfig}>
        <BadgeContainer position="top-left">
          <button type="button">Inbox</button>
          <Badge content={120} max={99} />
          <Badge />
          <Badge content={3} hide />
        </BadgeContainer>
        <Badge content="New" />
      </ThemeProvider>
    </StrictMode>
  );
}

describe('Badge hydration', () => {
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
