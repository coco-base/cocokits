import { Component, Directive, booleanAttribute, input, model, output, signal } from '@angular/core';
import {
  DefaultValueAccessor,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  type ValidationErrors,
  type ValidatorFn,
} from '@angular/forms';
import { FormField, form, required as requiredRule } from '@angular/forms/signals';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckInput } from '../input';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

// `Validators.required` itself (Angular finds it by identity), typed as a plain function for the unbound-method rule.
const required = (Validators as unknown as { required: ValidatorFn }).required;

/**
 * The static host attribute `ngNoCva` makes `@angular/forms` bind a
 * `FormValueControl` on a native `input` through the custom-control path in reactive and template-driven
 * forms, with no ControlValueAccessor. A release of Angular that changes this fails here.
 *
 * The control is the smallest `FormValueControl` that declares the state inputs, so the test is about
 * Angular's mechanism and not about the Input.
 */
@Directive({
  selector: 'input[spike]',
  host: {
    ngNoCva: '',
    '[value]': 'value() ?? ""',
    '[disabled]': 'disabled()',
    '[attr.data-touched]': 'touched() ? "" : null',
    '[attr.data-dirty]': 'dirty() ? "" : null',
    '[attr.data-invalid]': 'invalid() ? "" : null',
    '[attr.data-pending]': 'pending() ? "" : null',
    '[attr.data-required]': 'required() ? "" : null',
    '[attr.data-errors]': 'errors().length',
    '(input)': 'onInput($event)',
    '(blur)': 'touch.emit()',
  },
})
class SpikeControl {
  readonly value = model<string | null | undefined>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly pending = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly dirty = input(false, { transform: booleanAttribute });
  readonly errors = input<readonly unknown[]>([]);
  readonly touch = output();

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}

@Component({
  imports: [ReactiveFormsModule, SpikeControl],
  template: `<form [formGroup]="group">
    <input spike formControlName="email" aria-label="Email" />
  </form>`,
})
class ReactiveHost {
  readonly email = new FormControl<string | null>('a@b.c', required);
  readonly group = new FormGroup({ email: this.email });
}

@Component({
  imports: [ReactiveFormsModule, SpikeControl],
  template: `<input spike [formControl]="control" aria-label="Email" />`,
})
class StandaloneHost {
  readonly control = new FormControl<string | null>('a@b.c', required);
}

@Component({
  imports: [FormsModule, SpikeControl],
  template: `<input spike [ngModel]="email()" (ngModelChange)="email.set($event)" aria-label="Email" />`,
})
class NgModelHost {
  readonly email = signal<string | null | undefined>('a@b.c');
}

@Component({
  imports: [FormField, SpikeControl],
  template: `<input spike [formField]="model.email" aria-label="Email" />`,
})
class SignalHost {
  readonly state = signal({ email: 'a@b.c' });
  readonly model = form(this.state, (path) => {
    requiredRule(path.email);
  });
}

@Component({
  imports: [ReactiveFormsModule, FormsModule, FormField, CckInput],
  template: `
    <form [formGroup]="group"><input cckInput formControlName="email" aria-label="Reactive" /></form>
    <input cckInput [formControl]="control" aria-label="Standalone" />
    <input cckInput [ngModel]="model()" aria-label="Template" />
    <input cckInput [formField]="signalForm.email" aria-label="Signal" />
  `,
})
class CckInputHost {
  readonly group = new FormGroup({ email: new FormControl<string | null>('a') });
  readonly control = new FormControl<string | null>('b');
  readonly model = signal<string | undefined>('c');
  readonly signalState = signal({ email: 'd' });
  readonly signalForm = form(this.signalState);
}

const accessorMethods = ['registerOnChange', 'registerOnTouched', 'writeValue', 'setDisabledState'] as const;

