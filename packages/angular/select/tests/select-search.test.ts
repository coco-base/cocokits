import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { selectAnatomy } from '@cocokits/machines/select';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelectImports } from '../index';
import { gone } from './helpers';
import { stubOverlayApis } from './overlay-stubs';

const imports = [...CckSelectImports];
const { classes } = selectAnatomy;

@Component({
  imports,
  template: `
    <cck-select filter [multiple]="multiple()" [(value)]="value" aria-label="Dish" searchLabel="Find a dish">
      <cck-select-header><input cckSelectSearch /></cck-select-header>
      <cck-select-option-group label="Mains">
        <cck-select-option value="Pizza">Pizza</cck-select-option>
        <cck-select-option value="Pasta">Pasta</cck-select-option>
      </cck-select-option-group>
      <cck-select-option-group label="Desserts">
        <cck-select-option value="Cake">
          <cck-select-option-leading>L</cck-select-option-leading>
          Cake
          <cck-select-option-description>Sweet</cck-select-option-description>
        </cck-select-option>
      </cck-select-option-group>
      <cck-select-empty>No dish found</cck-select-empty>
      <cck-select-footer><button type="button" (click)="added.set(added() + 1)">Add a dish</button></cck-select-footer>
    </cck-select>
  `,
})
class Host {
  readonly multiple = signal(false);
  readonly value = signal<string | string[] | null | undefined>(undefined);
  readonly added = signal(0);
}

const trigger = (): HTMLButtonElement => screen.getByRole<HTMLButtonElement>('combobox', { name: 'Dish' });
const search = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('combobox', { name: 'Find a dish' });
const option = (name: string): HTMLElement => screen.getByRole('option', { name: new RegExp(name) });
const visibleOptions = (): string[] =>
  screen
    .getAllByRole('option', { hidden: true })
    .filter((element) => !element.hasAttribute('hidden'))
    .map((element) =>
      element.textContent
        .trim()
        .replace(/Sweet|L/g, '')
        .trim(),
    );

describe('Select filter', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the search with its role, name and the list controls while open, and moves the focus into it', async () => {
    const user = userEvent.setup();
    await render(Host);
    await user.click(trigger());
    await waitFor(() => {
      expect(document.activeElement).toBe(search());
    });
    expect(search().classList.contains(classes.search)).toBe(true);
    expect(search().getAttribute('aria-expanded')).toBe('true');
    expect(search().getAttribute('aria-controls')).toBe(screen.getByRole('listbox').id);
    expect(search().getAttribute('type')).toBe('search');
    expect(document.querySelector(`cck-select-header.${classes.header}`)).not.toBeNull();
    expect(trigger().hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('narrows the options as the user types, ignoring case, hides an empty group and shows the empty status', async () => {
    const user = userEvent.setup();
    await render(Host);
    await user.click(trigger());
    await waitFor(() => {
      expect(document.activeElement).toBe(search());
    });
    expect(visibleOptions()).toEqual(['Pizza', 'Pasta', 'Cake']);
    await user.keyboard('PA');
    expect(visibleOptions()).toEqual(['Pasta']);
    expect(screen.getByRole('group', { name: 'Mains' })).toBeTruthy();
    expect(screen.queryByRole('group', { name: 'Desserts' })).toBeNull();
    const empty = document.querySelector('cck-select-empty');
    expect(empty?.hasAttribute('hidden')).toBe(true);
    await user.keyboard('zz');
    expect(visibleOptions()).toEqual([]);
    expect(empty?.hasAttribute('hidden')).toBe(false);
    expect(empty?.getAttribute('role')).toBe('status');
    expect(empty?.textContent).toBe('No dish found');
    expect(screen.getByRole('listbox').hasAttribute('data-empty')).toBe(true);
  });

  it('moves the highlight with the arrows, chooses with Enter and returns the focus to the trigger', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    await user.click(trigger());
    await waitFor(() => {
      expect(document.activeElement).toBe(search());
    });
    await user.keyboard('p');
    await user.keyboard('{ArrowDown}');
    expect(search().getAttribute('aria-activedescendant')).toBe(option('Pasta').id);
    await user.keyboard('{Enter}');
    expect(fixture.componentInstance.value()).toBe('Pasta');
    await gone();
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
  });

  it('closes with Escape, returns the focus to the trigger and clears the query for the next open', async () => {
    const user = userEvent.setup();
    await render(Host);
    await user.click(trigger());
    await waitFor(() => {
      expect(document.activeElement).toBe(search());
    });
    await user.keyboard('cake');
    expect(visibleOptions()).toEqual(['Cake']);
    await user.keyboard('{Escape}');
    await gone();
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
    await user.click(trigger());
    await screen.findByRole('listbox');
    expect(visibleOptions()).toEqual(['Pizza', 'Pasta', 'Cake']);
    expect(search().value).toBe('');
  });

  it('describes an option by its description, marks the leading part decorative and counts them as parts', async () => {
    const user = userEvent.setup();
    await render(Host);
    await user.click(trigger());
    const cake = option('Cake');
    const description = cake.querySelector(`.${classes.optionDescription}`);
    expect(cake.getAttribute('aria-describedby')).toBe(description?.id);
    expect(cake.querySelector(`.${classes.optionLeading}`)?.getAttribute('aria-hidden')).toBe('true');
    expect(option('Pizza').hasAttribute('aria-describedby')).toBe(false);
  });

  it('keeps the list open on a press in the footer', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.click(screen.getByRole('button', { name: 'Add a dish' }));
    expect(fixture.componentInstance.added()).toBe(1);
    expect(screen.queryByRole('listbox')).not.toBeNull();
    expect(document.querySelector(`cck-select-footer.${classes.footer}`)).not.toBeNull();
  });

  it('shows the first label and +N for the others in a multiple select', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.multiple.set(true);
    fixture.componentInstance.value.set(['Pasta', 'Pizza', 'Cake']);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(trigger().querySelector(`.${classes.value}`)?.textContent.trim()).toBe('Pasta');
    expect(trigger().querySelector(`.${classes.count}`)?.textContent).toBe('+2');
    fixture.componentInstance.value.set(['Cake']);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(trigger().querySelector(`.${classes.count}`)).toBeNull();
  });
});
