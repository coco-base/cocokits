import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckCheckboxImports } from '@cocokits/angular/checkbox';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckLabelImports } from '@cocokits/angular/label';
import { CHECKBOX_GROUP_NAME_WARNING, checkboxGroupAnatomy } from '@cocokits/machines/checkbox-group';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckCheckboxGroupImports, type CheckboxGroupChangeDetails } from '../index';

const imports = [...CckCheckboxGroupImports, ...CckCheckboxImports, ...CckFormFieldImports, ...CckLabelImports];

@Component({
  imports,
  template: `
    <cck-checkbox-group
      aria-label="Toppings"
      name="toppings"
      [(value)]="value"
      [disabled]="disabled()"
      (valueChangeDetails)="log.push($event)"
    >
      <cck-checkbox submitValue="ham">Ham</cck-checkbox>
      <cck-checkbox submitValue="olives">Olives</cck-checkbox>
      <cck-checkbox submitValue="corn">Corn</cck-checkbox>
    </cck-checkbox-group>
  `,
})
class Alone {
  readonly value = signal<readonly string[]>(['olives']);
  readonly disabled = signal(false);
  readonly log: CheckboxGroupChangeDetails[] = [];
}

const box = (name: string): HTMLInputElement => screen.getByRole<HTMLInputElement>('checkbox', { name });

describe('Checkbox group', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a group element with the class, the role, the orientation and no input attribute', async () => {
    const { container } = await render(Alone);
    const group = container.querySelector('cck-checkbox-group');
    expect(group?.getAttribute('role')).toBe('group');
    expect(group?.classList.contains(checkboxGroupAnatomy.classes.root)).toBe(true);
    expect(group?.getAttribute('data-orientation')).toBe('vertical');
    expect(group?.getAttribute('aria-label')).toBe('Toppings');
    for (const attribute of ['name', 'value', 'disabled', 'orientation']) {
      expect(group?.hasAttribute(attribute), attribute).toBe(false);
    }
    expect(screen.getByRole('group', { name: 'Toppings' })).toBe(group);
  });

  it('checks the checkboxes whose value is in the list and gives them the group name', async () => {
    await render(Alone);
    expect(box('Ham').checked).toBe(false);
    expect(box('Olives').checked).toBe(true);
    expect(box('Corn').name).toBe('toppings');
  });

  it('adds and removes the value on a click, in order, and reports one change with the reason', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Alone);
    await user.click(box('Ham'));
    await user.click(box('Olives'));
    const host = fixture.componentInstance;
    expect(host.value()).toEqual(['ham']);
    expect(host.log.map((change) => [change.value, change.reason])).toEqual([
      [['olives', 'ham'], 'user'],
      [['ham'], 'user'],
    ]);
  });

  it('shows a value written from code without a notification', async () => {
    const { fixture } = await render(Alone);
    fixture.componentInstance.value.set(['corn', 'ham']);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(box('Corn').checked).toBe(true);
    expect(box('Ham').checked).toBe(true);
    expect(box('Olives').checked).toBe(false);
    expect(fixture.componentInstance.log).toEqual([]);
  });

  it('disables every checkbox and sets data-disabled while the group is disabled', async () => {
    const { fixture, container } = await render(Alone);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(box('Ham').disabled).toBe(true);
    expect(container.querySelector('cck-checkbox-group')?.hasAttribute('data-disabled')).toBe(true);
  });

  it('warns in development while nothing names the group', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render('<cck-checkbox-group><cck-checkbox submitValue="a">A</cck-checkbox></cck-checkbox-group>', {
      imports,
    });
    expect(warn).toHaveBeenCalledWith(CHECKBOX_GROUP_NAME_WARNING);
  });

  it('does not warn when aria-labelledby names it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(
      '<span id="t">Toppings</span><cck-checkbox-group aria-labelledby="t"><cck-checkbox submitValue="a">A</cck-checkbox></cck-checkbox-group>',
      { imports },
    );
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('Checkbox group in a FormField', () => {
  const field = (extra = ''): string =>
    `<cck-form-field id="f" ${extra}><label cckLabel>Toppings</label><cck-checkbox-group><cck-checkbox submitValue="ham">Ham</cck-checkbox><cck-checkbox submitValue="corn">Corn</cck-checkbox></cck-checkbox-group></cck-form-field>`;

  it('is named by the Label through aria-labelledby, and the Label has no for', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = await render(field(), { imports });
    const label = container.querySelector('label.cck-label');
    const group = container.querySelector('cck-checkbox-group');
    expect(label?.hasAttribute('for')).toBe(false);
    expect(group?.getAttribute('aria-labelledby')).toBe(label?.id);
    expect(group?.id).toBe('f-control');
    expect(screen.getByRole('group', { name: 'Toppings' })).toBe(group);
    expect(warn).not.toHaveBeenCalled();
  });

  it('lets the checkboxes inside take no part in the field: no second control warning, no field id', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(field(), { imports });
    expect(warn).not.toHaveBeenCalled();
    expect(box('Ham').id).not.toBe('f-control');
  });

  it('shows the field disabled and invalid on the group', async () => {
    const { container } = await render(field('disabled'), { imports });
    expect(container.querySelector('cck-checkbox-group')?.hasAttribute('data-disabled')).toBe(true);
    expect(box('Ham').disabled).toBe(true);
  });

  it('keeps an aria-label of the author over the Label', async () => {
    const { container } = await render(
      field().replace('<cck-checkbox-group>', '<cck-checkbox-group aria-label="Mine">'),
      {
        imports,
      },
    );
    expect(container.querySelector('cck-checkbox-group')?.hasAttribute('aria-labelledby')).toBe(false);
    expect(container.querySelector('cck-checkbox-group')?.getAttribute('aria-label')).toBe('Mine');
  });
});
