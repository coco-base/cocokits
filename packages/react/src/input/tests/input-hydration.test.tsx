// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { Input } from '../index';
import { EmailField } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function App(): ReactElement {
  return (
    <StrictMode>
      <EmailField id="email" />
      <FormField id="other" required label={<Label>Name</Label>}>
        <Input defaultValue="x" />
      </FormField>
    </StrictMode>
  );
}

const mount = (html: string): HTMLElement => {
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = html;
  return container;
};

describe('Input hydration', () => {
  it('hydrates the server markup without a mismatch, a warning or a change of the ids', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = mount(renderToString(<App />));
    const ids = [...container.querySelectorAll('[id], [for]')].map(
      (el) => `${el.id}|${String(el.getAttribute('for'))}`,
    );

    render(<App />, { container, hydrate: true });

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(
      [...container.querySelectorAll('[id], [for]')].map((el) => `${el.id}|${String(el.getAttribute('for'))}`),
    ).toEqual(ids);
  });

  it('shows data-filled on the Input and the field root for text set before hydration', () => {
    const ui = (
      <FormField data-testid="field" label={<Label>Name</Label>}>
        <Input />
      </FormField>
    );
    const container = mount(renderToString(ui));
    const input = container.querySelector('input');
    if (!input) throw new Error('No input.');
    // Typed (or restored by the browser) before the JavaScript arrived.
    input.value = 'typed early';

    render(ui, { container, hydrate: true });

    expect(screen.getByRole<HTMLInputElement>('textbox').value).toBe('typed early');
    expect(screen.getByRole('textbox').hasAttribute('data-filled')).toBe(true);
    expect(screen.getByTestId('field').hasAttribute('data-filled')).toBe(true);
  });

  it('adds the control-only facts to the field root after hydration', () => {
    const ui = (
      <FormField data-testid="field" label={<Label>Name</Label>}>
        <Input required />
      </FormField>
    );
    const container = mount(renderToString(ui));
    expect(container.querySelector('[data-testid="field"]')?.hasAttribute('data-required')).toBe(false);

    render(ui, { container, hydrate: true });

    expect(screen.getByTestId('field').hasAttribute('data-required')).toBe(true);
    expect(screen.getByText('*')).toBeTruthy();
  });
});
