// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FieldError } from '../../field-error';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { Textarea } from '../index';
import { MessageField } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function App(): ReactElement {
  return (
    <StrictMode>
      <MessageField id="msg" />
      <FormField id="other" required label={<Label>Name</Label>} error={<FieldError>Required</FieldError>}>
        <Textarea defaultValue="x" invalid />
      </FormField>
    </StrictMode>
  );
}

const mount = (html: string): HTMLElement => {
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = html;
  return container;
};

describe('Textarea and the zones on hydration', () => {
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

  it('keeps an empty FieldError of an invalid untouched field empty after hydration', () => {
    const ui = (
      <FormField error={<FieldError data-testid="error">Required</FieldError>} label={<Label>Name</Label>}>
        <Textarea invalid />
      </FormField>
    );
    const container = mount(renderToString(ui));
    render(ui, { container, hydrate: true });
    expect(screen.getByTestId('error').textContent).toBe('');
    expect(screen.getByTestId('error').getAttribute('aria-live')).toBe('polite');
  });

  it('shows data-filled for text typed before hydration', () => {
    const ui = (
      <FormField data-testid="field" label={<Label>Name</Label>}>
        <Textarea />
      </FormField>
    );
    const container = mount(renderToString(ui));
    const area = container.querySelector('textarea');
    if (!area) throw new Error('No textarea.');
    area.value = 'typed early';

    render(ui, { container, hydrate: true });

    expect(screen.getByRole('textbox').hasAttribute('data-filled')).toBe(true);
    expect(screen.getByTestId('field').hasAttribute('data-filled')).toBe(true);
  });
});
