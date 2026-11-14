import { Component, signal } from '@angular/core';
import { FormField, FormRoot, disabled, form, required } from '@angular/forms/signals';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckLabelImports } from '@cocokits/angular/label';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckChipListImports, type ChipListChangeDetails } from '../index';
import { must } from './fixtures';

const imports = [...CckChipListImports, ...CckFormFieldImports, ...CckLabelImports];

const textbox = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('textbox');
const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** A submit handler that cancels the submit, as Angular and the forms libraries do. */
const onSubmit = (): ReturnType<typeof vi.fn> =>
  vi.fn((event: SubmitEvent) => {
    event.preventDefault();
  });

/** What the submit handler's form sent. */
const dataOf = (handler: ReturnType<typeof vi.fn>): FormData =>
  new FormData((handler.mock.calls[0]?.[0] as SubmitEvent).target as HTMLFormElement);

const hiddenInputs = (container: Element): HTMLInputElement[] =>
  Array.from(container.querySelectorAll<HTMLInputElement>('input[aria-hidden="true"]'));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Chip list in a real form', () => {
  const template = (attrs = '', extra = ''): string =>
    `<form (submit)="handler($event)"><cck-chip-list aria-label="Dishes" name="dish" ${attrs} />${extra}<button type="submit">Send</button></form>`;

  it('sends one FormData entry per chip under the name, and none from the text box', async () => {
    const handler = onSubmit();
    const { container } = await render(template(`[value]="['Pizza', 'Salad']"`), {
      imports,
      componentProperties: { handler },
    });
    container.querySelector('form')?.requestSubmit();
    const data = dataOf(handler);
    expect(data.getAll('dish')).toEqual(['Pizza', 'Salad']);
    expect([...data.keys()]).toEqual(['dish', 'dish']);
    expect(textbox().hasAttribute('name')).toBe(false);
  });

  it('renders no hidden input without a name', async () => {
    const { container } = await render(`<cck-chip-list aria-label="Dishes" [value]="['a']" />`, { imports });
    expect(hiddenInputs(container)).toHaveLength(0);
  });

  it('renders one clipped hidden input per chip with a name', async () => {
    const { container } = await render(template(`[value]="['a', 'b']"`), {
      imports,
      componentProperties: { handler: onSubmit() },
    });
    const inputs = hiddenInputs(container);
    expect(inputs.map((input) => input.value)).toEqual(['a', 'b']);
    for (const input of inputs) {
      expect(input.tabIndex).toBe(-1);
      expect(input.getAttribute('class')).toBeNull();
      expect(input.name).toBe('dish');
    }
  });

  it('adds with Enter and does not submit; Enter with an empty text box submits', async () => {
    const handler = onSubmit();
    await render(template(), { imports, componentProperties: { handler } });
    const user = userEvent.setup();
    await user.type(textbox(), 'Salad{Enter}');
    expect(handler).not.toHaveBeenCalled();
    expect(textbox().value).toBe('');
    await user.keyboard('{Enter}');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(dataOf(handler).getAll('dish')).toEqual(['Salad']);
  });

  it('sends the entries to the form named by the form attribute', async () => {
    const handler = onSubmit();
    const { container } = await render(
      `<form id="f" (submit)="handler($event)"></form><cck-chip-list aria-label="Dishes" name="dish" form="f" [value]="['Pizza']" />`,
      { imports, componentProperties: { handler } },
    );
    container.querySelector('form')?.requestSubmit();
    expect(dataOf(handler).getAll('dish')).toEqual(['Pizza']);
    expect(hiddenInputs(container)[0]?.getAttribute('form')).toBe('f');
  });

  it('is invalid while required and empty and valid with a chip', async () => {
    const { container } = await render(`<form><cck-chip-list aria-label="Dishes" name="dish" required /></form>`, {
      imports,
    });
    const element = must(container.querySelector('form'));
    expect(element.checkValidity()).toBe(false);
    expect(hiddenInputs(container)).toHaveLength(1);
    const user = userEvent.setup();
    await user.type(textbox(), 'x{Enter}');
    expect(element.checkValidity()).toBe(true);
    expect(textbox().hasAttribute('required')).toBe(false);
  });

  it('focuses the text box on a blocked submit, shows the invalid fact and never cancels the event', async () => {
    const { container } = await render(
      `<form ngNativeValidate><cck-chip-list aria-label="Dishes" name="dish" required /><button type="submit">Send</button></form>`,
      { imports },
    );
    const input = hiddenInputs(container)[0];
    must(container.querySelector('form')).requestSubmit();
    await waitFor(() => {
      expect(textbox().getAttribute('aria-invalid')).toBe('true');
    });
    await nextTask();
    expect(document.activeElement).toBe(textbox());
    expect(container.querySelector('cck-chip-list')?.hasAttribute('data-invalid')).toBe(true);
    expect(fireEvent(input, new Event('invalid', { cancelable: true }))).toBe(true);
  });

  it('restores the value at mount on reset, reports form-reset, clears the text box and data-submitted', async () => {
    const value = signal(['Pizza']);
    const seen: ChipListChangeDetails[] = [];
    const handler = onSubmit();
    const { container, fixture } = await render(
      template('[(value)]="value" (valueChangeDetails)="seen.push($event)"'),
      { imports, componentProperties: { value, seen, handler } },
    );
    const user = userEvent.setup();
    await user.type(textbox(), 'Salad{Enter}half');
    must(container.querySelector('form')).requestSubmit();
    const root = must(container.querySelector('cck-chip-list'));
    await waitFor(() => {
      expect(root.hasAttribute('data-submitted')).toBe(true);
    });
    expect(value()).toEqual(['Pizza', 'Salad']);
    seen.length = 0;
    must(container.querySelector('form')).reset();
    await nextTask();
    await fixture.whenStable();
    expect(value()).toEqual(['Pizza']);
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({ value: ['Pizza'], reason: 'form-reset' });
    expect(seen[0]?.event?.type).toBe('reset');
    expect(textbox().value).toBe('');
    expect(root.hasAttribute('data-submitted')).toBe(false);
    expect(hiddenInputs(container).map((input) => input.value)).toEqual(['Pizza']);
  });

  it('keeps the value when a listener cancels the reset', async () => {
    const value = signal(['Pizza']);
    const { container } = await render(
      `<form (reset)="$event.preventDefault()"><cck-chip-list aria-label="Dishes" [(value)]="value" /></form>`,
      { imports, componentProperties: { value } },
    );
    await userEvent.setup().type(textbox(), 'Salad{Enter}');
    must(container.querySelector('form')).reset();
    await nextTask();
    expect(value()).toEqual(['Pizza', 'Salad']);
  });

  it('is disabled by a disabling fieldset: no entries, a disabled text box and buttons, data-disabled', async () => {
    const handler = onSubmit();
    const { container } = await render(
      `<form (submit)="handler($event)"><fieldset disabled><cck-chip-list aria-label="Dishes" name="dish" [value]="['Pizza']" /></fieldset></form>`,
      { imports, componentProperties: { handler } },
    );
    container.querySelector('form')?.requestSubmit();
    expect(dataOf(handler).has('dish')).toBe(false);
    await waitFor(() => {
      expect(container.querySelector('cck-chip-list')?.hasAttribute('data-disabled')).toBe(true);
    });
    expect(textbox().disabled).toBe(true);
    expect(container.querySelector<HTMLButtonElement>('.cck-chip__remove')?.disabled).toBe(true);
  });

  it('does not add on Enter while a fieldset disables it', async () => {
    const { container } = await render(
      `<fieldset disabled><cck-chip-list aria-label="Dishes" [value]="[]" /></fieldset>`,
      { imports },
    );
    fireEvent.keyDown(textbox(), { key: 'Enter' });
    expect(container.querySelectorAll('.cck-chip')).toHaveLength(0);
  });
});

