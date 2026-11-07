import { Component, signal } from '@angular/core';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckCheckboxImports } from '../index';
import { box, isSet, must } from './fixtures';

@Component({
  imports: [CckCheckboxImports],
  template: `
    <div
      cckCheckbox
      id="terms"
      name="terms"
      form="f"
      submitValue="yes"
      aria-label="Terms"
      [(checked)]="checked"
      [indeterminate]="indeterminate()"
      (checkedChangeDetails)="events.push($event)"
    >
      Accept the terms
    </div>
  `,
})
class Host {
  readonly checked = signal(false);
  readonly indeterminate = signal(false);
  readonly events: { value: boolean; reason: string; event?: Event | null }[] = [];
}

async function mount(initial: Partial<{ checked: boolean; indeterminate: boolean }> = {}) {
  const view = await render(Host);
  if (initial.checked !== undefined) view.fixture.componentInstance.checked.set(initial.checked);
  if (initial.indeterminate !== undefined) view.fixture.componentInstance.indeterminate.set(initial.indeterminate);
  await view.fixture.whenStable();
  const root = must((view.fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.cck-checkbox'));
  return { ...view, host: view.fixture.componentInstance, root };
}

describe('Checkbox', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the anatomy around a native checkbox with the label content', async () => {
    const { root } = await mount();
    expect(root.tagName).toBe('DIV');
    expect(
      root.querySelector('.cck-checkbox__wrapper > .cck-checkbox__input-wrapper > input.cck-checkbox__input'),
    ).toBe(box());
    expect(root.querySelector('.cck-checkbox__wrapper > label.cck-checkbox__label')?.textContent.trim()).toBe(
      'Accept the terms',
    );
    expect(box().type).toBe('checkbox');
    expect(box().hasAttribute('role')).toBe(false);
    for (const part of ['backdrop', 'background']) {
      expect(root.querySelector(`.cck-checkbox__${part}`)?.getAttribute('aria-hidden')).toBe('true');
    }
    expect(root.querySelector('.cck-checkbox__input-wrapper')?.hasAttribute('aria-hidden')).toBe(false);
    expect(root.querySelector('[aria-checked]')).toBeNull();
  });

  it('routes the control attributes to the input and none of them to the host', async () => {
    const { root } = await mount();
    expect(box().id).toBe('terms');
    expect(box().name).toBe('terms');
    expect(box().value).toBe('yes');
    expect(box().getAttribute('aria-label')).toBe('Terms');
    for (const name of ['id', 'name', 'form', 'aria-label', 'aria-labelledby', 'aria-describedby', 'value']) {
      expect(root.hasAttribute(name), name).toBe(false);
    }
  });

  it('points the label at the input and generates an id when there is none', async () => {
    const view = await render(`<div cckCheckbox>Caption</div>`, { imports: [...CckCheckboxImports] });
    const input = box();
    expect(input.id).toMatch(/^cck-checkbox-/);
    expect(view.container.querySelector('label')?.getAttribute('for')).toBe(input.id);
    expect(input.labels?.length).toBe(1);
  });

  it('toggles on a click and emits the user reason with the event once', async () => {
    const { host, root } = await mount();
    await userEvent.setup().click(box());
    expect(host.checked()).toBe(true);
    expect(box().checked).toBe(true);
    expect(isSet(root, 'data-checked')).toBe(true);
    expect(isSet(root, 'data-dirty')).toBe(true);
    expect(host.events).toEqual([{ value: true, reason: 'user', event: expect.any(Event) as Event }]);
    expect(host.events[0]?.event?.type).toBe('change');
  });

  it('toggles on a click on the label and on Space', async () => {
    const { host, root } = await mount();
    const user = userEvent.setup();
    await user.click(must(root.querySelector('label')));
    expect(host.checked()).toBe(true);
    box().focus();
    await user.keyboard(' ');
    expect(host.checked()).toBe(false);
    expect(host.events.map((event) => event.value)).toEqual([true, false]);
  });

  it('shows a parent write and emits nothing for it', async () => {
    const { host, fixture, root } = await mount({ checked: true });
    expect(box().checked).toBe(true);
    expect(isSet(box(), 'checked')).toBe(true);
    expect(isSet(root, 'data-checked')).toBe(true);
    host.checked.set(false);
    await fixture.whenStable();
    expect(box().checked).toBe(false);
    expect(host.events).toEqual([]);
  });

  it('renders the mixed fact and sets the DOM property, and the prop wins after a click', async () => {
    const { host, root, fixture } = await mount({ indeterminate: true });
    expect(isSet(root, 'data-indeterminate')).toBe(true);
    expect(box().indeterminate).toBe(true);
    await userEvent.setup().click(box());
    expect(host.checked()).toBe(true);
    expect(box().indeterminate).toBe(true);
    expect(host.events).toHaveLength(1);
    host.indeterminate.set(false);
    await fixture.whenStable();
    expect(box().indeterminate).toBe(false);
    expect(isSet(root, 'data-indeterminate')).toBe(false);
  });

  it('blocks every user toggle while read-only, stays focusable and submits', async () => {
    const events: unknown[] = [];
    const view = await render(
      `<form><div cckCheckbox readonly name="a" [checked]="true" (checkedChangeDetails)="events.push($event)">Caption</div></form>`,
      { imports: [...CckCheckboxImports], componentProperties: { events } },
    );
    const user = userEvent.setup();
    expect(box().getAttribute('aria-readonly')).toBe('true');
    expect(isSet(must(view.container.querySelector('.cck-checkbox')), 'data-readonly')).toBe(true);
    await user.click(box());
    await user.click(must(view.container.querySelector('label')));
    box().focus();
    await user.keyboard(' ');
    expect(box().checked).toBe(true);
    expect(events).toEqual([]);
    expect(document.activeElement).toBe(box());
    expect(new FormData(must(view.container.querySelector('form'))).get('a')).toBe('on');
  });

  it('renders disabled natively and as a fact', async () => {
    const view = await render(`<div cckCheckbox disabled>Caption</div>`, { imports: [...CckCheckboxImports] });
    expect(box().disabled).toBe(true);
    expect(isSet(must(view.container.querySelector('.cck-checkbox')), 'data-disabled')).toBe(true);
  });

  it('renders aria-invalid only after the control was touched', async () => {
    await render(`<div cckCheckbox invalid>Caption</div>`, { imports: [...CckCheckboxImports] });
    expect(isSet(box(), 'aria-invalid')).toBe(false);
    const user = userEvent.setup();
    await user.click(box());
    await user.tab();
    expect(box().getAttribute('aria-invalid')).toBe('true');
  });

  it('emits touch on blur and takes no focus on mount', async () => {
    const touch = vi.fn();
    await render(`<div cckCheckbox (touch)="touch()">Caption</div>`, {
      imports: [...CckCheckboxImports],
      componentProperties: { touch },
    });
    expect(document.activeElement).toBe(document.body);
    box().focus();
    box().blur();
    expect(touch).toHaveBeenCalledTimes(1);
  });

  it('treats a nullish checked as unchecked and does not echo it', async () => {
    const events = vi.fn();
    await render(`<div cckCheckbox [checked]="value" (checkedChangeDetails)="events($event)">Caption</div>`, {
      imports: [...CckCheckboxImports],
      componentProperties: { value: null, events },
    });
    expect(box().checked).toBe(false);
    expect(events).not.toHaveBeenCalled();
  });

  describe('accessible name warning', () => {
    const warn = () => vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    it('warns for an empty label part with no other name', async () => {
      const spy = warn();
      await render(`<div cckCheckbox></div>`, { imports: [...CckCheckboxImports] });
      expect(spy).toHaveBeenCalledTimes(1);
      expect(String(spy.mock.calls[0]?.[0])).toContain('no accessible name');
    });

    it.each([
      ['content', `<div cckCheckbox>Caption</div>`],
      ['aria-label', `<div cckCheckbox aria-label="Name"></div>`],
      ['aria-labelledby', `<div cckCheckbox aria-labelledby="x"></div>`],
    ])('does not warn with %s', async (_name, template) => {
      const spy = warn();
      await render(template, { imports: [...CckCheckboxImports] });
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not warn when a label outside points at the id', async () => {
      const spy = warn();
      await render(`<label for="mine">Outside</label><div cckCheckbox id="mine"></div>`, {
        imports: [...CckCheckboxImports],
      });
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
