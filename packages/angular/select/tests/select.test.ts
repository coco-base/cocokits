import { Component, signal, viewChild } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { selectAnatomy } from '@cocokits/machines/select';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelect, CckSelectImports, type CckSelectChange, type SelectOpenChangeDetails } from '../index';
import { must, trigger } from './helpers';
import { stubOverlayApis } from './overlay-stubs';

const { classes } = selectAnatomy;

const DISHES = `
  <div cckSelect aria-label="Dish" placeholder="Choose a dish" [(value)]="value"
    [multiple]="multiple()" [disabled]="disabled()" [readonly]="readonly()" [closePredicate]="record"
    (selectionChange)="changes.push($event)" (openedChange)="openChanges.push($event)"
    (opened)="events.push('opened')" (closed)="events.push('closed')">
    <div cckSelectOption value="Cake">Cake</div>
    <div cckSelectOption value="Pizza" disabled>Pizza</div>
    <div cckSelectOption value="Burger">Burger</div>
    <div cckSelectOption value="Steak">Steak</div>
  </div>
  <button id="after">After</button>
  <p id="empty">Empty</p>`;

@Component({ imports: [...CckSelectImports], template: DISHES })
class Host {
  readonly value = signal<string | readonly string[] | null | undefined>(undefined);
  readonly select = viewChild.required(CckSelect);
  readonly multiple = signal(false);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly changes: CckSelectChange<string | readonly string[]>[] = [];
  readonly openChanges: boolean[] = [];
  readonly events: string[] = [];
  /** The details `closePredicate` was asked with: one per close the user caused. */
  readonly closes: SelectOpenChangeDetails[] = [];
  readonly record = (details: SelectOpenChangeDetails): boolean => {
    this.closes.push(details);
    return true;
  };
}

const listbox = (): HTMLElement => screen.getByRole('listbox');
const optionNames = (): string[] => screen.getAllByRole('option').map((option) => option.textContent.trim());
const frame = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });

async function renderHost(): Promise<{
  host: Host;
  fixture: { whenStable: () => Promise<unknown> };
  user: ReturnType<typeof userEvent.setup>;
}> {
  const { fixture } = await render(Host);
  return { host: fixture.componentInstance, fixture, user: userEvent.setup() };
}

