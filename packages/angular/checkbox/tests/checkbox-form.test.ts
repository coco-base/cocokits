import { signal } from '@angular/core';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CckCheckboxImports } from '../index';
import { box, isSet, must, nextTask } from './fixtures';

const imports = [...CckCheckboxImports];

/** What a submit event carries; the handler cancels it, as Angular and the forms libraries do. */
const onSubmit = (): ReturnType<typeof vi.fn> =>
  vi.fn((event: SubmitEvent) => {
    event.preventDefault();
  });

function data(form: HTMLFormElement | null): FormData {
  return new FormData(must(form));
}

describe('Checkbox in a real form', () => {
  it('submits on while checked, the submit value when given, and nothing while unchecked', async () => {
    const checked = signal(false);
    const { container, fixture } = await render(
      `<form><cck-checkbox name="a" [checked]="checked()">A</cck-checkbox><cck-checkbox name="b" submitValue="yes" [checked]="true">B</cck-checkbox></form>`,
      { imports, componentProperties: { checked } },
    );
    const form = container.querySelector('form');
    expect(data(form).has('a')).toBe(false);
    expect(data(form).get('b')).toBe('yes');
    checked.set(true);
    await fixture.whenStable();
    expect(data(form).get('a')).toBe('on');
  });

  it('blocks checkValidity while required and unchecked', async () => {
    const { container } = await render(`<form><cck-checkbox required>Accept</cck-checkbox></form>`, { imports });
    const form = container.querySelector('form');
    expect(form?.checkValidity()).toBe(false);
    await userEvent.setup().click(box());
    expect(form?.checkValidity()).toBe(true);
  });

  it('sets submitted on a submit attempt and marks aria-invalid', async () => {
    const handler = onSubmit();
    const { container, fixture } = await render(
      `<form (submit)="handler($event)"><cck-checkbox invalid>Accept</cck-checkbox></form>`,
      { imports, componentProperties: { handler } },
    );
    expect(isSet(box(), 'aria-invalid')).toBe(false);
    container.querySelector('form')?.requestSubmit();
    await fixture.whenStable();
    expect(box().getAttribute('aria-invalid')).toBe('true');
    expect(isSet(must(container.querySelector('.cck-checkbox')), 'data-submitted')).toBe(true);
  });

  describe('reset', () => {
    it('restores the value at mount, reports form-reset and clears touched, dirty and submitted', async () => {
      const checked = signal(true);
      const seen: { value: boolean; reason: string; event: Event | null }[] = [];
      const { container, fixture } = await render(
        `<form><cck-checkbox [(checked)]="checked" (checkedChangeDetails)="seen.push($event)">A</cck-checkbox></form>`,
        { imports, componentProperties: { checked, seen } },
      );
      const root = must(container.querySelector('.cck-checkbox'));
      const user = userEvent.setup();
      await user.click(box());
      await user.tab();
      expect(checked()).toBe(false);
      seen.length = 0;
      container.querySelector('form')?.reset();
      await nextTask();
      await fixture.whenStable();
      expect(box().checked).toBe(true);
      expect(checked()).toBe(true);
      expect(seen).toHaveLength(1);
      expect(seen[0]).toMatchObject({ value: true, reason: 'form-reset' });
      expect(seen[0]?.event?.type).toBe('reset');
      expect(isSet(root, 'data-touched')).toBe(false);
      expect(isSet(root, 'data-dirty')).toBe(false);
    });

    it('keeps the value when a listener cancels the reset', async () => {
      const onDetails = vi.fn();
      const checked = signal(false);
      const { container } = await render(
        `<form (reset)="$event.preventDefault()"><cck-checkbox [(checked)]="checked" (checkedChangeDetails)="onDetails($event)">A</cck-checkbox></form>`,
        { imports, componentProperties: { onDetails, checked } },
      );
      await userEvent.setup().click(box());
      onDetails.mockClear();
      container.querySelector('form')?.reset();
      await nextTask();
      expect(box().checked).toBe(true);
      expect(onDetails).not.toHaveBeenCalled();
    });

    it('re-targets submit and reset through the form attribute', async () => {
      const handler = onSubmit();
      const checked = signal(false);
      const { fixture } = await render(
        `<form id="f" (submit)="handler($event)"></form><cck-checkbox form="f" name="a" [(checked)]="checked">A</cck-checkbox>`,
        { imports, componentProperties: { handler, checked } },
      );
      const form = must((fixture.nativeElement as HTMLElement).querySelector('form'));
      await userEvent.setup().click(box());
      expect(data(form).get('a')).toBe('on');
      form.reset();
      await nextTask();
      await fixture.whenStable();
      expect(box().checked).toBe(false);
      expect(checked()).toBe(false);
    });
  });

  it('renders data-disabled from a disabling fieldset and disables the input natively', async () => {
    const disabled = signal(false);
    const { container, fixture } = await render(
      `<form><fieldset [disabled]="disabled()"><cck-checkbox>A</cck-checkbox></fieldset></form>`,
      { imports, componentProperties: { disabled } },
    );
    const root = must(container.querySelector('.cck-checkbox'));
    expect(isSet(root, 'data-disabled')).toBe(false);
    disabled.set(true);
    await fixture.whenStable();
    await nextTask();
    await fixture.whenStable();
    expect(isSet(root, 'data-disabled')).toBe(true);
    expect(box().disabled).toBe(true);
  });
});
