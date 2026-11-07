// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Example } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Accordion hydration', () => {
  it('hydrates the server markup without a mismatch and leaves it unchanged, then a click toggles', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<Example defaultValue="shipping" />);
    const serverHtml = container.innerHTML;
    render(<Example defaultValue="shipping" />, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
    // The first render writes no size variable.
    expect(container.innerHTML).not.toContain('--accordion-content');

    await userEvent.click(screen.getByRole('button', { name: 'Returns' }));
    expect(screen.getByRole('button', { name: 'Returns' }).getAttribute('data-state')).toBe('open');
    expect(screen.getByRole('button', { name: 'Shipping' }).getAttribute('data-state')).toBe('closed');
  });

  it('hydrates a multiple accordion with force-mounted content', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const ui = <Example type="multiple" defaultValue={['returns']} forceMountWarranty />;
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(ui);
    render(ui, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Warranty' }));
    expect(screen.getByRole('region', { name: 'Warranty' }).hasAttribute('hidden')).toBe(false);
  });
});
