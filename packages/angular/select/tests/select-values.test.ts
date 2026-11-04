import { Component, signal, viewChild } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { selectAnatomy } from '@cocokits/machines/select';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CCK_SELECT_CONFIG,
  CckSelect,
  CckSelectImports,
  type CckSelectChange,
  type CckSelectConfig,
  type CckSelectOptionRef,
} from '../index';
import { stubOverlayApis } from './overlay-stubs';

const { classes } = selectAnatomy;
const trigger = (): HTMLElement => screen.getByRole('combobox');
const shown = (): string => trigger().querySelector(`.${classes.value}`)?.textContent.trim() ?? '';
const gone = (): Promise<void> =>
  waitFor(() => {
    expect(screen.queryByRole('listbox')).toBeNull();
  });

describe('Select value and labels', () => {
  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('a single Select', () => {
    @Component({
      imports: [...CckSelectImports],
      template: `<div
        cckSelect
        aria-label="Dish"
        placeholder="Choose"
        [(value)]="value"
        (selectionChange)="changes.push($event)"
      >
        <div cckSelectOption [value]="null">None</div>
        <div cckSelectOption value="cake">Cake</div>
        <div cckSelectOption value="pizza"><span aria-hidden="true">*</span> Pizza</div>
      </div>`,
    })
    class Single {
      readonly value = signal<string | null | undefined>(undefined);
      readonly changes: CckSelectChange[] = [];
    }

    it('reads undefined while unbound, writes the first choice, and shows the trimmed option text', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(Single);
      const host = fixture.componentInstance;
      expect(host.value()).toBeUndefined();
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Cake' }));
      await gone();
      expect(host.value()).toBe('cake');
      // The label is the option text, not the value.
      expect(shown()).toBe('Cake');
      expect(host.changes).toHaveLength(1);
      expect(host.changes[0]).toMatchObject({ value: 'cake', reason: 'user' });
      expect(host.changes[0]?.source).toBeInstanceOf(CckSelect);
      expect(host.changes[0]?.event).toBeInstanceOf(Event);
    });

    it('clears to null with an option whose value is null and shows the placeholder', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(Single);
      const host = fixture.componentInstance;
      host.value.set('pizza');
      await fixture.whenStable();
      expect(shown()).toBe('* Pizza');
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'None' }));
      await gone();
      expect(host.value()).toBeNull();
      expect(host.changes).toMatchObject([{ value: null, reason: 'user' }]);
      expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose');
      expect(trigger().closest(`.${classes.root}`)?.hasAttribute('data-placeholder-shown')).toBe(true);
    });

    it('shows String(value) for a value no option matches', async () => {
      const { fixture } = await render(Single);
      fixture.componentInstance.value.set('soup');
      await fixture.whenStable();
      expect(shown()).toBe('soup');
    });

    it('keeps the text of an option up to date', async () => {
      const text = signal('Cake');
      const { fixture } = await render(
        `<div cckSelect aria-label="Dish" value="cake"><div cckSelectOption value="cake">{{ text() }}</div></div>`,
        { imports: [...CckSelectImports], componentProperties: { text } },
      );
      expect(shown()).toBe('Cake');
      text.set('Gateau');
      await fixture.whenStable();
      await waitFor(() => {
        expect(shown()).toBe('Gateau');
      });
    });
  });

  describe('canSelectNullableOptions', () => {
    const template = (attribute: string): string => `<div cckSelect aria-label="Dish" placeholder="Choose" ${attribute}
      [(value)]="value">
        <div cckSelectOption [value]="null">Nothing</div>
        <div cckSelectOption value="cake">Cake</div>
      </div>`;

    it('selects a null option like any other and shows its label', async () => {
      const user = userEvent.setup();
      const value = signal<string | null | undefined>('cake');
      await render(template('canSelectNullableOptions'), {
        imports: [...CckSelectImports],
        componentProperties: { value },
      });
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Nothing' }));
      await gone();
      expect(value()).toBeNull();
      expect(shown()).toBe('Nothing');
      expect(trigger().closest(`.${classes.root}`)?.hasAttribute('data-placeholder-shown')).toBe(false);
    });

    it('takes the default from CCK_SELECT_CONFIG', async () => {
      const config: CckSelectConfig = { canSelectNullableOptions: true };
      const value = signal<string | null | undefined>(null);
      await render(template(''), {
        imports: [...CckSelectImports],
        providers: [{ provide: CCK_SELECT_CONFIG, useValue: config }],
        componentProperties: { value },
      });
      expect(shown()).toBe('Nothing');
    });

    it('lets the input turn the config default off', async () => {
      const value = signal<string | null | undefined>(null);
      await render(template('[canSelectNullableOptions]="false"'), {
        imports: [...CckSelectImports],
        providers: [{ provide: CCK_SELECT_CONFIG, useValue: { canSelectNullableOptions: true } }],
        componentProperties: { value },
      });
      expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose');
    });
  });

  describe('compareWith', () => {
    interface Dish {
      readonly id: number;
      readonly name: string;
    }

    it('selects the option that is equal, and the string comes from itemToStringValue', async () => {
      const user = userEvent.setup();
      const dishes: readonly Dish[] = [
        { id: 1, name: 'Cake' },
        { id: 2, name: 'Pizza' },
      ];
      const value = signal<Dish | null | undefined>({ id: 2, name: 'copy' });
      const { container } = await render(
        `<div cckSelect aria-label="Dish" name="dish" [(value)]="value" [compareWith]="same" [itemToStringValue]="id">
          @for (dish of dishes; track dish.id) { <div cckSelectOption [value]="dish">{{ dish.name }}</div> }
        </div>`,
        {
          imports: [...CckSelectImports],
          componentProperties: {
            dishes,
            value,
            same: (a: Dish, b: Dish) => a.id === b.id,
            id: (dish: Dish) => String(dish.id),
          },
        },
      );
      expect(shown()).toBe('Pizza');
      expect(container.querySelector<HTMLInputElement>('input[name="dish"]')?.value).toBe('2');
      await user.click(trigger());
      expect((await screen.findByRole('option', { name: 'Pizza' })).getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('a multiple Select', () => {
    @Component({
      imports: [...CckSelectImports],
      template: `<div cckSelect multiple aria-label="Dish" [(value)]="value" [sortComparator]="comparator()">
        <div cckSelectOption value="a">Apple</div>
        <div cckSelectOption value="b">Banana</div>
        <div cckSelectOption value="c">Cherry</div>
      </div>`,
    })
    class Multiple {
      readonly select = viewChild.required(CckSelect);
      readonly value = signal<readonly string[] | null | undefined>(undefined);
      readonly comparator = signal<((a: CckSelectOptionRef, b: CckSelectOptionRef) => number) | undefined>(undefined);
    }

    it('works with the bare multiple attribute, keeps option order and joins the labels', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(Multiple);
      const host = fixture.componentInstance;
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Cherry' }));
      await user.click(screen.getByRole('option', { name: 'Apple' }));
      expect(host.value()).toEqual(['a', 'c']);
      expect(shown()).toBe('Apple, Cherry');
    });

    it('orders by sortComparator when one is given', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(Multiple);
      const host = fixture.componentInstance;
      // Reverse option order.
      host.comparator.set((a, b) => (b.value() as string).localeCompare(a.value() as string));
      await fixture.whenStable();
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Apple' }));
      await user.click(screen.getByRole('option', { name: 'Cherry' }));
      expect(host.value()).toEqual(['c', 'a']);
      expect(shown()).toBe('Cherry, Apple');
    });
  });

  describe('custom trigger', () => {
    it('gives the template the selected values', async () => {
      await render(
        `<div cckSelect aria-label="Dish" placeholder="Choose" value="cake">
          <ng-template cckSelectTrigger let-selected="selected">{{ selected.length }} chosen: {{ selected[0] }}</ng-template>
          <div cckSelectOption value="cake">Cake</div>
        </div>`,
        { imports: [...CckSelectImports] },
      );
      expect(shown()).toBe('1 chosen: cake');
    });
  });
});
