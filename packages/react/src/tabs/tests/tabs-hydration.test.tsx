// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tabs } from '../index';
import { Example } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Tabs hydration', () => {
  it('hydrates the server markup without a mismatch and leaves it unchanged, then a click selects', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<Example defaultValue="password" />);
    const serverHtml = container.innerHTML;
    render(<Example defaultValue="password" />, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    // Only the indicator variables are new: they are measured after mount.
    expect(container.innerHTML.replace(/ style="[^"]*"/g, '')).toBe(serverHtml);
    expect(container.querySelector('.cck-tabs__indicator')?.getAttribute('style')).toContain('--active-tab-left');

    await userEvent.click(screen.getByRole('tab', { name: 'Notifications' }));
    expect(screen.getByRole('tab', { name: 'Notifications' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: 'Password' }).getAttribute('aria-selected')).toBe('false');
  });

  it('hydrates a Tabs without a value, then selects the first enabled tab after mount', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<Example />);
    render(<Example />, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();
    expect(screen.getByRole('tab', { name: 'Account' }).getAttribute('aria-selected')).toBe('true');
  });

  it('hydrates Contents before the List and a forceMount panel without a mismatch', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const ui = (
      <StrictMode>
        <Tabs.Root defaultValue="b">
          <Tabs.Content value="a" forceMount>
            a body
          </Tabs.Content>
          <Tabs.Content value="b">b body</Tabs.Content>
          <Tabs.List aria-label="Tabs">
            <Tabs.Trigger value="a">A</Tabs.Trigger>
            <Tabs.Trigger value="b">B</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </StrictMode>
    );
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(ui);
    const serverHtml = container.innerHTML;
    render(ui, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
    const trigger = screen.getByRole('tab', { name: 'A' });
    const panel = container.querySelector('[role="tabpanel"]');
    expect(trigger.getAttribute('aria-controls')).toBe(panel?.id);
    expect(panel?.getAttribute('aria-labelledby')).toBe(trigger.id);
  });

  it('selects the first enabled tab after mount when the server output selected none', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const ui = (
      <Tabs.Root>
        <Tabs.Content value="a">A panel</Tabs.Content>
        <Tabs.List aria-label="Tabs">
          <Tabs.Trigger value="a">A</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
    );
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(ui);
    expect(container.querySelector('[role="tabpanel"]')?.hasAttribute('hidden')).toBe(true);
    render(ui, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();
    expect(screen.getByRole('tabpanel').hidden).toBe(false);
    expect(screen.getByRole('tab').getAttribute('aria-selected')).toBe('true');
  });
});
