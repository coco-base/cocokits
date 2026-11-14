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

describe('RadioGroup server render', () => {
  it('renders the root facts, a shared generated name, the checked attribute and no tabindex', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Example defaultValue="pro" required orientation="vertical" />);
    const root = container.querySelector('[role="radiogroup"]');
    expect(root?.className).toBe('cck-radio-group');
    expect(root?.getAttribute('aria-required')).toBe('true');
    expect(root?.getAttribute('aria-orientation')).toBe('vertical');
    expect(root?.hasAttribute('data-required')).toBe(true);
    const inputs = [...container.querySelectorAll('input')];
    expect(inputs).toHaveLength(3);
    const names = new Set(inputs.map((input) => input.getAttribute('name')));
    expect(names.size).toBe(1);
    expect([...names][0]).toBeTruthy();
    expect(inputs.map((input) => input.hasAttribute('checked'))).toEqual([false, true, false]);
    expect(inputs.every((input) => input.hasAttribute('required'))).toBe(true);
    expect(inputs.some((input) => input.hasAttribute('tabindex'))).toBe(false);
  });

  it('uses the author name when given', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Example name="plan" />);
    const names = [...container.querySelectorAll('input')].map((input) => input.getAttribute('name'));
    expect(names).toEqual(['plan', 'plan', 'plan']);
  });
});

describe('RadioGroup hydration', () => {
  it('hydrates without a mismatch, keeps the name and the checked state, then sets the roving tab stop', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<Example defaultValue="pro" />);
    const serverNames = [...container.querySelectorAll('input')].map((input) => input.getAttribute('name'));
    render(<Example defaultValue="pro" />, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    const inputs = screen.getAllByRole<HTMLInputElement>('radio');
    expect(inputs.map((input) => input.getAttribute('name'))).toEqual(serverNames);
    expect(inputs.map((input) => input.checked)).toEqual([false, true, false]);
    expect(inputs.map((input) => input.tabIndex)).toEqual([-1, 0, -1]);

    await userEvent.click(screen.getByRole('radio', { name: 'Team' }));
    expect(inputs.map((input) => input.checked)).toEqual([false, false, true]);
    expect(inputs.map((input) => input.tabIndex)).toEqual([-1, -1, 0]);
  });

  it('hydrates a group without a value and puts the tab stop on the first radio', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<Example />);
    render(<Example />, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();
    expect(screen.getAllByRole<HTMLInputElement>('radio').map((input) => input.tabIndex)).toEqual([0, -1, -1]);
  });
});
