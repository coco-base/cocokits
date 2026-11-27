// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { Button } from '../index';
import { testThemeConfig } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.location.hash = '';
});

function App({ onClick }: { onClick: () => void }): ReactElement {
  return (
    <StrictMode>
      <ThemeProvider themeConfig={testThemeConfig}>
        <Button onClick={onClick}>Save</Button>
        <Button nativeButton={false} disabled onClick={onClick} render={<a href="#go" />}>
          Go
        </Button>
      </ThemeProvider>
    </StrictMode>
  );
}

describe('Button hydration', () => {
  it('hydrates the server markup without a mismatch, and the click and the guard work afterwards', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const onClick = vi.fn();
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<App onClick={onClick} />);
    const serverHtml = container.innerHTML;

    render(<App onClick={onClick} />, { container, hydrate: true });

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('link', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(window.location.hash).toBe('');
  });
});
