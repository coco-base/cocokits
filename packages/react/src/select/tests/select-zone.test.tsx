// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { Label } from '../../label';
import { Leading } from '../../leading';
import { Dishes, Opt, stubTopLayer } from './fixtures';

beforeEach(() => {
  stubTopLayer();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const holdsOne = (warn: { readonly mock: { readonly calls: unknown[][] } }): boolean =>
  warn.mock.calls.some(([message]) => String(message).includes('holds one control'));

describe('A Select in a zone of a FormField', () => {
  it('lines the list of a Select in a Leading up with its own trigger', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const user = userEvent.setup();
    const { container } = render(
      <FormField
        label={<Label>Amount</Label>}
        leading={
          <Leading>
            <Dishes label="Currency">
              <Opt value="EUR">EUR</Opt>
              <Opt value="USD">USD</Opt>
            </Dishes>
          </Leading>
        }
      >
        <Input />
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: 'Amount' });
    expect(container.querySelector('label')?.htmlFor).toBe(input.id);
    expect(holdsOne(warn)).toBe(false);
    const trigger = screen.getByRole('combobox', { name: 'Currency' });
    trigger.getBoundingClientRect = () => new DOMRect(0, 0, 60, 40);
    const wrapper = container.querySelector<HTMLElement>('.cck-form-field__input-wrapper');
    if (wrapper) wrapper.getBoundingClientRect = () => new DOMRect(60, 0, 300, 40);
    await user.click(trigger);
    const list = await screen.findByRole('listbox');
    await waitFor(() => {
      expect(list.style.getPropertyValue('--anchor-width')).toBe('60px');
    });
  });
});
