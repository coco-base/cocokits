// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen, waitFor } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { Label } from '../../label';
import { Leading } from '../../leading';
import { item, mountView, selectRoot, settle, stubOverlayBrowser } from './fixtures';

beforeEach(() => {
  stubOverlayBrowser();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const holdsOne = (warn: { readonly mock: { readonly calls: unknown[][] } }): boolean =>
  warn.mock.calls.some(([message]) => String(message).includes('holds one control'));

describe('A Select in a zone of a FormField', () => {
  it('lines the list of a Select in a Leading up with its own trigger', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const user = userEvent.setup();
    const { container } = mountView(() =>
      h(FormField, null, {
        label: () => h(Label, null, () => 'Amount'),
        leading: () =>
          h(Leading, null, () => selectRoot({ 'aria-label': 'Currency' }, { items: () => [item('EUR'), item('USD')] })),
        default: () => h(Input),
      }),
    );
    await settle();
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
