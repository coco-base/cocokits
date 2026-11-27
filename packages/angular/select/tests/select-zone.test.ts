import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckInputImports } from '@cocokits/angular/input';
import { CckLabelImports } from '@cocokits/angular/label';
import { CckLeadingImports } from '@cocokits/angular/leading';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelectImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const imports = [
  ...CckFormFieldImports,
  ...CckLabelImports,
  ...CckInputImports,
  ...CckLeadingImports,
  ...CckSelectImports,
];

const OPTIONS = `<cck-select-option value="EUR">EUR</cck-select-option><cck-select-option value="USD">USD</cck-select-option>`;
const holdsOne = (warn: { readonly mock: { readonly calls: unknown[][] } }): boolean =>
  warn.mock.calls.some(([message]) => String(message).includes('holds one control'));

beforeEach(() => {
  stubOverlayApis();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('A Select in a zone of a FormField', () => {
  it('lines the list of a Select in a Leading up with its own trigger', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const user = userEvent.setup();
    const { container } = await render(
      `<cck-form-field><label cckLabel>Amount</label><span cckLeading><cck-select aria-label="Currency">${OPTIONS}</cck-select></span><input cckInput /></cck-form-field>`,
      { imports },
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
