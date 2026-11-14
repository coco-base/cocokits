// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Radio } from '../../radio';
import { Checkbox } from '../index';
import { ChoiceApp } from './app-fixture';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const App = (): ReactElement => (
  <StrictMode>
    <ChoiceApp />
  </StrictMode>
);

const mount = (html: string): HTMLElement => {
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = html;
  return container;
};

describe('Checkbox, Switch and Radio on hydration', () => {
  it('hydrates the server markup without a mismatch or a warning, and keeps the ids and the state', () => {
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
    expect(container.querySelector<HTMLInputElement>('#mixed')?.indeterminate).toBe(true);
    expect(container.querySelector<HTMLInputElement>('#news-control')?.checked).toBe(true);
    expect(container.querySelector('.cck-checkbox[data-indeterminate]')).not.toBeNull();
  });

  it('shows data-checked for a state changed before hydration', () => {
    const ui = <Checkbox>Early</Checkbox>;
    const container = mount(renderToString(ui));
    const input = container.querySelector('input');
    if (!input) throw new Error('No input.');
    input.checked = true;

    render(ui, { container, hydrate: true });

    expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(true);
    expect(container.querySelector('.cck-checkbox')?.hasAttribute('data-checked')).toBe(true);
  });

  it('keeps a controlled state and a group that was server rendered', () => {
    const ui = (
      <>
        <Radio name="plan" checked>
          Free
        </Radio>
        <Radio name="plan" checked={false}>
          Pro
        </Radio>
      </>
    );
    const container = mount(renderToString(ui));
    render(ui, { container, hydrate: true });
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Free' }).checked).toBe(true);
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Pro' }).checked).toBe(false);
  });
});
