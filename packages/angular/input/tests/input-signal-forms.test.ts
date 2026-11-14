import { Component, resource, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  disabled,
  form,
  hidden,
  readonly,
  required,
  validate,
  validateAsync,
} from '@angular/forms/signals';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckLabelImports } from '@cocokits/angular/label';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckInputImports } from '../index';
import { isSet, must, textbox } from './fixtures';

interface Flags {
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  hidden: boolean;
  bad: boolean;
  slow: boolean;
}

const off: Flags = { required: false, disabled: false, readonly: false, hidden: false, bad: false, slow: false };

/** A Signal Forms form with one text field; the flags switch the rules on and off. */
@Component({
  imports: [FormField, FormRoot, CckInputImports, CckFormFieldImports, CckLabelImports],
  template: `
    <form [formRoot]="f">
      <cck-form-field>
        <label cckLabel>Email</label>
        @if (!f.email().hidden() || showHidden) {
          <input cckInput [formField]="f.email" />
        }
      </cck-form-field>
      <button type="submit">Send</button>
    </form>
  `,
})
class SignalHost {
  readonly flags = signal<Flags>({ ...off });
  readonly state = signal({ email: '' });
  readonly submitted = signal(0);
  showHidden = false;
  readonly f = form(
    this.state,
    (path) => {
      required(path.email, { when: () => this.flags().required });
      disabled(path.email, { when: () => this.flags().disabled });
      readonly(path.email, { when: () => this.flags().readonly });
      hidden(path.email, { when: () => this.flags().hidden });
      validate(path.email, (ctx) => (this.flags().bad && ctx.value() !== 'ok' ? { kind: 'bad' } : undefined));
      validateAsync(path.email, {
        params: (ctx) => (this.flags().slow && ctx.value() !== '' ? ctx.value() : undefined),
        factory: (params) =>
          resource({
            params: () => params(),
            loader: () => new Promise<string>(() => undefined),
          }),
        onSuccess: () => undefined,
        onError: () => undefined,
      });
    },
    {
      submission: {
        action: () => {
          this.submitted.update((n) => n + 1);
          return Promise.resolve();
        },
      },
    },
  );
}

async function mount(flags: Partial<Flags> = {}, showHidden = false) {
  const view = await render(SignalHost, {
    componentProperties: { flags: signal<Flags>({ ...off, ...flags }), showHidden },
  });
  await view.fixture.whenStable();
  return view;
}

describe('Input with Signal Forms [formField]', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates the model on typing, shows the model, and marks dirty', async () => {
    const { fixture } = await mount();
    const host = fixture.componentInstance;
    await userEvent.setup().type(textbox(), 'ab');
    expect(host.state().email).toBe('ab');
    expect(host.f.email().dirty()).toBe(true);
    host.state.set({ email: 'from model' });
    await fixture.whenStable();
    expect(textbox().value).toBe('from model');
    expect(isSet(textbox(), 'data-filled')).toBe(true);
  });

  it('renders required(), disabled() and readonly() natively', async () => {
    const { fixture } = await mount({ required: true, disabled: true, readonly: true });
    expect(textbox().required).toBe(true);
    expect(textbox().disabled).toBe(true);
    expect(textbox().readOnly).toBe(true);
    for (const name of ['data-required', 'data-disabled', 'data-readonly']) {
      expect(isSet(textbox(), name), name).toBe(true);
    }
    const field = must((fixture.nativeElement as HTMLElement).querySelector('.cck-form-field'));
    expect(isSet(field, 'data-required') && isSet(field, 'data-disabled')).toBe(true);
    expect(field.querySelector('.cck-label__required-marker')?.textContent).toBe('*');
  });

  it('renders hidden() natively on the Input and the field root, and warns in development', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { fixture } = await mount({ hidden: true }, true);
    expect((fixture.nativeElement as HTMLElement).querySelector('input')?.hidden).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.cck-form-field')?.hidden).toBe(true);
    expect(warn.mock.calls.some(([message]) => String(message).includes('hidden'))).toBe(true);
  });

  it('writes data-invalid at mount and aria-invalid only after blur', async () => {
    const { fixture } = await mount({ bad: true });
    expect(isSet(textbox(), 'data-invalid')).toBe(true);
    expect(isSet(textbox(), 'aria-invalid')).toBe(false);
    const user = userEvent.setup();
    await user.click(textbox());
    await user.tab();
    await fixture.whenStable();
    expect(textbox().getAttribute('aria-invalid')).toBe('true');
    expect(isSet(textbox(), 'data-touched')).toBe(true);
  });

  it('emits touch on blur, and the field state follows', async () => {
    const { fixture } = await mount();
    const user = userEvent.setup();
    expect(fixture.componentInstance.f.email().touched()).toBe(false);
    await user.click(textbox());
    await user.tab();
    expect(fixture.componentInstance.f.email().touched()).toBe(true);
  });

  it('renders an asynchronous validator as pending', async () => {
    await mount({ slow: true });
    await userEvent.setup().type(textbox(), 'a');
    // The resource never resolves, so the app never gets stable: poll instead of whenStable().
    await vi.waitFor(() => {
      expect(isSet(textbox(), 'data-pending')).toBe(true);
    });
  });

  it('gives an invalid field aria-invalid and data-submitted on a submit without any blur', async () => {
    const { container, fixture } = await mount({ bad: true });
    expect(isSet(textbox(), 'aria-invalid')).toBe(false);
    container.querySelector('form')?.requestSubmit();
    await fixture.whenStable();
    expect(isSet(textbox(), 'data-submitted')).toBe(true);
    expect(textbox().getAttribute('aria-invalid')).toBe('true');
  });

  it('field().reset() sets the value and clears touched and dirty', async () => {
    const { fixture } = await mount();
    const host = fixture.componentInstance;
    const user = userEvent.setup();
    await user.type(textbox(), 'abc');
    await user.tab();
    host.f.email().reset('');
    await fixture.whenStable();
    expect(textbox().value).toBe('');
    expect(host.state().email).toBe('');
    expect(isSet(textbox(), 'data-touched')).toBe(false);
    expect(isSet(textbox(), 'data-dirty')).toBe(false);
  });

  it('form().reset() removes aria-invalid and data-submitted from an untouched empty required field', async () => {
    const { container, fixture } = await mount({ required: true });
    container.querySelector('form')?.requestSubmit();
    await fixture.whenStable();
    expect(textbox().getAttribute('aria-invalid')).toBe('true');
    expect(isSet(textbox(), 'data-submitted')).toBe(true);
    fixture.componentInstance.f().reset();
    await fixture.whenStable();
    expect(isSet(textbox(), 'aria-invalid')).toBe(false);
    expect(isSet(textbox(), 'data-submitted')).toBe(false);
  });

  it('names the input from Signal Forms and lets a native reset leave the model alone', async () => {
    const { container, fixture } = await mount();
    expect(textbox().name).toMatch(/\.email$/);
    await userEvent.setup().type(textbox(), 'abc');
    container.querySelector('form')?.reset();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await fixture.whenStable();
    expect(fixture.componentInstance.state().email).toBe('abc');
    expect(textbox().value).toBe('abc');
  });
});