/** A Signal Forms form with one chip list; the flag switches the disabling rule on. */
@Component({
  imports: [FormField, FormRoot, CckChipListImports],
  template: `
    <form [formRoot]="f">
      <cck-chip-list aria-label="Dishes" [formField]="f.dishes" />
      <button type="submit">Send</button>
    </form>
  `,
})
class SignalHost {
  readonly off = signal(false);
  readonly state = signal({ dishes: ['Pizza'] as string[] });
  readonly f = form(this.state, (path) => {
    required(path.dishes);
    disabled(path.dishes, { when: () => this.off() });
  });
}

describe('Chip list with Signal Forms [formField]', () => {
  it('writes the model on add and remove, touches on leaving, and names the hidden inputs by the path', async () => {
    const { container, fixture } = await render(SignalHost);
    const host = fixture.componentInstance;
    const user = userEvent.setup();
    await user.type(textbox(), 'Salad{Enter}');
    expect(host.state().dishes).toEqual(['Pizza', 'Salad']);
    expect(host.f.dishes().dirty()).toBe(true);
    expect(host.f.dishes().touched()).toBe(false);
    await user.tab({ shift: true });
    await user.tab();
    await user.tab();
    await user.tab();
    await fixture.whenStable();
    expect(host.f.dishes().touched()).toBe(true);
    expect(hiddenInputs(container).map((input) => input.name.split('.').pop())).toEqual(['dishes', 'dishes']);
    host.state.set({ dishes: ['x'] });
    await fixture.whenStable();
    expect(container.querySelectorAll('.cck-chip')).toHaveLength(1);
  });

  it('follows a disabled() rule', async () => {
    const { container, fixture } = await render(SignalHost);
    fixture.componentInstance.off.set(true);
    await fixture.whenStable();
    expect(textbox().disabled).toBe(true);
    expect(container.querySelector<HTMLButtonElement>('.cck-chip__remove')?.disabled).toBe(true);
  });
});
