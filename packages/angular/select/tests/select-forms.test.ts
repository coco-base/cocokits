import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, FormRoot, disabled, form, required } from '@angular/forms/signals';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckHintImports } from '@cocokits/angular/hint';
import { CckLabelImports } from '@cocokits/angular/label';
import { selectAnatomy } from '@cocokits/machines/select';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelectImports, type CckSelectChange } from '../index';
import { gone, must, nextTask, trigger } from './helpers';
import { stubOverlayApis } from './overlay-stubs';

const imports = [
  ...CckSelectImports,
  ...CckFormFieldImports,
  ...CckLabelImports,
  ...CckHintImports,
  FormsModule,
  ReactiveFormsModule,
  FormField,
  FormRoot,
];
const { classes } = selectAnatomy;

const OPTIONS = `<cck-select-option value="Cake">Cake</cck-select-option><cck-select-option value="Pizza">Pizza</cck-select-option>`;
const submitHandler = (): ReturnType<typeof vi.fn> =>
  vi.fn((event: SubmitEvent) => {
    event.preventDefault();
  });
const dataOf = (handler: ReturnType<typeof vi.fn>, call = 0): FormData =>
  new FormData((handler.mock.calls[call]?.[0] as SubmitEvent).target as HTMLFormElement);

describe('Select forms', () => {
  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('native participation', () => {
    it('submits the value under its name, and the empty string while nothing is selected', async () => {
      const handler = submitHandler();
      const user = userEvent.setup();
      const { container } = await render(
        `<form (submit)="handler($event)"><cck-select aria-label="Dish" name="dish">${OPTIONS}</cck-select></form>`,
        { imports, componentProperties: { handler } },
      );
      container.querySelector('form')?.requestSubmit();
      expect(dataOf(handler).getAll('dish')).toEqual(['']);
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Pizza' }));
      container.querySelector('form')?.requestSubmit();
      expect(dataOf(handler, 1).getAll('dish')).toEqual(['Pizza']);
    });

    it('submits one entry per value with multiple, and none while empty', async () => {
      const handler = submitHandler();
      const { container } = await render(
        `<form (submit)="handler($event)"><cck-select multiple aria-label="Dish" name="dish" [value]="value">${OPTIONS}</cck-select></form>`,
        { imports, componentProperties: { handler, value: ['Cake', 'Pizza'] } },
      );
      container.querySelector('form')?.requestSubmit();
      expect(dataOf(handler).getAll('dish')).toEqual(['Cake', 'Pizza']);
    });

    it('blocks the submit of a required multiple Select with no value', async () => {
      const handler = submitHandler();
      const { container } = await render(
        `<form ngNativeValidate (submit)="handler($event)"><cck-select multiple required aria-label="Dish" name="dish">${OPTIONS}</cck-select></form>`,
        { imports, componentProperties: { handler } },
      );
      const form = must(container.querySelector<HTMLFormElement>('form'));
      const inputs = container.querySelectorAll<HTMLInputElement>('input[name="dish"]');
      expect(inputs).toHaveLength(1);
      expect(inputs[0].value).toBe('');
      expect(form.checkValidity()).toBe(false);
      form.requestSubmit();
      expect(handler).not.toHaveBeenCalled();
    });

    it('submits nothing with multiple while nothing is selected', async () => {
      const handler = submitHandler();
      const { container } = await render(
        `<form (submit)="handler($event)"><cck-select multiple aria-label="Dish" name="dish">${OPTIONS}</cck-select></form>`,
        { imports, componentProperties: { handler } },
      );
      container.querySelector('form')?.requestSubmit();
      expect(dataOf(handler).has('dish')).toBe(false);
    });

    it('renders hidden inputs only while name is set', async () => {
      const name = signal('');
      const { container, fixture } = await render(
        `<cck-select aria-label="Dish" [name]="name()" value="Cake">${OPTIONS}</cck-select>`,
        { imports, componentProperties: { name } },
      );
      expect(container.querySelector('input')).toBeNull();
      name.set('dish');
      await fixture.whenStable();
      const input = must(container.querySelector<HTMLInputElement>('input'));
      expect(input.name).toBe('dish');
      expect(input.value).toBe('Cake');
      expect(input.getAttribute('aria-hidden')).toBe('true');
      expect(input.tabIndex).toBe(-1);
      expect(input.hasAttribute('class')).toBe(false);
    });

    it('belongs to the form named by form', async () => {
      const handler = submitHandler();
      const { container } = await render(
        `<form id="orders" (submit)="handler($event)"></form>
         <cck-select aria-label="Dish" name="dish" form="orders" value="Cake">${OPTIONS}</cck-select>`,
        { imports, componentProperties: { handler } },
      );
      container.querySelector('form')?.requestSubmit();
      expect(dataOf(handler).get('dish')).toBe('Cake');
    });

    it('blocks the submit while required and empty, focuses the trigger, and passes once chosen', async () => {
      const user = userEvent.setup();
      const handler = submitHandler();
      const { container } = await render(
        `<form ngNativeValidate (submit)="handler($event)"><cck-select aria-label="Dish" name="dish" required>${OPTIONS}</cck-select></form>`,
        { imports, componentProperties: { handler } },
      );
      const form = must(container.querySelector<HTMLFormElement>('form'));
      expect(form.checkValidity()).toBe(false);
      form.requestSubmit();
      expect(handler).not.toHaveBeenCalled();
      await nextTask(0);
      expect(document.activeElement).toBe(trigger());
      expect(trigger().getAttribute('aria-required')).toBe('true');
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Cake' }));
      await gone();
      expect(form.checkValidity()).toBe(true);
      form.requestSubmit();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('does not submit a disabled Select, and a disabling fieldset disables it', async () => {
      const handler = submitHandler();
      const { container } = await render(
        `<form (submit)="handler($event)"><fieldset disabled><cck-select aria-label="Dish" name="dish" value="Cake">${OPTIONS}</cck-select></fieldset></form>`,
        { imports, componentProperties: { handler } },
      );
      container.querySelector('form')?.requestSubmit();
      expect(dataOf(handler).has('dish')).toBe(false);
      await waitFor(() => {
        expect(trigger().closest(`.${classes.root}`)?.hasAttribute('data-disabled')).toBe(true);
      });
    });

    it('restores the value at mount on reset, reports form-reset and marks the form untouched', async () => {
      const user = userEvent.setup();
      const value = signal<string | undefined>('Cake');
      const seen: CckSelectChange[] = [];
      const { container, fixture } = await render(
        `<form><cck-select aria-label="Dish" name="dish" [(value)]="value" (selectionChange)="seen.push($event)">${OPTIONS}</cck-select></form>`,
        { imports, componentProperties: { value, seen } },
      );
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Pizza' }));
      await gone();
      seen.length = 0;
      container.querySelector('form')?.reset();
      await nextTask(0);
      await fixture.whenStable();
      expect(value()).toBe('Cake');
      expect(seen).toMatchObject([{ value: 'Cake', reason: 'form-reset' }]);
      expect(seen[0]?.event?.type).toBe('reset');
      expect(trigger().querySelector(`.${classes.value}`)?.textContent.trim()).toBe('Cake');
      expect(must(container.querySelector<HTMLInputElement>('input[name="dish"]')).value).toBe('Cake');
    });

    it('restores an empty single value on reset', async () => {
      const user = userEvent.setup();
      const { container, fixture } = await render(
        `<form><cck-select aria-label="Dish" name="dish" placeholder="Choose">${OPTIONS}</cck-select></form>`,
        { imports },
      );
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Pizza' }));
      await gone();
      container.querySelector('form')?.reset();
      await nextTask(0);
      await fixture.whenStable();
      expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose');
    });
  });

  describe('in a FormField', () => {
    const FIELD = `
      <cck-form-field>
        <label cckLabel>Dish</label>
        <cck-select placeholder="Choose" [required]="true" [value]="value">${OPTIONS}</cck-select>
        <cck-hint>Pick one</cck-hint>
      </cck-form-field>`;

    it('is the control of the field: control id, label for, described by the hint, required marker', async () => {
      await render(FIELD, { imports, componentProperties: { value: undefined } });
      const field = must(document.querySelector<HTMLElement>('cck-form-field'));
      const label = screen.getByText('Dish', { selector: 'label' });
      expect(trigger().id).toMatch(/-control$/);
      expect(label.getAttribute('for')).toBe(trigger().id);
      const hint = must(field.querySelector<HTMLElement>('cck-hint'));
      expect(trigger().getAttribute('aria-describedby')).toBe(hint.id);
      expect(trigger().getAttribute('aria-required')).toBe('true');
      expect(label.textContent).toContain('*');
      expect(screen.getByRole('combobox', { name: /Dish/ })).toBe(trigger());
    });

    it('gives the field its facts: filled, focused, required', async () => {
      const user = userEvent.setup();
      await render(FIELD, { imports, componentProperties: { value: undefined } });
      const field = must(document.querySelector<HTMLElement>('cck-form-field'));
      expect(field.hasAttribute('data-required')).toBe(true);
      expect(field.hasAttribute('data-filled')).toBe(false);
      await user.tab();
      expect(field.hasAttribute('data-focused')).toBe(true);
      await user.keyboard('{ArrowDown}{Enter}');
      await gone();
      expect(field.hasAttribute('data-filled')).toBe(true);
    });

    it('takes the field state: a disabled field disables the Select', async () => {
      await render(
        `<cck-form-field disabled><label cckLabel>Dish</label><cck-select>${OPTIONS}</cck-select></cck-form-field>`,
        {
          imports,
        },
      );
      expect(trigger().disabled).toBe(true);
    });

    it('focuses the trigger and does not open when the label is clicked', async () => {
      const user = userEvent.setup();
      await render(FIELD, { imports, componentProperties: { value: undefined } });
      await user.click(screen.getByText('Dish', { selector: 'label' }));
      expect(document.activeElement).toBe(trigger());
      expect(screen.queryByRole('listbox')).toBeNull();
      await user.click(trigger());
      expect(await screen.findByRole('listbox')).toBeTruthy();
    });

    it('lines the list up with the input wrapper of the field, not the trigger', async () => {
      const user = userEvent.setup();
      await render(FIELD, { imports, componentProperties: { value: undefined } });
      const wrapper = must(document.querySelector<HTMLElement>('.cck-form-field__input-wrapper'));
      wrapper.getBoundingClientRect = () => new DOMRect(40, 10, 300, 48);
      await user.click(trigger());
      const list = await screen.findByRole('listbox');
      await waitFor(() => {
        expect(list.style.getPropertyValue('--anchor-width')).toBe('300px');
      });
    });

    it('lines the list up with the trigger outside a field', async () => {
      const user = userEvent.setup();
      await render(`<cck-select aria-label="Dish">${OPTIONS}</cck-select>`, { imports });
      trigger().getBoundingClientRect = () => new DOMRect(0, 0, 180, 40);
      await user.click(trigger());
      const list = await screen.findByRole('listbox');
      await waitFor(() => {
        expect(list.style.getPropertyValue('--anchor-width')).toBe('180px');
      });
    });
  });

  describe('Reactive and template-driven forms', () => {
    @Component({
      imports,
      template: `<form [formGroup]="group">
        <cck-form-field>
          <label cckLabel>Dish</label>
          <cck-select formControlName="dish" placeholder="Choose">${OPTIONS}</cck-select>
        </cck-form-field>
      </form>`,
    })
    class ReactiveHost {
      readonly control = new FormControl<string | null>(null, (control) => Validators.required(control));
      readonly group = new FormGroup({ dish: this.control });
    }

    it('writes the value to the control, shows control writes, and marks touched on blur', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(ReactiveHost, { imports });
      const { control } = fixture.componentInstance;
      await user.tab();
      await user.keyboard('{ArrowDown}{Enter}');
      await gone();
      expect(control.value).toBe('Cake');
      control.setValue('Pizza');
      await fixture.whenStable();
      expect(trigger().querySelector(`.${classes.value}`)?.textContent.trim()).toBe('Pizza');
      expect(control.touched).toBe(false);
      await user.tab();
      expect(control.touched).toBe(true);
      control.disable();
      await fixture.whenStable();
      expect(trigger().disabled).toBe(true);
    });

    it('defaults the name to the path of the control', async () => {
      const { container } = await render(ReactiveHost, { imports });
      expect(container.querySelector('input')?.name).toBe('dish');
    });

    it('binds ngModel', async () => {
      const user = userEvent.setup();
      const value = signal('Pizza');
      const { fixture } = await render(`<cck-select aria-label="Dish" [(ngModel)]="value">${OPTIONS}</cck-select>`, {
        imports,
        componentProperties: { value },
      });
      await fixture.whenStable();
      await nextTask(0);
      expect(trigger().querySelector(`.${classes.value}`)?.textContent.trim()).toBe('Pizza');
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Cake' }));
      expect(value()).toBe('Cake');
    });
  });

  describe('Signal Forms', () => {
    @Component({
      imports,
      template: `<form [formRoot]="f">
        <cck-form-field>
          <label cckLabel>Dish</label>
          <cck-select [formField]="f.dish" placeholder="Choose">${OPTIONS}</cck-select>
        </cck-form-field>
      </form>`,
    })
    class SignalHost {
      readonly off = signal(false);
      readonly state = signal({ dish: '' });
      readonly f = form(this.state, (path) => {
        required(path.dish);
        disabled(path.dish, { when: () => this.off() });
      });
    }

    it('writes the model, shows model writes, follows required and disabled rules, touches on blur', async () => {
      const user = userEvent.setup();
      const { fixture, container } = await render(SignalHost, { imports });
      const host = fixture.componentInstance;
      expect(trigger().getAttribute('aria-required')).toBe('true');
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Pizza' }));
      await gone();
      expect(host.state().dish).toBe('Pizza');
      host.state.set({ dish: 'Cake' });
      await fixture.whenStable();
      expect(trigger().querySelector(`.${classes.value}`)?.textContent.trim()).toBe('Cake');
      await user.tab();
      expect(host.f.dish().touched()).toBe(true);
      expect(container.querySelector('input')?.name).toMatch(/dish$/);
      host.off.set(true);
      await fixture.whenStable();
      expect(trigger().disabled).toBe(true);
    });
  });
});
