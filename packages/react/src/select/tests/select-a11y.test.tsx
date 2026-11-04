// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { Select } from '../index';
import { Example, stubTopLayer, Dishes, Opt } from './fixtures';

/** The open list sits outside any landmark, because a component test has no page around it. */
const WITHOUT_REGION = { rules: { region: { enabled: false } } };

beforeEach(() => {
  stubTopLayer();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Select accessibility', () => {
  it('is a select-only combobox: a named button with the listbox popup, owning a listbox of options', async () => {
    const user = userEvent.setup();
    render(
      <Dishes defaultValue="Cake">
        <Select.Group>
          <Select.Label>Desserts</Select.Label>
          <Opt value="Cake">Cake</Opt>
        </Select.Group>
        <Opt value="Pizza" disabled>
          Pizza
        </Opt>
      </Dishes>,
    );
    const trigger = screen.getByRole('combobox', { name: 'Dish' });
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await user.click(trigger);
    const list = await screen.findByRole('listbox', { name: 'Dish' });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(list.id);
    const cake = screen.getByRole('option', { name: 'Cake' });
    expect(trigger.getAttribute('aria-activedescendant')).toBe(cake.id);
    expect(cake.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('option', { name: 'Pizza' }).getAttribute('aria-selected')).toBe('false');
    expect(screen.getByRole('option', { name: 'Pizza' }).getAttribute('aria-disabled')).toBe('true');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(trigger.hasAttribute('aria-controls')).toBe(false);
    });
  });

  it('has no axe violations closed, open, multiple, and inside a FormField', async () => {
    const user = userEvent.setup();
    render(
      <main>
        <FormField label={<Label>Dish</Label>}>
          <Dishes label={null} multiple placeholder="Choose" name="dish" required>
            <Select.Group>
              <Select.Label>Desserts</Select.Label>
              <Opt value="Cake">Cake</Opt>
            </Select.Group>
            <Opt value="Pizza">Pizza</Opt>
          </Dishes>
        </FormField>
      </main>,
    );
    expect((await axe(document.body)).violations).toEqual([]);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}');
    expect((await axe(document.body, WITHOUT_REGION)).violations).toEqual([]);
    await user.keyboard(' ');
    expect((await axe(document.body, WITHOUT_REGION)).violations).toEqual([]);
  });

  it('names the open list by the Label of the FormField, and an aria-label of the Select wins', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <main>
        <FormField label={<Label>Dish</Label>}>
          <Dishes label={null} placeholder="Choose">
            <Opt value="Cake">Cake</Opt>
          </Dishes>
        </FormField>
      </main>,
    );
    await user.click(screen.getByRole('combobox'));
    const list = await screen.findByRole('listbox', { name: 'Dish' });
    const label = document.querySelector('label');
    expect(label?.id).not.toBe('');
    expect(list.getAttribute('aria-labelledby')).toBe(label?.id);
    expect((await axe(document.body, WITHOUT_REGION)).violations).toEqual([]);
    unmount();

    render(
      <main>
        <FormField label={<Label>Dish</Label>}>
          <Dishes label="Meal" placeholder="Choose">
            <Opt value="Cake">Cake</Opt>
          </Dishes>
        </FormField>
      </main>,
    );
    await user.click(screen.getByRole('combobox'));
    const named = await screen.findByRole('listbox', { name: 'Meal' });
    expect(named.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('names the open list by the Label id an author gave, and by the generated one without', async () => {
    const user = userEvent.setup();
    render(
      <main>
        <FormField id="dish" label={<Label id="mine">Dish</Label>}>
          <Dishes label={null} placeholder="Choose">
            <Opt value="Cake">Cake</Opt>
          </Dishes>
        </FormField>
      </main>,
    );
    await user.click(screen.getByRole('combobox'));
    const list = await screen.findByRole('listbox', { name: 'Dish' });
    expect(document.querySelector('label')?.id).toBe('mine');
    expect(list.getAttribute('aria-labelledby')).toBe('mine');
    expect((await axe(document.body, WITHOUT_REGION)).violations).toEqual([]);
  });

  it('warns in development about an option that holds a focusable element', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(
      <Dishes>
        <Opt value="Cake">
          <a href="#x">Cake</a>
        </Opt>
      </Dishes>,
    );
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await waitFor(() => {
      expect(warn.mock.calls.some(([message]) => String(message).includes('focusable'))).toBe(true);
    });
  });

  it('warns in development about a Select with no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Dishes label={null}>
        <Opt value="Cake">Cake</Opt>
      </Dishes>,
    );
    await waitFor(() => {
      expect(warn.mock.calls.some(([message]) => String(message).includes('accessible name'))).toBe(true);
    });
  });

  it('does not warn about a name when the Select is labelled', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Example />);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(warn).not.toHaveBeenCalled();
  });
});
