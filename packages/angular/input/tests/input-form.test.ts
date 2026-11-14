import { signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { describe, expect, it, vi } from 'vitest';
import { CckInputImports } from '../index';
import { isSet, must, nextTask, textbox } from './fixtures';

const imports = [...CckInputImports, ...CckFormFieldImports];

/** What a submit event carries; the handler cancels it, as Angular and the forms libraries do. */
const onSubmit = (): ReturnType<typeof vi.fn> =>
  vi.fn((event: SubmitEvent) => {
    event.preventDefault();
  });

describe('Input in a real form', () => {
  it('puts the value into FormData under its name', async () => {
    const handler = onSubmit();
    const { container } = await render(
      `<form (submit)="handler($event)"><input cckInput name="email" aria-label="Email" value="a@b.c" /></form>`,
      { imports, componentProperties: { handler } },
    );
    container.querySelector('form')?.requestSubmit();
    const event = handler.mock.calls[0]?.[0] as SubmitEvent;
    expect(new FormData(event.target as HTMLFormElement).get('email')).toBe('a@b.c');
  });

  it('blocks checkValidity while required and empty, and passes once it has text', async () => {
    const { container } = await render(`<form><input cckInput required aria-label="Name" /></form>`, { imports });
    const form = container.querySelector('form');
    expect(form?.checkValidity()).toBe(false);
    await userEvent.setup().type(textbox(), 'x');
    expect(form?.checkValidity()).toBe(true);
  });

  describe('reset', () => {
    it('restores the value at mount, reports form-reset and clears touched and dirty', async () => {
      const value = signal('start');
      const seen: { value: string; reason: string; event: Event | null }[] = [];
      const { container, fixture } = await render(
        `<form><input cckInput aria-label="Name" [(value)]="value" (valueChangeDetails)="seen.push($event)" /></form>`,
        { imports, componentProperties: { value, seen } },
      );
      const user = userEvent.setup();
      await user.type(textbox(), 'x');
      await user.tab();
      expect(textbox().value).toBe('startx');
      seen.length = 0;
      container.querySelector('form')?.reset();
      await nextTask();
      await fixture.whenStable();
      expect(textbox().value).toBe('start');
      expect(value()).toBe('start');
      expect(seen).toHaveLength(1);
      expect(seen[0]).toMatchObject({ value: 'start', reason: 'form-reset' });
      expect(seen[0]?.event?.type).toBe('reset');
      expect(isSet(textbox(), 'data-touched')).toBe(false);
      expect(isSet(textbox(), 'data-dirty')).toBe(false);
    });

    it('keeps the value when a listener cancels the reset', async () => {
      const onDetails = vi.fn();
      const { container } = await render(
        `<form (reset)="$event.preventDefault()"><input cckInput aria-label="Name" value="start" (valueChangeDetails)="onDetails($event)" /></form>`,
        { imports, componentProperties: { onDetails } },
      );
      await userEvent.setup().type(textbox(), 'x');
      onDetails.mockClear();
      container.querySelector('form')?.reset();
      await nextTask();
      expect(textbox().value).toBe('startx');
      expect(onDetails).not.toHaveBeenCalled();
    });

    it('re-targets submit and reset through the form attribute', async () => {
      const handler = onSubmit();
      const { fixture } = await render(
        `<form id="f" (submit)="handler($event)"></form><input cckInput form="f" aria-label="Name" value="start" />`,
        { imports, componentProperties: { handler } },
      );
      const form = must((fixture.nativeElement as HTMLElement).querySelector('form'));
      await userEvent.setup().type(textbox(), 'x');
      form.requestSubmit();
      await fixture.whenStable();
      expect(isSet(textbox(), 'data-submitted')).toBe(true);
      form.reset();
      await nextTask();
      await fixture.whenStable();
      expect(textbox().value).toBe('start');
      expect(isSet(textbox(), 'data-submitted')).toBe(false);
    });
  });

  describe('fieldset', () => {
    it('renders data-disabled on the Input and the field root under fieldset[disabled]', async () => {
      const { container, fixture } = await render(
        `<form><fieldset disabled><cck-form-field><input cckInput aria-label="Name" /></cck-form-field></fieldset></form>`,
        { imports },
      );
      await fixture.whenStable();
      expect(textbox().disabled).toBe(true);
      expect(isSet(textbox(), 'data-disabled')).toBe(true);
      expect(isSet(must(container.querySelector('.cck-form-field')), 'data-disabled')).toBe(true);
    });

    it('follows a change of the fieldset, and not a control in its first legend', async () => {
      const off = signal(true);
      const { fixture } = await render(
        `<form><fieldset [disabled]="off()"><legend><input cckInput aria-label="Legend" /></legend><input cckInput aria-label="Body" /></fieldset></form>`,
        { imports, componentProperties: { off } },
      );
      await fixture.whenStable();
      expect(isSet(screen.getByLabelText('Legend'), 'data-disabled')).toBe(false);
      expect(isSet(screen.getByLabelText('Body'), 'data-disabled')).toBe(true);
      off.set(false);
      await fixture.whenStable();
      await nextTask();
      await fixture.whenStable();
      expect(isSet(screen.getByLabelText('Body'), 'data-disabled')).toBe(false);
      expect(screen.getByLabelText<HTMLInputElement>('Body').disabled).toBe(false);
    });
  });

  describe('submit attempt', () => {
    it('gives an invalid untouched field aria-invalid and data-submitted, also for a canceled submit, and a reset clears it', async () => {
      const handler = onSubmit();
      const { container, fixture } = await render(
        `<form (submit)="handler($event)"><input cckInput invalid aria-label="Name" /></form>`,
        { imports, componentProperties: { handler } },
      );
      const form = container.querySelector('form');
      expect(isSet(textbox(), 'aria-invalid')).toBe(false);
      form?.requestSubmit();
      await fixture.whenStable();
      expect(handler).toHaveBeenCalledTimes(1);
      expect(textbox().getAttribute('aria-invalid')).toBe('true');
      expect(isSet(textbox(), 'data-submitted')).toBe(true);
      form?.reset();
      await nextTask();
      await fixture.whenStable();
      expect(isSet(textbox(), 'aria-invalid')).toBe(false);
      expect(isSet(textbox(), 'data-submitted')).toBe(false);
    });

    it('is not set by checkValidity or reportValidity', async () => {
      const { container, fixture } = await render(`<form><input cckInput required aria-label="Name" /></form>`, {
        imports,
      });
      container.querySelector('form')?.checkValidity();
      container.querySelector('form')?.reportValidity();
      await fixture.whenStable();
      expect(isSet(textbox(), 'data-submitted')).toBe(false);
    });
  });

  it('submits the form on Enter (implicit submission) and marks the attempt', async () => {
    const handler = onSubmit();
    await render(
      `<form (submit)="handler($event)"><input cckInput aria-label="Name" /><button type="submit">Go</button></form>`,
      { imports, componentProperties: { handler } },
    );
    await userEvent.setup().type(textbox(), 'a{Enter}');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(textbox().value).toBe('a');
  });
});