describe('Select', () => {
  let scrollIntoView: ReturnType<typeof stubOverlayApis>;
  beforeEach(() => {
    scrollIntoView = stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendered contract', () => {
    it('renders the root, trigger, placeholder and icon with the anatomy classes and no list while closed', async () => {
      await renderHost();
      const root = trigger().closest(`.${classes.root}`);
      expect(root).not.toBeNull();
      expect(root?.getAttribute('data-state')).toBe('closed');
      expect(root?.hasAttribute('data-placeholder-shown')).toBe(true);
      expect(trigger().className).toBe(classes.trigger);
      expect(trigger().getAttribute('aria-haspopup')).toBe('listbox');
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
      expect(trigger().getAttribute('aria-controls')).toBeNull();
      expect(trigger().getAttribute('aria-label')).toBe('Dish');
      expect(trigger().getAttribute('type')).toBe('button');
      expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose a dish');
      expect(trigger().querySelector(`.${classes.dropdownIcon}`)?.getAttribute('aria-hidden')).toBe('true');
      expect(root?.hasAttribute('aria-label')).toBe(false);
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('renders the listbox and options in the overlay container, not next to the trigger', async () => {
      const { user } = await renderHost();
      await user.click(trigger());
      const list = await screen.findByRole('listbox');
      expect(list.className).toBe(classes.content);
      expect(list.closest(`.${classes.root}`)).toBeNull();
      expect(list.getAttribute('data-state')).toBe('open');
      expect(list.getAttribute('data-side')).toBe('bottom');
      expect(list.getAttribute('data-align')).toBe('start');
      expect(list.getAttribute('aria-label')).toBe('Dish');
      expect(trigger().getAttribute('aria-controls')).toBe(list.id);
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
      expect(optionNames()).toEqual(['Cake', 'Pizza', 'Burger', 'Steak']);
      const option = screen.getByRole('option', { name: 'Cake' });
      expect(option.className).toBe(classes.option);
      expect(option.querySelector(`.${classes.optionIndicator}`)?.getAttribute('aria-hidden')).toBe('true');
      expect(option.querySelector(`.${classes.optionContent}`)?.textContent).toBe('Cake');
      expect(screen.getByRole('option', { name: 'Pizza' }).getAttribute('aria-disabled')).toBe('true');
      expect(screen.getByRole('option', { name: 'Pizza' }).hasAttribute('data-disabled')).toBe(true);
    });

    it('marks multiple on the root and the list', async () => {
      const { host, user, fixture } = await renderHost();
      host.multiple.set(true);
      await fixture.whenStable();
      await user.click(trigger());
      expect(listbox().getAttribute('aria-multiselectable')).toBe('true');
      expect(listbox().hasAttribute('data-multiple')).toBe(true);
      expect(trigger().closest(`.${classes.root}`)?.hasAttribute('data-multiple')).toBe(true);
    });

    it('leaves the trigger focusable, and never moves DOM focus into the list', async () => {
      const { user } = await renderHost();
      await user.tab();
      expect(document.activeElement).toBe(trigger());
      await user.keyboard('{ArrowDown}');
      await screen.findByRole('listbox');
      expect(document.activeElement).toBe(trigger());
    });
  });

  describe('opening', () => {
    it('opens on click with the first enabled option highlighted and opens', async () => {
      const { host, user } = await renderHost();
      await user.click(trigger());
      await screen.findByRole('listbox');
      const cake = screen.getByRole('option', { name: 'Cake' });
      expect(trigger().getAttribute('aria-activedescendant')).toBe(cake.id);
      expect(cake.hasAttribute('data-highlighted')).toBe(true);
      expect(host.openChanges).toEqual([true]);
      expect(host.select().panelOpen).toBe(true);
    });

    it.each([['{ArrowDown}'], ['{Alt>}{ArrowDown}{/Alt}'], ['{Enter}'], [' ']])('opens with %s', async (keys) => {
      const { user } = await renderHost();
      await user.tab();
      await user.keyboard(keys);
      expect(await screen.findByRole('listbox')).toBeTruthy();
    });

    it('opens on the selected option', async () => {
      const { host, user, fixture } = await renderHost();
      host.value.set('Steak');
      await fixture.whenStable();
      await user.click(trigger());
      await screen.findByRole('listbox');
      expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Steak' }).id);
    });

    it('ArrowUp opens on the first option; End opens on the last; Home on the first', async () => {
      const { user, fixture } = await renderHost();
      await user.tab();
      await user.keyboard('{End}');
      await screen.findByRole('listbox');
      expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Steak' }).id);
      await user.keyboard('{Escape}');
      await fixture.whenStable();
      await user.keyboard('{ArrowUp}');
      await screen.findByRole('listbox');
      expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Cake' }).id);
    });

    it('never opens while disabled or read-only; read-only stays focusable and says so', async () => {
      const { host, user, fixture } = await renderHost();
      host.readonly.set(true);
      await fixture.whenStable();
      await user.tab();
      expect(document.activeElement).toBe(trigger());
      expect(trigger().getAttribute('aria-readonly')).toBe('true');
      await user.keyboard('{ArrowDown}');
      await user.click(trigger());
      expect(screen.queryByRole('listbox')).toBeNull();
      host.readonly.set(false);
      host.disabled.set(true);
      await fixture.whenStable();
      expect(trigger().disabled).toBe(true);
      expect(trigger().closest(`.${classes.root}`)?.hasAttribute('data-disabled')).toBe(true);
      await user.click(trigger());
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('opens, closes and toggles from the methods, and tells openedChange, opened and closed each time', async () => {
      const { host, fixture } = await renderHost();
      const select = host.select();
      expect(select.panelOpen).toBe(false);
      select.open();
      await fixture.whenStable();
      expect(await screen.findByRole('listbox')).toBeTruthy();
      expect(select.panelOpen).toBe(true);
      select.close();
      await fixture.whenStable();
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeNull();
      });
      select.toggle();
      await fixture.whenStable();
      expect(await screen.findByRole('listbox')).toBeTruthy();
      select.toggle();
      await fixture.whenStable();
      expect(host.openChanges).toEqual([true, false, true, false]);
      expect(host.events).toEqual(['opened', 'closed', 'opened', 'closed']);
      // The app's own calls are not checked.
      expect(host.closes).toEqual([]);
    });

    it('never opens from open() while disabled', async () => {
      const { host, fixture } = await renderHost();
      host.disabled.set(true);
      await fixture.whenStable();
      host.select().open();
      await fixture.whenStable();
      expect(host.select().panelOpen).toBe(false);
      expect(host.openChanges).toEqual([]);
    });
  });

  describe('keyboard', () => {
    it('moves with the arrows, stops at the ends, skips the disabled option, and Home/End jump', async () => {
      const { user } = await renderHost();
      await user.tab();
      await user.keyboard('{ArrowDown}');
      await screen.findByRole('listbox');
      const active = (): string =>
        document.getElementById(trigger().getAttribute('aria-activedescendant') ?? '')?.textContent.trim() ?? '';
      expect(active()).toBe('Cake');
      await user.keyboard('{ArrowDown}');
      expect(active()).toBe('Burger');
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
      expect(active()).toBe('Steak');
      await user.keyboard('{ArrowUp}');
      expect(active()).toBe('Burger');
      await user.keyboard('{Home}');
      expect(active()).toBe('Cake');
      await user.keyboard('{End}');
      expect(active()).toBe('Steak');
      await user.keyboard('{PageUp}');
      expect(active()).toBe('Cake');
      await user.keyboard('{PageDown}');
      expect(active()).toBe('Steak');
    });

    it('finds an option by typing, and a new buffer starts after a pause', async () => {
      const { user } = await renderHost();
      await user.tab();
      await user.keyboard('s');
      await screen.findByRole('listbox');
      expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Steak' }).id);
      await new Promise((resolve) => setTimeout(resolve, 600)); // the type-ahead buffer empties after a pause
      await user.keyboard('b');
      expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Burger' }).id);
    });

    it('chooses with Enter and Space, closes a single Select and keeps the focus on the trigger', async () => {
      const { host, user } = await renderHost();
      await user.tab();
      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeNull();
      });
      expect(host.value()).toBe('Burger');
      expect(document.activeElement).toBe(trigger());
      expect(trigger().querySelector(`.${classes.value}`)?.textContent.trim()).toBe('Burger');
      expect(host.changes).toMatchObject([{ value: 'Burger', reason: 'user' }]);
      expect(host.closes.at(-1)).toMatchObject({ reason: 'select' });
      await user.keyboard('{ArrowDown}{ArrowDown} ');
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeNull();
      });
      expect(host.value()).toBe('Steak');
    });

    it('chooses and closes with Alt+ArrowUp', async () => {
      const { host, user } = await renderHost();
      await user.tab();
      await user.keyboard('{ArrowDown}{ArrowDown}{Alt>}{ArrowUp}{/Alt}');
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeNull();
      });
      expect(host.value()).toBe('Burger');
    });

    it('closes with Escape and changes nothing', async () => {
      const { host, user } = await renderHost();
      await user.tab();
      await user.keyboard('{ArrowDown}{ArrowDown}');
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeNull();
      });
      expect(host.value()).toBeUndefined();
      expect(host.closes.at(-1)).toMatchObject({ reason: 'escape' });
      expect(document.activeElement).toBe(trigger());
    });

    it('chooses the highlighted option on Tab and lets the focus move on', async () => {
      const { host, user } = await renderHost();
      await user.tab();
      await user.keyboard('{ArrowDown}{ArrowDown}');
      await user.tab();
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeNull();
      });
      expect(host.value()).toBe('Burger');
      expect(document.activeElement).toBe(document.getElementById('after'));
    });

    it('scrolls the highlighted option into view at the nearest edge on a keyboard move, not on a pointer move', async () => {
      const { user } = await renderHost();
      await user.tab();
      await user.keyboard('{ArrowDown}');
      await screen.findByRole('listbox');
      await frame();
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
      scrollIntoView.mockClear();
      await user.keyboard('{ArrowDown}');
      await frame();
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      scrollIntoView.mockClear();
      await user.hover(screen.getByRole('option', { name: 'Steak' }));
      await frame();
      expect(scrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe('pointer', () => {
    it('highlights under the pointer, and a press in the list keeps the focus on the trigger', async () => {
      const { user } = await renderHost();
      await user.click(trigger());
      await screen.findByRole('listbox');
      await user.hover(screen.getByRole('option', { name: 'Steak' }));
      expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Steak' }).id);
      await user.hover(screen.getByRole('option', { name: 'Pizza' }));
      expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Steak' }).id);
      await user.pointer({ keys: '[MouseLeft>]', target: screen.getByRole('option', { name: 'Steak' }) });
      expect(document.activeElement).toBe(trigger());
    });

    it('chooses on click, marks it selected and closes', async () => {
      const { host, user } = await renderHost();
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Burger' }));
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeNull();
      });
      expect(host.value()).toBe('Burger');
      expect(host.changes).toMatchObject([{ value: 'Burger', reason: 'user' }]);
      await user.click(trigger());
      const burger = await screen.findByRole('option', { name: 'Burger' });
      expect(burger.getAttribute('aria-selected')).toBe('true');
      expect(burger.hasAttribute('data-selected')).toBe(true);
      expect(screen.getByRole('option', { name: 'Cake' }).getAttribute('aria-selected')).toBe('false');
    });

    it('does not choose a disabled option', async () => {
      const { host, user } = await renderHost();
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Pizza' }));
      expect(host.value()).toBeUndefined();
      expect(screen.getByRole('listbox')).toBeTruthy();
    });

    it('closes on an outside press with the outside-press reason, and not on a press inside the list', async () => {
      const { host, user } = await renderHost();
      await user.click(trigger());
      await screen.findByRole('listbox');
      await user.click(must(document.getElementById('empty')));
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeNull();
      });
      expect(host.closes.at(-1)).toMatchObject({ reason: 'outside-press' });
    });

    it('closes when the trigger is clicked again', async () => {
      const { host, user } = await renderHost();
      await user.click(trigger());
      await screen.findByRole('listbox');
      await user.click(trigger());
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeNull();
      });
      expect(host.closes.at(-1)).toMatchObject({ reason: 'trigger' });
    });
  });

  describe('multiple', () => {
    it('toggles values, stays open, and shows the values joined with a comma', async () => {
      const { host, user, fixture } = await renderHost();
      host.multiple.set(true);
      await fixture.whenStable();
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Cake' }));
      await user.click(screen.getByRole('option', { name: 'Steak' }));
      expect(host.value()).toEqual(['Cake', 'Steak']);
      expect(screen.getByRole('listbox')).toBeTruthy();
      expect(screen.getByRole('option', { name: 'Cake' }).getAttribute('aria-selected')).toBe('true');
      expect(trigger().querySelector(`.${classes.value}`)?.textContent.trim()).toBe('Cake, Steak');
      await user.click(screen.getByRole('option', { name: 'Cake' }));
      expect(host.value()).toEqual(['Steak']);
      expect(host.changes.map((change) => change.reason)).toEqual(['user', 'user', 'user']);
    });
  });
});
