// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Example } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('TabNav hydration', () => {
  it('hydrates the server markup without a mismatch and leaves it unchanged except the indicator variables', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<Example active="activity" />);
    const serverHtml = container.innerHTML;
    render(<Example active="activity" />, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML.replace(/ style="[^"]*"/g, '')).toBe(serverHtml);
    expect(container.querySelector('.cck-tab-nav__indicator')?.getAttribute('style')).toContain('--active-tab-left');
    expect(screen.getByRole('link', { name: 'Activity' }).getAttribute('aria-current')).toBe('page');
  });
});
