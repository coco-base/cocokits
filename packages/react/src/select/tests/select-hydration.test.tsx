// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dishes, Example, Opt, stubTopLayer } from './fixtures';

beforeEach(() => {
  stubTopLayer();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function hydrate(props: Parameters<typeof Example>[0]): { container: HTMLElement; serverHtml: string } {
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = renderToString(<Example {...props} />);
  const serverHtml = container.innerHTML;
  render(<Example {...props} />, { container, hydrate: true });
  return { container, serverHtml };
}

describe('Select hydration', () => {
  it('hydrates a closed Select without a mismatch, and a click opens it', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container, serverHtml } = hydrate({ name: 'dish', defaultValue: 'Burger' });
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
    await userEvent.click(screen.getByRole('combobox'));
    expect((await screen.findByRole('listbox')).getAttribute('data-state')).toBe('open');
    expect(screen.getByRole('combobox').getAttribute('data-state')).toBe('open');
  });

  it('hydrates an open-by-default Select without a mismatch and mounts the list after hydration', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = hydrate({ defaultOpen: true });
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    const list = await screen.findByRole('listbox');
    expect(container.contains(list)).toBe(false);
    await waitFor(() => {
      expect(screen.getByRole('combobox').getAttribute('aria-controls')).toBe(list.id);
    });
  });

  it('hydrates a Select whose label comes from items without a mismatch', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const ui = (
      <Dishes defaultValue="pizza" items={[{ value: 'pizza', label: 'Pizza' }]}>
        <Opt value="pizza">Pizza</Opt>
      </Dishes>
    );
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(ui);
    const serverHtml = container.innerHTML;
    render(ui, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
    expect(container.querySelector('.cck-select__value')?.textContent).toBe('Pizza');
  });
});
