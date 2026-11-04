import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckLabelImports } from '@cocokits/angular/label';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckSwitchImports } from '../index';

const imports = [...CckSwitchImports, ...CckFormFieldImports, ...CckLabelImports];

const toggle = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('switch');

function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}

@Component({
  imports: [FormField, ...CckSwitchImports],
  template: `<div cckSwitch [formField]="f.on" submitValue="yes">Notify me</div>`,
})
class SignalHost {
  readonly state = signal({ on: false });
  readonly f = form(this.state);
}

@Component({
  imports: [ReactiveFormsModule, ...CckSwitchImports],
  template: `<div cckSwitch [formControl]="control">Notify me</div>`,
})
class ReactiveHost {
  readonly control = new FormControl<boolean | null>(false);
}

describe('Switch', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a label that wraps the track and the content around a native checkbox with role switch', async () => {
    const { container } = await render(`<div cckSwitch name="n" submitValue="yes">Notify me</div>`, { imports });
    const root = must(container.querySelector('.cck-switch'));
    expect(root.tagName).toBe('DIV');
    const label = must(root.querySelector(':scope > label.cck-switch__label'));
    expect(label.querySelector(':scope > .cck-switch__track > input.cck-switch__input')).toBe(toggle());
    expect(label.textContent.trim()).toBe('Notify me');
    expect(toggle().type).toBe('checkbox');
    expect(label.getAttribute('for')).toBe(toggle().id);
    expect(toggle().id).toMatch(/^cck-switch-/);
    expect(toggle().name).toBe('n');
    expect(toggle().value).toBe('yes');
    expect(root.hasAttribute('data-indeterminate')).toBe(false);
    expect(toggle().hasAttribute('aria-checked')).toBe(false);
    for (const part of ['thumb', 'backdrop']) {
      expect(root.querySelector(`.cck-switch__${part}`)?.getAttribute('aria-hidden')).toBe('true');
    }
    expect(root.querySelector('.cck-switch__track')?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('toggles from a click on the label, emits once with the user reason and shows the fact', async () => {
    const events: { value: boolean; reason: string }[] = [];
    const { container } = await render(`<div cckSwitch (checkedChangeDetails)="events.push($event)">Notify me</div>`, {
      imports,
      componentProperties: { events },
    });
    await userEvent.setup().click(must(container.querySelector('label')));
    expect(toggle().checked).toBe(true);
    expect(container.querySelector('.cck-switch')?.hasAttribute('data-checked')).toBe(true);
    expect(events).toEqual([{ value: true, reason: 'user', event: expect.any(Event) as Event }]);
  });

  it('blocks every user toggle while read-only', async () => {
    const events: unknown[] = [];
    const { container } = await render(
      `<div cckSwitch readonly [checked]="true" (checkedChangeDetails)="events.push($event)">Notify me</div>`,
      { imports, componentProperties: { events } },
    );
    const user = userEvent.setup();
    expect(toggle().getAttribute('aria-readonly')).toBe('true');
    await user.click(toggle());
    await user.click(must(container.querySelector('label')));
    toggle().focus();
    await user.keyboard(' ');
    expect(toggle().checked).toBe(true);
    expect(events).toEqual([]);
  });

  it('names the input from the label and warns for an empty one', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(`<div cckSwitch>Notify me</div>`, { imports });
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns when the label holds only the track', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(`<div cckSwitch></div>`, { imports });
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('is named by the field label and the inner label in a field', async () => {
    const { container } = await render(
      `<div cckFormField id="f"><label cckLabel>Alerts</label><div cckSwitch>Notify me</div></div>`,
      { imports },
    );
    expect(toggle().id).toBe('f-control');
    expect(screen.getByRole('switch', { name: 'Alerts Notify me' })).toBe(toggle());
    expect(container.querySelector('.cck-switch__label')?.getAttribute('for')).toBe('f-control');
  });

  it('binds Signal Forms [formField] to checked and submits the submit value', async () => {
    const { fixture, container } = await render(SignalHost);
    await userEvent.setup().click(toggle());
    expect(fixture.componentInstance.state().on).toBe(true);
    expect(toggle().value).toBe('yes');
    expect(container.querySelector('.cck-switch')).not.toBeNull();
  });

  it('binds a reactive FormControl without a value accessor', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { fixture } = await render(ReactiveHost);
    fixture.componentInstance.control.setValue(true);
    await fixture.whenStable();
    expect(toggle().checked).toBe(true);
    await userEvent.setup().click(toggle());
    expect(fixture.componentInstance.control.value).toBe(false);
    expect(error).not.toHaveBeenCalled();
  });
});
