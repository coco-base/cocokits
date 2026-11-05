import { signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { selectAnatomy } from '@cocokits/machines/select';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CCK_SELECT_CONFIG, CckSelectImports, type CckSelectChange } from '../index';
import { activeName, gone, must, nextTask, trigger } from './helpers';
import { stubOverlayApis } from './overlay-stubs';

const { classes } = selectAnatomy;
const imports = [...CckSelectImports];

describe('Select parts', () => {
  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('separator', () => {
    it('renders a decorative line that keys skip', async () => {
      const user = userEvent.setup();
      await render(
        `<div cckSelect aria-label="Dish">
          <div cckSelectOption value="a">Apple</div>
          <div cckSelectSeparator></div>
          <div cckSelectOption value="b">Banana</div>
        </div>`,
        { imports },
      );
      await user.tab();
      await user.keyboard('{ArrowDown}');
      const list = await screen.findByRole('listbox');
      const separator = must(list.querySelector(`.${classes.separator}`));
      expect(separator.tagName).toBe('DIV');
      expect(separator.getAttribute('aria-hidden')).toBe('true');
      expect(separator.className).toBe(classes.separator);
      expect(activeName()).toBe('Apple');
      await user.keyboard('{ArrowDown}');
      expect(activeName()).toBe('Banana');
      expect(screen.getAllByRole('option')).toHaveLength(2);
    });
  });

  describe('option id', () => {
    it('is the id of the option element and the active descendant', async () => {
      const user = userEvent.setup();
      await render(
        `<div cckSelect aria-label="Dish">
          <div cckSelectOption value="a" id="apple">Apple</div>
          <div cckSelectOption value="b">Banana</div>
        </div>`,
        { imports },
      );
      await user.tab();
      await user.keyboard('{ArrowDown}');
      const apple = await screen.findByRole('option', { name: 'Apple' });
      expect(apple.id).toBe('apple');
      expect(trigger().getAttribute('aria-activedescendant')).toBe('apple');
      expect(screen.getByRole('option', { name: 'Banana' }).id).not.toBe('');
    });
  });

  describe('disabled options and groups', () => {
    it('are skipped by keys and typeahead and cannot be chosen', async () => {
      const user = userEvent.setup();
      const value = signal<string | null | undefined>(undefined);
      await render(
        `<div cckSelect aria-label="Dish" [(value)]="value">
          <div cckSelectOption value="a">Apple</div>
          <div cckSelectOption value="b" disabled>Banana</div>
          <div cckSelectOptionGroup label="Berries" disabled>
            <div cckSelectOption value="c">Cranberry</div>
          </div>
          <div cckSelectOption value="d">Date</div>
        </div>`,
        { imports, componentProperties: { value } },
      );
      await user.tab();
      await user.keyboard('{ArrowDown}');
      await screen.findByRole('listbox');
      await user.keyboard('{ArrowDown}');
      expect(activeName()).toBe('Date');
      await user.keyboard('b');
      expect(activeName()).toBe('Date');
      await nextTask(600);
      await user.keyboard('c');
      expect(activeName()).toBe('Date');
      await user.click(screen.getByRole('option', { name: 'Cranberry' }));
      await user.click(screen.getByRole('option', { name: 'Banana' }));
      expect(value()).toBeUndefined();
      expect(screen.getByRole('listbox')).toBeTruthy();
    });
  });

  describe('type to search', () => {
    const options = `<div cckSelectOption value="e1">Éclair</div>
      <div cckSelectOption value="n1">New York</div>
      <div cckSelectOption value="n2">Nice</div>
      <div cckSelectOption value="a">apple</div>`;

    it('ignores case and accents', async () => {
      const user = userEvent.setup();
      await render(`<div cckSelect aria-label="Dish">${options}</div>`, { imports });
      await user.tab();
      await user.keyboard('e');
      await screen.findByRole('listbox');
      expect(activeName()).toBe('Éclair');
      await nextTask(600);
      await user.keyboard('A');
      expect(activeName()).toBe('apple');
    });

    it('takes a space as part of a running search, closed or open, and does not choose', async () => {
      const user = userEvent.setup();
      const value = signal<string | null | undefined>(undefined);
      await render(`<div cckSelect aria-label="Dish" [(value)]="value">${options}</div>`, {
        imports,
        componentProperties: { value },
      });
      await user.tab();
      await user.keyboard('new y');
      await screen.findByRole('listbox');
      expect(activeName()).toBe('New York');
      expect(value()).toBeUndefined();
      await user.keyboard(' ');
      expect(screen.getByRole('listbox')).toBeTruthy();
      expect(value()).toBeUndefined();
    });

    it('opens on a space with no search running, and chooses with Space when open', async () => {
      const user = userEvent.setup();
      const value = signal<string | null | undefined>(undefined);
      await render(`<div cckSelect aria-label="Dish" [(value)]="value">${options}</div>`, {
        imports,
        componentProperties: { value },
      });
      await user.tab();
      await user.keyboard(' ');
      await screen.findByRole('listbox');
      await user.keyboard('{ArrowDown} ');
      await gone();
      expect(value()).toBe('n1');
    });

    it('ends the search after typeaheadDebounceInterval', async () => {
      const user = userEvent.setup();
      await render(`<div cckSelect aria-label="Dish" [typeaheadDebounceInterval]="30">${options}</div>`, { imports });
      await user.tab();
      await user.keyboard('n');
      await screen.findByRole('listbox');
      expect(activeName()).toBe('New York');
      await nextTask(80);
      await user.keyboard('a');
      expect(activeName()).toBe('apple');
    });

    it('takes the interval from CCK_SELECT_CONFIG', async () => {
      const user = userEvent.setup();
      await render(`<div cckSelect aria-label="Dish">${options}</div>`, {
        imports,
        providers: [{ provide: CCK_SELECT_CONFIG, useValue: { typeaheadDebounceInterval: 30 } }],
      });
      await user.tab();
      await user.keyboard('n');
      await screen.findByRole('listbox');
      await nextTask(80);
      await user.keyboard('a');
      expect(activeName()).toBe('apple');
    });
  });

  describe('hidden inputs and autofill', () => {
    const template = (attributes: string): string => `<form><div cckSelect aria-label="Dish" name="dish" ${attributes}
      [(value)]="value" (selectionChange)="changes.push($event)" [itemToStringValue]="toForm">
        <div cckSelectOption value="cake">Cake</div>
        <div cckSelectOption value="pizza" disabled>Pizza</div>
        <div cckSelectOptionGroup label="Mains" disabled><div cckSelectOption value="steak">Steak</div></div>
      </div></form>`;
    const setup = (attributes = '', multiple = false) => {
      const value = signal<unknown>(multiple ? [] : undefined);
      const changes: CckSelectChange[] = [];
      const toForm = (item: string): string => `form-${item}`;
      return { value, changes, toForm, attributes, template: template(attributes) };
    };

    it('puts autocomplete on the hidden input, off by default', async () => {
      const first = setup();
      const { container } = await render(first.template, {
        imports,
        componentProperties: { value: first.value, changes: first.changes, toForm: first.toForm },
      });
      expect(container.querySelector('input[name="dish"]')?.getAttribute('autocomplete')).toBe('off');
    });

    it('uses the given autocomplete', async () => {
      const first = setup('autocomplete="address-level1"');
      const { container } = await render(first.template, {
        imports,
        componentProperties: { value: first.value, changes: first.changes, toForm: first.toForm },
      });
      expect(container.querySelector('input[name="dish"]')?.getAttribute('autocomplete')).toBe('address-level1');
    });

    it('chooses the enabled option the browser wrote, through itemToStringValue, while closed', async () => {
      const first = setup();
      const { container, fixture } = await render(first.template, {
        imports,
        componentProperties: { value: first.value, changes: first.changes, toForm: first.toForm },
      });
      const input = must(container.querySelector<HTMLInputElement>('input[name="dish"]'));
      input.value = 'form-cake';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
      expect(first.value()).toBe('cake');
      expect(first.changes).toMatchObject([{ value: 'cake', reason: 'user' }]);
      expect(input.value).toBe('form-cake');
    });

    it('undoes a write that matches nothing, a disabled option or an option of a disabled group', async () => {
      const first = setup();
      const { container, fixture } = await render(first.template, {
        imports,
        componentProperties: { value: first.value, changes: first.changes, toForm: first.toForm },
      });
      const input = must(container.querySelector<HTMLInputElement>('input[name="dish"]'));
      for (const written of ['nothing', 'form-pizza', 'form-steak']) {
        input.value = written;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await fixture.whenStable();
        expect(input.value).toBe('');
      }
      expect(first.value()).toBeUndefined();
      expect(first.changes).toEqual([]);
    });

    it('keeps the form string right after an autofill and a later choice', async () => {
      const user = userEvent.setup();
      const first = setup();
      const { container, fixture } = await render(first.template, {
        imports,
        componentProperties: { value: first.value, changes: first.changes, toForm: first.toForm },
      });
      const input = must(container.querySelector<HTMLInputElement>('input[name="dish"]'));
      input.value = 'form-cake';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Steak' }));
      // Steak is in a disabled group: nothing changed.
      expect(input.value).toBe('form-cake');
    });

    it('ignores a write to a multiple Select and restores its inputs', async () => {
      const first = setup('multiple', true);
      const { container, fixture } = await render(first.template, {
        imports,
        componentProperties: { value: first.value, changes: first.changes, toForm: first.toForm },
      });
      first.value.set(['cake']);
      await fixture.whenStable();
      const input = must(container.querySelector<HTMLInputElement>('input[name="dish"]'));
      expect(input.value).toBe('form-cake');
      input.value = 'form-pizza';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
      expect(input.value).toBe('form-cake');
      expect(first.value()).toEqual(['cake']);
    });
  });
});
