import { Component, Directive, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckDir } from '@cocokits/angular-core';
import { CckDialogImports } from '@cocokits/angular/dialog';
import { CckPopoverImports } from '@cocokits/angular/popover';
import { selectAnatomy } from '@cocokits/machines/select';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelectImports, type CckSelectChange } from '../index';
import { gone, must, trigger } from './helpers';
import { stubOverlayApis } from './overlay-stubs';

const imports = [...CckSelectImports, ...CckPopoverImports, ...CckDialogImports, CckDir];
const { classes } = selectAnatomy;

describe('Select features', () => {
  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('option groups', () => {
    it('groups options under a text label and a markup label, named by the label', async () => {
      const user = userEvent.setup();
      await render(
        `<div cckSelect aria-label="Dish">
          <div cckSelectOptionGroup label="Desserts">
            <div cckSelectOption value="Cake">Cake</div>
          </div>
          <div cckSelectOptionGroup>
            <ng-template cckSelectOptionGroupLabel><b data-testid="mark">Mains</b> (hot)</ng-template>
            <div cckSelectOption value="Pizza">Pizza</div>
          </div>
        </div>`,
        { imports },
      );
      await user.click(trigger());
      const groups = await screen.findAllByRole('group');
      expect(groups.map((group) => group.className)).toEqual([classes.optionGroup, classes.optionGroup]);
      expect(screen.getByRole('group', { name: 'Desserts' })).toBeTruthy();
      expect(screen.getByRole('group', { name: 'Mains (hot)' })).toBeTruthy();
      expect(screen.getByTestId('mark').closest(`.${classes.optionGroupLabel}`)).not.toBeNull();
      expect(
        screen.getByRole('group', { name: 'Desserts' }).contains(screen.getByRole('option', { name: 'Cake' })),
      ).toBe(true);
    });

    it('disables the options of a disabled group', async () => {
      const user = userEvent.setup();
      const value = signal<string | undefined>(undefined);
      await render(
        `<div cckSelect aria-label="Dish" [(value)]="value">
          <div cckSelectOptionGroup label="Sold out" disabled>
            <div cckSelectOption value="Cake">Cake</div>
          </div>
          <div cckSelectOption value="Pizza">Pizza</div>
        </div>`,
        { imports, componentProperties: { value } },
      );
      await user.click(trigger());
      const group = await screen.findByRole('group', { name: 'Sold out' });
      expect(group.getAttribute('aria-disabled')).toBe('true');
      expect(group.hasAttribute('data-disabled')).toBe(true);
      expect(screen.getByRole('option', { name: 'Cake' }).getAttribute('aria-disabled')).toBe('true');
      expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Pizza' }).id);
      await user.click(screen.getByRole('option', { name: 'Cake' }));
      expect(value()).toBeUndefined();
    });
  });

  describe('the clearing option', () => {
    it('sets the empty string on a value of "" and shows the placeholder again, with the user reason', async () => {
      const user = userEvent.setup();
      const value = signal<string | undefined>('Cake');
      const changes: CckSelectChange[] = [];
      await render(
        `<div cckSelect aria-label="Dish" placeholder="Choose" [(value)]="value" (selectionChange)="changes.push($event)">
          <div cckSelectOption value="">None</div>
          <div cckSelectOption value="Cake">Cake</div>
        </div>`,
        { imports, componentProperties: { value, changes } },
      );
      expect(trigger().querySelector(`.${classes.value}`)?.textContent.trim()).toBe('Cake');
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'None' }));
      await gone();
      expect(value()).toBe('');
      expect(changes).toMatchObject([{ value: '', reason: 'user' }]);
      expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose');
      expect(trigger().closest(`.${classes.root}`)?.hasAttribute('data-placeholder-shown')).toBe(true);
    });
  });

  describe('object values (generic T)', () => {
    interface Dish {
      readonly id: number;
      readonly name: string;
    }

    @Component({
      imports,
      template: `<div
        cckSelect
        aria-label="Dish"
        name="dish"
        [(value)]="value"
        [itemToStringValue]="toText"
        [compareWith]="same"
        (selectionChange)="changes.push($event)"
      >
        @for (dish of dishes; track dish.id) {
          <div cckSelectOption [value]="dish">{{ dish.name }}</div>
        }
      </div>`,
    })
    class ObjectHost {
      readonly dishes: readonly Dish[] = [
        { id: 1, name: 'Cake' },
        { id: 2, name: 'Pizza' },
      ];
      readonly value = signal<Dish | null | undefined>({ id: 2, name: 'Pizza (copy)' });
      readonly changes: CckSelectChange<Dish>[] = [];
      readonly toText = (dish: Dish): string => dish.name;
      readonly same = (a: Dish, b: Dish): boolean => a.id === b.id;
    }

    it('selects by compareWith, shows the option text and submits itemToStringValue', async () => {
      const user = userEvent.setup();
      const { fixture, container } = await render(ObjectHost, { imports });
      // The trigger shows the text of the option that equals the value, the form carries the value's own string.
      expect(trigger().querySelector(`.${classes.value}`)?.textContent.trim()).toBe('Pizza');
      expect(must(container.querySelector<HTMLInputElement>('input[name="dish"]')).value).toBe('Pizza (copy)');
      await user.click(trigger());
      expect((await screen.findByRole('option', { name: 'Pizza' })).getAttribute('aria-selected')).toBe('true');
      await user.click(screen.getByRole('option', { name: 'Cake' }));
      await gone();
      expect(fixture.componentInstance.value()).toEqual({ id: 1, name: 'Cake' });
      expect(fixture.componentInstance.changes).toMatchObject([{ value: { id: 1 }, reason: 'user' }]);
      expect(must(container.querySelector<HTMLInputElement>('input[name="dish"]')).value).toBe('Cake');
    });

    it('matches typeahead against the text of the option, and String(value) when it has none', async () => {
      const user = userEvent.setup();
      await render(
        `<div cckSelect aria-label="Dish">
          <div cckSelectOption value="Cake"><svg aria-hidden="true"></svg></div>
          <div cckSelectOption value="Pizza"><svg aria-hidden="true"></svg></div>
          <div cckSelectOption value="Soup"><span aria-hidden="true">x</span> Soup</div>
        </div>`,
        { imports },
      );
      await user.tab();
      await user.keyboard('p');
      const options = await screen.findAllByRole('option');
      expect(trigger().getAttribute('aria-activedescendant')).toBe(options[1]?.id);
    });
  });

  describe('custom trigger', () => {
    it('renders the cckSelectTrigger template with the selected values while something is selected', async () => {
      const user = userEvent.setup();
      await render(
        `<div cckSelect multiple aria-label="Dish" placeholder="Choose" [value]="['Cake', 'Pizza']">
          <ng-template cckSelectTrigger let-selected="selected">{{ selected.length }} selected</ng-template>
          <div cckSelectOption value="Cake">Cake</div>
          <div cckSelectOption value="Pizza">Pizza</div>
          <div cckSelectOption value="Steak">Steak</div>
        </div>`,
        { imports },
      );
      expect(trigger().querySelector(`.${classes.value}`)?.textContent.trim()).toBe('2 selected');
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Steak' }));
      expect(trigger().querySelector(`.${classes.value}`)?.textContent.trim()).toBe('3 selected');
    });

    it('shows the placeholder, not the slot, while nothing is selected', async () => {
      await render(
        `<div cckSelect aria-label="Dish" placeholder="Choose">
          <ng-template cckSelectTrigger let-selected="selected">{{ selected.length }}</ng-template>
          <div cckSelectOption value="Cake">Cake</div>
        </div>`,
        { imports },
      );
      expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose');
      expect(trigger().querySelector(`.${classes.value}`)).toBeNull();
    });
  });

  describe('value model', () => {
    it('works unbound, with a one-way start value, and two-way', async () => {
      const user = userEvent.setup();
      await render(
        `<div cckSelect aria-label="Dish" value="Burger"><div cckSelectOption value="Burger">Burger</div><div cckSelectOption value="Cake">Cake</div></div>`,
        {
          imports,
        },
      );
      expect(trigger().querySelector(`.${classes.value}`)?.textContent.trim()).toBe('Burger');
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Cake' }));
      await gone();
      expect(trigger().querySelector(`.${classes.value}`)?.textContent.trim()).toBe('Cake');
    });

    it('shows a value written from outside without emitting selectionChange', async () => {
      const value = signal<string | undefined>(undefined);
      const changes: CckSelectChange[] = [];
      const { fixture } = await render(
        `<div cckSelect aria-label="Dish" [(value)]="value" (selectionChange)="changes.push($event)"><div cckSelectOption value="Cake">Cake</div></div>`,
        { imports, componentProperties: { value, changes } },
      );
      value.set('Cake');
      await fixture.whenStable();
      expect(trigger().querySelector(`.${classes.value}`)?.textContent.trim()).toBe('Cake');
      expect(changes).toEqual([]);
    });
  });

  describe('consumer veto', () => {
    @Directive({ selector: '[vetoClick]', host: { '(click)': 'veto($event)' } })
    class VetoClick {
      protected veto(event: Event): void {
        event.preventDefault();
      }
    }

    it('keeps the choice when a consumer click listener prevents the default, whatever the imports order', async () => {
      const user = userEvent.setup();
      const value = signal<string | undefined>(undefined);
      await render(
        `<div cckSelect aria-label="Dish" [(value)]="value">
          <div cckSelectOption value="Cake" vetoClick>Cake</div>
          <div cckSelectOption value="Pizza" (click)="$event.preventDefault()">Pizza</div>
          <div cckSelectOption value="Burger">Burger</div>
        </div>`,
        { imports: [...imports, VetoClick], componentProperties: { value } },
      );
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Cake' }));
      await user.click(screen.getByRole('option', { name: 'Pizza' }));
      expect(value()).toBeUndefined();
      expect(screen.getByRole('listbox')).toBeTruthy();
      await user.click(screen.getByRole('option', { name: 'Burger' }));
      expect(value()).toBe('Burger');
    });
  });

  describe('dynamic options', () => {
    @Component({
      imports,
      template: `<div cckSelect aria-label="Dish">
        @for (dish of dishes(); track dish) {
          <div cckSelectOption [value]="dish">{{ dish }}</div>
        }
      </div>`,
    })
    class DynamicHost {
      readonly dishes = signal(['Cake', 'Pizza', 'Steak']);
    }

    it('lists added, removed and reordered options in document order', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(DynamicHost, { imports });
      const host = fixture.componentInstance;
      await user.click(trigger());
      const names = (): string[] => screen.getAllByRole('option').map((option) => option.textContent.trim());
      expect(names()).toEqual(['Cake', 'Pizza', 'Steak']);
      host.dishes.set(['Steak', 'Cake', 'Burger', 'Pizza']);
      await fixture.whenStable();
      await user.keyboard('{Home}');
      expect(names()).toEqual(['Steak', 'Cake', 'Burger', 'Pizza']);
      expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Steak' }).id);
      await user.keyboard('{ArrowDown}');
      expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Cake' }).id);
      await user.keyboard('{End}');
      expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Pizza' }).id);
    });
  });

  describe('right to left', () => {
    it('flips start and end placement, and leaves the vertical keys alone', async () => {
      const user = userEvent.setup();
      await render(
        `<div cckDir dir="rtl"><div cckSelect aria-label="Dish" side="start">
          <div cckSelectOption value="Cake">Cake</div><div cckSelectOption value="Pizza">Pizza</div></div></div>`,
        { imports },
      );
      await user.tab();
      await user.keyboard('{ArrowDown}');
      const list = await screen.findByRole('listbox');
      await waitFor(() => {
        expect(list.getAttribute('data-side')).toBe('start');
      });
      await user.keyboard('{ArrowDown}');
      expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Pizza' }).id);
      await user.keyboard('{ArrowUp}');
      expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Cake' }).id);
    });
  });

  describe('nested overlays', () => {
    it('inside a Popover: Escape closes the listbox only, and a press in the listbox keeps the Popover open', async () => {
      const user = userEvent.setup();
      await render(
        `<ng-container cckPopover>
          <button cckPopoverTrigger>Settings</button>
          <ng-template cckPopoverPortal>
            <div cckPopoverContent aria-label="Settings panel">
              <div cckSelect aria-label="Dish">
                <div cckSelectOption value="Cake">Cake</div>
                <div cckSelectOption value="Pizza">Pizza</div>
              </div>
            </div>
          </ng-template>
        </ng-container>`,
        { imports },
      );
      await user.click(screen.getByRole('button', { name: 'Settings' }));
      await screen.findByRole('dialog', { name: 'Settings panel' });
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Pizza' }));
      await gone();
      expect(screen.getByRole('dialog', { name: 'Settings panel' })).toBeTruthy();
      await user.click(trigger());
      await screen.findByRole('listbox');
      await user.keyboard('{Escape}');
      await gone();
      expect(screen.getByRole('dialog', { name: 'Settings panel' })).toBeTruthy();
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Cake' }));
      await gone();
      expect(screen.getByRole('dialog', { name: 'Settings panel' })).toBeTruthy();
    });

    it('inside a modal Dialog: the list renders inside the dialog, Escape closes it only, a choice keeps the dialog open', async () => {
      const user = userEvent.setup();
      const value = signal<string | undefined>(undefined);
      await render(
        `<ng-container cckDialog>
          <button cckDialogTrigger>Order</button>
          <ng-template cckDialogPortal>
            <dialog cckDialogContent aria-label="Order">
              <div cckSelect aria-label="Dish" [(value)]="value">
                <div cckSelectOption value="Cake">Cake</div>
                <div cckSelectOption value="Pizza">Pizza</div>
              </div>
              <button cckDialogClose>Cancel</button>
            </dialog>
          </ng-template>
        </ng-container>`,
        { imports, componentProperties: { value } },
      );
      await user.click(screen.getByRole('button', { name: 'Order' }));
      const dialog = await waitFor(() => {
        const found = document.querySelector('dialog[open]');
        if (!found) throw new Error('The dialog is not open yet.');
        return found;
      });
      await user.click(trigger());
      const list = await screen.findByRole('listbox');
      expect(dialog.contains(list)).toBe(true);
      await user.keyboard('{Escape}');
      await gone();
      expect(document.querySelector('dialog[open]')).toBe(dialog);
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Pizza' }));
      await gone();
      expect(value()).toBe('Pizza');
      expect(document.querySelector('dialog[open]')).toBe(dialog);
    });
  });
});