describe('ngNoCva spike', () => {
  const spies = new Map<string, MockInstance>();

  beforeEach(() => {
    for (const name of accessorMethods) spies.set(name, vi.spyOn(DefaultValueAccessor.prototype, name));
  });
  afterEach(() => {
    vi.restoreAllMocks();
    spies.clear();
  });

  const accessorWasUsed = (): string[] =>
    accessorMethods.filter((name) => (spies.get(name)?.mock.calls.length ?? 0) > 0);

  const input = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('textbox');

  describe('formControlName', () => {
    it('instantiates DefaultValueAccessor but never selects it', async () => {
      const { fixture } = await render(ReactiveHost);
      const accessor = fixture.debugElement.query((el) => el.name === 'input').injector.get(DefaultValueAccessor);
      expect(accessor).toBeInstanceOf(DefaultValueAccessor);
      expect(accessorWasUsed()).toEqual([]);
    });

    it('writes the control value, state and errors into the control, and never uses the accessor', async () => {
      const { fixture } = await render(ReactiveHost);
      const { email } = fixture.componentInstance;
      expect(input().value).toBe('a@b.c');
      expect(input().hasAttribute('data-required')).toBe(true);
      email.setValue('x@y.z');
      await fixture.whenStable();
      expect(input().value).toBe('x@y.z');
      email.setValue('');
      await fixture.whenStable();
      expect(input().hasAttribute('data-invalid')).toBe(true);
      expect(input().getAttribute('data-errors')).toBe('1');
      email.disable();
      await fixture.whenStable();
      expect(input().disabled).toBe(true);
      expect(accessorWasUsed()).toEqual([]);
    });

    it('takes typing and blur into the control, and reset back to the control', async () => {
      const { fixture } = await render(ReactiveHost);
      const { email } = fixture.componentInstance;
      const user = userEvent.setup();
      await user.type(input(), 'z');
      expect(email.value).toBe('a@b.cz');
      expect(email.dirty).toBe(true);
      await user.tab();
      expect(email.touched).toBe(true);
      await fixture.whenStable();
      expect(input().hasAttribute('data-touched')).toBe(true);
      email.reset();
      await fixture.whenStable();
      expect(input().value).toBe('');
      expect(input().hasAttribute('data-touched')).toBe(false);
      expect(input().hasAttribute('data-dirty')).toBe(false);
      expect(accessorWasUsed()).toEqual([]);
    });

    it('resets the control on a native reset of the form', async () => {
      const { fixture, container } = await render(ReactiveHost);
      const { email } = fixture.componentInstance;
      await userEvent.setup().type(input(), 'z');
      container.querySelector('form')?.reset();
      await fixture.whenStable();
      expect(email.value).toBeNull();
      expect(email.pristine).toBe(true);
      expect(accessorWasUsed()).toEqual([]);
    });
  });

  describe('[formControl]', () => {
    it('binds value, state, typing and blur without the accessor', async () => {
      const { fixture } = await render(StandaloneHost);
      const { control } = fixture.componentInstance;
      const user = userEvent.setup();
      expect(input().value).toBe('a@b.c');
      control.setValue('q');
      await fixture.whenStable();
      expect(input().value).toBe('q');
      await user.type(input(), 'r');
      expect(control.value).toBe('qr');
      expect(control.dirty).toBe(true);
      await user.tab();
      expect(control.touched).toBe(true);
      control.setErrors({ custom: true } satisfies ValidationErrors);
      await fixture.whenStable();
      expect(input().getAttribute('data-errors')).toBe('1');
      control.reset();
      await fixture.whenStable();
      expect(input().value).toBe('');
      expect(accessorWasUsed()).toEqual([]);
    });
  });

  describe('ngModel', () => {
    it('binds value, typing and blur without the accessor, and an unset model renders empty', async () => {
      const { fixture } = await render(NgModelHost);
      const user = userEvent.setup();
      await fixture.whenStable();
      expect(input().value).toBe('a@b.c');
      await user.type(input(), 'k');
      expect(fixture.componentInstance.email()).toBe('a@b.ck');
      fixture.componentInstance.email.set(undefined);
      await fixture.whenStable();
      expect(input().value).toBe('');
      expect(accessorWasUsed()).toEqual([]);
    });
  });

  describe('[formField]', () => {
    it('binds value, required state, typing and blur, with no accessor involved', async () => {
      const { fixture } = await render(SignalHost);
      const user = userEvent.setup();
      expect(input().value).toBe('a@b.c');
      expect(input().hasAttribute('data-required')).toBe(true);
      await user.type(input(), 'm');
      expect(fixture.componentInstance.state().email).toBe('a@b.cm');
      await user.tab();
      await fixture.whenStable();
      expect(input().hasAttribute('data-touched')).toBe(true);
      fixture.componentInstance.state.set({ email: '' });
      await fixture.whenStable();
      expect(input().hasAttribute('data-invalid')).toBe(true);
      expect(accessorWasUsed()).toEqual([]);
    });
  });

  describe('CckInput', () => {
    it('is bound by all four stacks with ngNoCva, and DefaultValueAccessor is never used', async () => {
      const { fixture } = await render(CckInputHost);
      await fixture.whenStable();
      const value = (label: string): string => screen.getByLabelText<HTMLInputElement>(label).value;
      expect([value('Reactive'), value('Standalone'), value('Template'), value('Signal')]).toEqual([
        'a',
        'b',
        'c',
        'd',
      ]);
      for (const input of (fixture.nativeElement as HTMLElement).querySelectorAll('input[cckInput]')) {
        expect(input.hasAttribute('ngNoCva')).toBe(true);
      }
      expect(accessorWasUsed()).toEqual([]);
    });
  });
});
