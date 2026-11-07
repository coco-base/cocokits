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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckCheckboxImports } from '../index';
import { box, isSet, must } from './fixtures';

interface Flags {
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  hidden: boolean;
  bad: boolean;
  slow: boolean;
}

const off: Flags = { required: false, disabled: false, readonly: false, hidden: false, bad: false, slow: false };

/** A Signal Forms form with one boolean field; the flags switch the rules on and off. */
@Component({
  imports: [FormField, FormRoot, CckCheckboxImports],
  template: `
    <form [formRoot]="f">
      @if (!f.terms().hidden() || showHidden) {
        <div cckCheckbox [formField]="f.terms" submitValue="yes">Accept</div>
      }
      <button type="submit">Send</button>
    </form>
  `,
})
class SignalHost {
  readonly flags = signal<Flags>({ ...off });
  readonly state = signal({ terms: false });
  readonly submitted = signal(0);
  showHidden = false;
  readonly f = form(
    this.state,
    (path) => {
      required(path.terms, { when: () => this.flags().required });
      disabled(path.terms, { when: () => this.flags().disabled });
      readonly(path.terms, { when: () => this.flags().readonly });
      hidden(path.terms, { when: () => this.flags().hidden });
      validate(path.terms, (ctx) => (this.flags().bad && !ctx.value() ? { kind: 'bad' } : undefined));
      validateAsync(path.terms, {
        params: (ctx) => (this.flags().slow && ctx.value() ? true : undefined),
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

describe('Checkbox with Signal Forms [formField]', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates the model on a click, shows the model, and marks dirty', async () => {
    const { fixture } = await mount();
    const host = fixture.componentInstance;
    await userEvent.setup().click(box());
    expect(host.state().terms).toBe(true);
    expect(host.f.terms().dirty()).toBe(true);
    host.state.set({ terms: false });
    await fixture.whenStable();
    expect(box().checked).toBe(false);
    host.state.set({ terms: true });
    await fixture.whenStable();
    expect(box().checked).toBe(true);
  });

  it('puts the submit value into FormData', async () => {
    const { container, fixture } = await mount();
    await userEvent.setup().click(box());
    await fixture.whenStable();
    expect(new FormData(must(container.querySelector('form'))).get(box().name)).toBe('yes');
  });

  it('renders required(), disabled() and readonly()', async () => {
    const { container } = await mount({ required: true, disabled: true, readonly: true });
    expect(box().required).toBe(true);
    expect(box().disabled).toBe(true);
    expect(box().getAttribute('aria-readonly')).toBe('true');
    const root = must(container.querySelector('.cck-checkbox'));
    for (const name of ['data-required', 'data-disabled', 'data-readonly']) {
      expect(isSet(root, name), name).toBe(true);
    }
  });

  it('treats a false boolean as missing for required()', async () => {
    const { fixture } = await mount({ required: true });
    const host = fixture.componentInstance;
    expect(host.f.terms().valid()).toBe(false);
    await userEvent.setup().click(box());
    expect(host.f.terms().valid()).toBe(true);
  });

  it('renders hidden() natively on the root and warns in development', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = await mount({ hidden: true }, true);
    expect(isSet(must(container.querySelector('.cck-checkbox')), 'hidden')).toBe(true);
    expect(warn).toHaveBeenCalled();
  });

  it('renders errors as invalid and gates aria-invalid until touched', async () => {
    const { container, fixture } = await mount({ bad: true });
    const root = must(container.querySelector('.cck-checkbox'));
    expect(isSet(root, 'data-invalid')).toBe(true);
    expect(isSet(box(), 'aria-invalid')).toBe(false);
    box().focus();
    box().blur();
    await fixture.whenStable();
    expect(box().getAttribute('aria-invalid')).toBe('true');
  });

  it('renders an asynchronous validator as pending', async () => {
    const { container } = await mount({ slow: true });
    await userEvent.setup().click(box());
    // The resource never resolves, so the app never gets stable: poll instead of whenStable().
    await vi.waitFor(() => {
      expect(isSet(must(container.querySelector('.cck-checkbox')), 'data-pending')).toBe(true);
    });
  });

  it('emits touch on blur and marks the field touched', async () => {
    const { fixture } = await mount();
    box().focus();
    box().blur();
    expect(fixture.componentInstance.f.terms().touched()).toBe(true);
  });

  it('updates the DOM on field().reset()', async () => {
    const { fixture } = await mount();
    const host = fixture.componentInstance;
    await userEvent.setup().click(box());
    expect(box().checked).toBe(true);
    host.f.terms().reset(false);
    await fixture.whenStable();
    expect(box().checked).toBe(false);
    expect(host.f.terms().dirty()).toBe(false);
  });

  it('uses the field name as the input name', async () => {
    await mount();
    expect(box().name).toMatch(/terms$/);
  });
});
