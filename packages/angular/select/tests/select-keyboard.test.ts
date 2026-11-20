import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelectImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { activeName } from './helpers';

@Component({
  imports: [...CckSelectImports],
  template: ` <cck-select aria-label="Dish" [multiple]="multiple()" [(value)]="value">
      <cck-select-option value="Salad">Salad</cck-select-option>
      <cck-select-option value="Steak">Steak</cck-select-option>
      <cck-select-option value="Cake">Cake</cck-select-option>
    </cck-select>
    <button id="after">After</button>`,
})
class Host {
  readonly value = signal<string | readonly string[] | null | undefined>(undefined);
  readonly multiple = signal(false);
}

describe('Select keyboard', () => {
  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('cycles through the options that share a first letter when the character repeats', async () => {
    const { fixture } = await render(Host);
    const user = userEvent.setup();
    expect(fixture.componentInstance.value()).toBeUndefined();
    await user.tab();
    await user.keyboard('s');
    await screen.findByRole('listbox');
    expect(activeName()).toBe('Salad');
    await user.keyboard('s');
    expect(activeName()).toBe('Steak');
    await user.keyboard('s');
    expect(activeName()).toBe('Salad');
  });

  it('toggles a value with Enter and Space in a multiple Select and keeps the list open', async () => {
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    host.multiple.set(true);
    await fixture.whenStable();
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{Enter}');
    expect(host.value()).toEqual(['Salad']);
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.keyboard('{ArrowDown} ');
    expect(host.value()).toEqual(['Salad', 'Steak']);
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.keyboard('{Enter}');
    expect(host.value()).toEqual(['Salad']);
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('closes a multiple Select with Tab without changing the value, and the focus moves on', async () => {
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    host.multiple.set(true);
    await fixture.whenStable();
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.tab();
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });
    expect(host.value()).toBeUndefined();
    expect(document.activeElement).toBe(document.getElementById('after'));
  });
});
