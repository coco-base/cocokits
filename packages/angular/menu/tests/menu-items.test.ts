import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { menuAnatomy } from '@cocokits/machines/menu';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckMenuImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { trigger } from './queries';

const { classes } = menuAnatomy;

@Component({
  imports: [...CckMenuImports],
  template: `
    <button [cckMenuTriggerFor]="menu" (closed)="log.push('closed:' + $event.reason)">Actions</button>
    <ng-template #menu>
      <cck-menu-content>
        <cck-menu-checkbox-item
          [(checked)]="hidden"
          (checkedChangeDetails)="log.push('hidden:' + String($event.value) + ':' + $event.reason)"
        >
          <cck-menu-item-indicator>x</cck-menu-item-indicator>
          Show hidden
        </cck-menu-checkbox-item>
        <cck-menu-radio-group [(value)]="sort" (valueChangeDetails)="log.push('sort:' + $event.value)">
          <cck-menu-group-label>Sort by</cck-menu-group-label>
          <cck-menu-radio-item value="name"
            ><cck-menu-item-indicator>x</cck-menu-item-indicator>Name</cck-menu-radio-item
          >
          <cck-menu-radio-item value="date"
            ><cck-menu-item-indicator>x</cck-menu-item-indicator>Date</cck-menu-radio-item
          >
        </cck-menu-radio-group>
        <cck-menu-group>
          <cck-menu-group-label>Edit</cck-menu-group-label>
          <cck-menu-item>
            <cck-menu-item-leading>L</cck-menu-item-leading>
            Rename
            <cck-menu-item-supporting-text>Changes the name</cck-menu-item-supporting-text>
            <cck-menu-item-shortcut>F2</cck-menu-item-shortcut>
            <cck-menu-item-trailing>T</cck-menu-item-trailing>
          </cck-menu-item>
        </cck-menu-group>
      </cck-menu-content>
    </ng-template>
  `,
})
class Host {
  readonly hidden = signal(false);
  readonly sort = signal<string | null>('name');
  readonly log: string[] = [];
  protected readonly String = String;
}

const openMenu = async (user = userEvent.setup()): Promise<ReturnType<typeof userEvent.setup>> => {
  await user.click(trigger());
  const menu = await screen.findByRole('menu');
  // The menu moves focus to its first item a frame after it opens; a test that focuses an item must come later.
  await waitFor(() => {
    expect(menu.contains(document.activeElement)).toBe(true);
  });
  return user;
};
const menuOpen = (): boolean => screen.queryByRole('menu') !== null;

describe('Menu checkbox and radio items', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the roles, aria-checked, the state and the indicator', async () => {
    await render(Host);
    await openMenu();
    const checkbox = screen.getByRole('menuitemcheckbox', { name: /Show hidden/ });
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    expect(checkbox.getAttribute('data-state')).toBe('unchecked');
    expect(checkbox.classList.contains(classes.checkboxItem)).toBe(true);
    expect(screen.getByRole('menuitemradio', { name: /Name/ }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('menuitemradio', { name: /Date/ }).getAttribute('aria-checked')).toBe('false');
    expect(checkbox.querySelector(`.${classes.itemIndicator}`)?.getAttribute('aria-hidden')).toBe('true');
    expect(checkbox.querySelector(`.${classes.itemIndicator}`)?.getAttribute('data-state')).toBe('unchecked');
    expect(checkbox.hasAttribute('checked')).toBe(false);
  });

  const presses = [
    {
      name: 'a click',
      act: (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('menuitemcheckbox')),
      closes: true,
    },
    { name: 'Enter', act: (user: ReturnType<typeof userEvent.setup>) => user.keyboard('{Enter}'), closes: true },
    { name: 'Space', act: (user: ReturnType<typeof userEvent.setup>) => user.keyboard(' '), closes: false },
  ];
  it.each(presses)('$name toggles the checkbox item once and reports it', async ({ act, closes }) => {
    const { fixture } = await render(Host);
    const user = await openMenu();
    screen.getByRole('menuitemcheckbox').focus();
    await act(user);
    expect(fixture.componentInstance.hidden()).toBe(true);
    expect(fixture.componentInstance.log.filter((entry) => entry.startsWith('hidden:'))).toEqual(['hidden:true:user']);
    await waitFor(() => {
      expect(menuOpen()).toBe(!closes);
    });
  });

  it('sets the value of the radio group on a press, and not again while it is checked', async () => {
    const { fixture } = await render(Host);
    const user = await openMenu();
    screen.getByRole('menuitemradio', { name: /Date/ }).focus();
    await user.keyboard(' ');
    expect(fixture.componentInstance.sort()).toBe('date');
    expect(screen.getByRole('menuitemradio', { name: /Date/ }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('menuitemradio', { name: /Name/ }).getAttribute('aria-checked')).toBe('false');
    await user.keyboard(' ');
    expect(fixture.componentInstance.log.filter((entry) => entry.startsWith('sort:'))).toEqual(['sort:date']);
  });

  it('names a group by its label, and describes an item by its supporting text', async () => {
    await render(Host);
    await openMenu();
    expect(screen.getByRole('group', { name: 'Sort by' }).classList.contains(classes.radioGroup)).toBe(true);
    expect(screen.getByRole('group', { name: 'Edit' }).classList.contains(classes.group)).toBe(true);
    const rename = screen.getByRole('menuitem', { name: /Rename/ });
    expect(rename.getAttribute('aria-describedby')).toBe(
      document.querySelector(`.${classes.itemSupportingText}`)?.id ?? null,
    );
    expect(rename.hasAttribute('aria-describedby')).toBe(true);
  });

  it('marks the leading and trailing content decorative and renders the shortcut text', async () => {
    await render(Host);
    await openMenu();
    expect(document.querySelector(`.${classes.itemLeading}`)?.getAttribute('aria-hidden')).toBe('true');
    expect(document.querySelector(`.${classes.itemTrailing}`)?.getAttribute('aria-hidden')).toBe('true');
    expect(document.querySelector(`.${classes.itemShortcut}`)?.textContent).toBe('F2');
  });
});
