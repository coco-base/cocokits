import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckRadioImports } from '../index';

const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
const radio = (name: string): HTMLInputElement => screen.getByRole<HTMLInputElement>('radio', { name });

function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}

/** Two radios of one group whose models are written from one selected value. */
@Component({
  imports: [CckRadioImports],
  template: `
    <fieldset>
      <legend>Plan</legend>
      <div
        cckRadio
        name="plan"
        submitValue="free"
        [checked]="selected() === 'free'"
        (checkedChangeDetails)="onChange('free', $event)"
      >
        Free
      </div>
      <div
        cckRadio
        name="plan"
        submitValue="pro"
        [checked]="selected() === 'pro'"
        (checkedChangeDetails)="onChange('pro', $event)"
      >
        Pro
      </div>
    </fieldset>
  `,
})
class GroupHost {
  readonly selected = signal<'free' | 'pro'>('free');
  readonly events: { plan: string; value: boolean; reason: string; type?: string }[] = [];

  onChange(plan: 'free' | 'pro', details: { value: boolean; reason: string; event: Event | null }): void {
    this.events.push({ plan, value: details.value, reason: details.reason, type: details.event?.type });
    if (details.value) this.selected.set(plan);
  }
}

describe('Radio', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports a user change with the native change event, the radio that lost the check first', async () => {
    const { fixture } = await render(GroupHost);
    const host = fixture.componentInstance;
    await userEvent.setup().click(radio('Pro'));
    expect(host.events).toEqual([
      { plan: 'free', value: false, reason: 'user', type: 'change' },
      { plan: 'pro', value: true, reason: 'user', type: 'change' },
    ]);
  });

  it('renders the anatomy and only the radio facts', async () => {
    const { container } = await render(`<div cckRadio name="plan" required>Free</div>`, {
      imports: [...CckRadioImports],
    });
    const root = must(container.querySelector('.cck-radio'));
    expect(root.tagName).toBe('DIV');
    const input = radio('Free');
    expect(root.querySelector('.cck-radio__wrapper > .cck-radio__input-wrapper > input.cck-radio__input')).toBe(input);
    expect(input.type).toBe('radio');
    expect(input.id).toMatch(/^cck-radio-/);
    expect(root.querySelector('.cck-radio__label')?.getAttribute('for')).toBe(input.id);
    expect(root.hasAttribute('data-required')).toBe(true);
    expect(input.required).toBe(true);
    expect([...root.attributes].map((attribute) => attribute.name).filter((name) => name.startsWith('data-'))).toEqual([
      'data-required',
    ]);
    for (const part of ['backdrop', 'background']) {
      expect(root.querySelector(`.cck-radio__${part}`)?.getAttribute('aria-hidden')).toBe('true');
    }
    expect(input.hasAttribute('aria-readonly')).toBe(false);
  });

  it('routes id, name and aria attributes to the input and none to the host', async () => {
    const { container } = await render(
      `<div cckRadio id="mine" name="plan" aria-describedby="d" submitValue="free">Free</div>`,
      { imports: [...CckRadioImports] },
    );
    const root = must(container.querySelector('.cck-radio'));
    expect(radio('Free').id).toBe('mine');
    expect(radio('Free').value).toBe('free');
    expect(radio('Free').getAttribute('aria-describedby')).toBe('d');
    for (const name of ['id', 'name', 'aria-describedby']) expect(root.hasAttribute(name), name).toBe(false);
  });

  it('unchecks the other radio of the group and emits on it with the user reason', async () => {
    const { fixture, container } = await render(GroupHost, { imports: [...CckRadioImports] });
    const host = fixture.componentInstance;
    expect(radio('Free').checked).toBe(true);
    await userEvent.setup().click(radio('Pro'));
    await fixture.whenStable();
    expect(host.selected()).toBe('pro');
    expect(radio('Free').checked).toBe(false);
    expect(container.querySelectorAll('.cck-radio')[0].hasAttribute('data-checked')).toBe(false);
    expect(container.querySelectorAll('.cck-radio')[1].hasAttribute('data-checked')).toBe(true);
    expect(host.events).toEqual(
      expect.arrayContaining([
        { plan: 'pro', value: true, reason: 'user', type: 'change' },
        { plan: 'free', value: false, reason: 'user', type: 'change' },
      ]),
    );
    expect(host.events).toHaveLength(2);
  });

  it('follows the group when the arrow key checks the next radio', async () => {
    const { fixture } = await render(GroupHost, { imports: [...CckRadioImports] });
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(radio('Free'));
    await user.keyboard('{ArrowDown}');
    await fixture.whenStable();
    expect(radio('Pro').checked).toBe(true);
    expect(fixture.componentInstance.selected()).toBe('pro');
    expect(radio('Free').checked).toBe(false);
  });

  it('emits nothing for a parent write', async () => {
    const { fixture } = await render(GroupHost, { imports: [...CckRadioImports] });
    fixture.componentInstance.selected.set('pro');
    await fixture.whenStable();
    expect(radio('Pro').checked).toBe(true);
    expect(radio('Free').checked).toBe(false);
    expect(fixture.componentInstance.events).toEqual([]);
  });

  it('does not report a radio of another name, another form or no name', async () => {
    const events: string[] = [];
    await render(
      `<div cckRadio name="a" [checked]="true" (checkedChangeDetails)="events.push('a')">A</div>
       <div cckRadio name="b" (checkedChangeDetails)="events.push('b')">B</div>`,
      { imports: [...CckRadioImports], componentProperties: { events } },
    );
    await userEvent.setup().click(radio('B'));
    expect(events).toEqual(['b']);
    expect(radio('A').checked).toBe(true);
  });

  it('submits the checked radio value and restores the mount value on reset', async () => {
    const seen: { value: boolean; reason: string }[] = [];
    const { container, fixture } = await render(
      `<form>
         <div cckRadio name="plan" submitValue="free" [checked]="true" (checkedChangeDetails)="seen.push($event)">Free</div>
         <div cckRadio name="plan" submitValue="pro">Pro</div>
       </form>`,
      { imports: [...CckRadioImports], componentProperties: { seen } },
    );
    const form = must(container.querySelector('form'));
    expect(new FormData(form).get('plan')).toBe('free');
    await userEvent.setup().click(radio('Pro'));
    expect(new FormData(form).get('plan')).toBe('pro');
    seen.length = 0;
    form.reset();
    await nextTask();
    await fixture.whenStable();
    expect(radio('Free').checked).toBe(true);
    expect(new FormData(form).get('plan')).toBe('free');
    expect(seen.some((entry) => entry.reason === 'form-reset')).toBe(true);
  });

  it('renders data-disabled from a disabling fieldset', async () => {
    const disabled = signal(false);
    const { container, fixture } = await render(
      `<fieldset [disabled]="disabled()"><div cckRadio name="plan">Free</div></fieldset>`,
      { imports: [...CckRadioImports], componentProperties: { disabled } },
    );
    const root = must(container.querySelector('.cck-radio'));
    disabled.set(true);
    await fixture.whenStable();
    await nextTask();
    await fixture.whenStable();
    expect(root.hasAttribute('data-disabled')).toBe(true);
    expect(radio('Free').disabled).toBe(true);
  });

  describe('development warnings', () => {
    it('warns once for a radio without a name', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      await render(`<div cckRadio>Free</div>`, { imports: [...CckRadioImports] });
      expect(warn).toHaveBeenCalledTimes(1);
      expect(String(warn.mock.calls[0]?.[0])).toContain('Radio has no name');
    });

    it('does not warn with a name', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      await render(`<div cckRadio name="plan">Free</div>`, { imports: [...CckRadioImports] });
      expect(warn).not.toHaveBeenCalled();
    });
  });
});
