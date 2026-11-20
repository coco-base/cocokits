// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { active, item, mountView, must, record, selectRoot, settle, stubOverlayBrowser, trigger } from './fixtures';

beforeEach(() => {
  stubOverlayBrowser();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Select hidden input', () => {
  it('carries autocomplete off by default and the given autocomplete', () => {
    const plain = mountView(() => selectRoot({ name: 'dish' }));
    expect(must(plain.container.querySelector('input')).getAttribute('autocomplete')).toBe('off');
    plain.unmount();
    const named = mountView(() => selectRoot({ name: 'dish', autocomplete: 'country' }));
    expect(must(named.container.querySelector('input')).getAttribute('autocomplete')).toBe('country');
  });

  describe('autofill', () => {
    const food = [
      { value: 'cake', label: 'Cake' },
      { value: 'pizza', label: 'Pizza', disabled: true },
      { value: 'steak', label: 'Steak' },
    ];
    const upper = (value: string): string => value.toUpperCase();

    it('picks an item of the items data on a closed single Select, through itemToStringValue', async () => {
      const recorded = record();
      const { container } = mountView(() =>
        selectRoot({ name: 'dish', items: food, itemToStringValue: upper, ...recorded.props }),
      );
      const input = must(container.querySelector('input'));
      await fireEvent.input(input, { target: { value: 'STEAK' } });
      expect(recorded.values).toEqual(['steak']);
    });

    it('skips a disabled entry and restores the input', async () => {
      const recorded = record();
      const { container } = mountView(() =>
        selectRoot({ name: 'dish', items: food, modelValue: 'cake', itemToStringValue: upper, ...recorded.props }),
      );
      await fireEvent.input(must(container.querySelector('input')), { target: { value: 'PIZZA' } });
      await settle();
      expect(recorded.values).toEqual([]);
      expect(must(container.querySelector('input')).value).toBe('CAKE');
    });

    it('restores the input when a closed Select has no items data', async () => {
      const recorded = record();
      const { container } = mountView(() => selectRoot({ name: 'dish', modelValue: 'Cake', ...recorded.props }));
      await fireEvent.input(must(container.querySelector('input')), { target: { value: 'Steak' } });
      await settle();
      expect(recorded.values).toEqual([]);
      expect(must(container.querySelector('input')).value).toBe('Cake');
    });

    it('matches the mounted items while open and restores a write with no match', async () => {
      const user = userEvent.setup();
      const recorded = record();
      const { container } = mountView(() => selectRoot({ name: 'dish', modelValue: 'Cake', ...recorded.props }));
      await user.click(trigger());
      await screen.findByRole('listbox');
      await fireEvent.input(must(container.querySelector('input')), { target: { value: 'Nothing' } });
      await settle();
      expect(recorded.values).toEqual([]);
      expect(must(container.querySelector('input')).value).toBe('Cake');
      await fireEvent.input(must(container.querySelector('input')), { target: { value: 'Steak' } });
      expect(recorded.values).toEqual(['Steak']);
    });

    it('ignores the write of a multiple Select', async () => {
      const recorded = record();
      const { container } = mountView(() =>
        selectRoot({ name: 'dish', multiple: true, modelValue: ['Cake'], items: food, ...recorded.props }),
      );
      await fireEvent.input(must(container.querySelector('input')), { target: { value: 'steak' } });
      await settle();
      expect(recorded.values).toEqual([]);
      expect(must(container.querySelector('input')).value).toBe('Cake');
    });
  });
});

describe('Select item details', () => {
  it('uses the id of an item as the option id and the active descendant', async () => {
    const user = userEvent.setup();
    mountView(() => selectRoot({}, { items: () => [item('Cake', 'Cake', { id: 'cake-option' }), item('Pizza')] }));
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    expect(screen.getByRole('option', { name: 'Cake' }).id).toBe('cake-option');
    await waitFor(() => {
      expect(trigger().getAttribute('aria-activedescendant')).toBe('cake-option');
    });
  });

  it('matches the text value, ignoring case and accents, and not the text of other content', async () => {
    const user = userEvent.setup();
    mountView(() =>
      selectRoot(
        {},
        {
          items: () => [item('a', 'Alpha'), item('eclair', 'Éclair'), item('code', 'Code', { textValue: 'Zebra' })],
        },
      ),
    );
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('e');
    expect(active()).toBe('Éclair');
    await new Promise((resolve) => setTimeout(resolve, 600));
    await user.keyboard('z');
    expect(active()).toBe('Code');
    await new Promise((resolve) => setTimeout(resolve, 600));
    await user.keyboard('c');
    expect(active()).toBe('Code');
  });

  it('adds a space to a running search instead of choosing', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(() => selectRoot(recorded.props, { items: () => [item('Newark'), item('New York'), item('Boston')] }));
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('new y');
    expect(active()).toBe('New York');
    expect(recorded.values).toEqual([]);
    expect(screen.getByRole('listbox')).toBeTruthy();
  });
});

describe('Select trigger naming', () => {
  it('names the list like the trigger and merges aria-describedby', async () => {
    const user = userEvent.setup();
    mountView(() => selectRoot({}, { trigger: { 'aria-labelledby': 'lbl', 'aria-describedby': 'hint' } }));
    expect(trigger().getAttribute('aria-labelledby')).toBe('lbl');
    expect(trigger().getAttribute('aria-describedby')).toBe('hint');
    await user.click(trigger());
    const list = await screen.findByRole('listbox');
    expect(list.getAttribute('aria-labelledby')).toBe('lbl');
  });

  it('follows a changed aria-label', async () => {
    const user = userEvent.setup();
    const label = { value: 'Dish' };
    const view = mountView(() => selectRoot({}, { trigger: { 'aria-label': label.value } }));
    await user.click(trigger());
    expect((await screen.findByRole('listbox')).getAttribute('aria-label')).toBe('Dish');
    view.unmount();
  });
});

describe('Select multiple attribute', () => {
  it('reads a bare multiple attribute as true', () => {
    mountView(() => selectRoot({ multiple: '', modelValue: ['Cake'] }));
    expect(trigger().closest('.cck-select')?.hasAttribute('data-multiple')).toBe(true);
  });
});
