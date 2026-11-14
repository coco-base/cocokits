import { Component, signal, viewChild } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  type AsyncValidatorFn,
} from '@angular/forms';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CckInputImports } from '../index';
import { isSet, nextTask, requiredValidator, textbox } from './fixtures';

const imports = [ReactiveFormsModule, FormsModule, ...CckInputImports, ...CckFormFieldImports];

/** A reactive form with one required, nullable control. */
@Component({
  imports,
  template: `
    <form [formGroup]="group" (ngSubmit)="submits.update((n) => n + 1)">
      <cck-form-field>
        <input
          cckInput
          formControlName="email"
          aria-label="Email"
          (valueChangeDetails)="emitted.update((n) => n + 1)"
        />
      </cck-form-field>
    </form>
  `,
})
class ReactiveHost {
  readonly email = new FormControl<string | null>('a@b.c', requiredValidator);
  readonly group = new FormGroup({ email: this.email });
  readonly submits = signal(0);
  readonly emitted = signal(0);
  readonly directive = viewChild.required(FormGroupDirective);
}

@Component({
  imports,
  template: `<input cckInput [formControl]="control" aria-label="Email" />`,
})
class StandaloneHost {
  readonly control = new FormControl<string | null>('start');
}

@Component({
  imports,
  template: `
    <form #f="ngForm" (ngSubmit)="submits.update((n) => n + 1)">
      <input cckInput name="email" [(ngModel)]="email" required aria-label="Email" />
    </form>
  `,
})
class TemplateHost {
  readonly email: string | null | undefined = undefined;
  readonly submits = signal(0);
  readonly ngForm = viewChild.required(NgForm);
}

@Component({
  imports,
  template: `<input cckInput [ngModel]="email()" (ngModelChange)="email.set($event)" aria-label="Email" />`,
})
class StandaloneModelHost {
  readonly email = signal<string | null | undefined>(undefined);
}

@Component({
  imports,
  template: `
    <form [formGroup]="group">
      <input cckInput formControlName="email" aria-label="Email" />
      <input cckInput formControlName="own" name="custom" aria-label="Own" />
      <div formGroupName="address"><input cckInput formControlName="street" aria-label="Street" /></div>
      <div formArrayName="items">
        <div [formGroupName]="0"><input cckInput formControlName="name" aria-label="Item" /></div>
      </div>
    </form>
  `,
})
class NamesHost {
  readonly group = new FormGroup({
    email: new FormControl(''),
    own: new FormControl(''),
    address: new FormGroup({ street: new FormControl('') }),
    items: new FormArray([new FormGroup({ name: new FormControl('') })]),
  });
}

const neverResolves: AsyncValidatorFn = () => new Subject<null>();

describe('Input with reactive forms', () => {
  it('binds formControlName without a ControlValueAccessor: setValue, typing, blur and disable', async () => {
    const { fixture } = await render(ReactiveHost);
    const { email } = fixture.componentInstance;
    const user = userEvent.setup();
    expect(textbox().value).toBe('a@b.c');
    expect(isSet(textbox(), 'data-filled')).toBe(true);
    expect(textbox().required).toBe(true);
    email.setValue('x@y.z');
    await fixture.whenStable();
    expect(textbox().value).toBe('x@y.z');
    await user.type(textbox(), '!');
    expect(email.value).toBe('x@y.z!');
    expect(email.dirty).toBe(true);
    await user.tab();
    expect(email.touched).toBe(true);
    await fixture.whenStable();
    expect(isSet(textbox(), 'data-touched')).toBe(true);
    email.disable();
    await fixture.whenStable();
    expect(textbox().disabled).toBe(true);
    expect(isSet(textbox(), 'data-disabled')).toBe(true);
  });

  it('renders errors as invalid and pending for an asynchronous validator', async () => {
    const { fixture } = await render(ReactiveHost);
    const { email } = fixture.componentInstance;
    email.setValue('');
    await fixture.whenStable();
    expect(isSet(textbox(), 'data-invalid')).toBe(true);
    expect(isSet(textbox(), 'aria-invalid')).toBe(false);
    email.setAsyncValidators(neverResolves);
    email.setValue('a');
    await fixture.whenStable();
    expect(isSet(textbox(), 'data-pending')).toBe(true);
  });

  it('keeps the control pristine and leaves the emit alone on a native reset, and resets the DOM', async () => {
    const { container, fixture } = await render(ReactiveHost);
    const { email, emitted } = fixture.componentInstance;
    await userEvent.setup().type(textbox(), 'z');
    emitted.set(0);
    container.querySelector('form')?.reset();
    await nextTask();
    await fixture.whenStable();
    expect(email.value).toBeNull();
    expect(email.pristine).toBe(true);
    expect(textbox().value).toBe('');
    expect(isSet(textbox(), 'data-filled')).toBe(false);
    expect(emitted()).toBe(0);
  });

  it('renders a nullable FormControl reset as empty and not filled', async () => {
    const { fixture } = await render(StandaloneHost);
    expect(textbox().value).toBe('start');
    fixture.componentInstance.control.reset();
    await fixture.whenStable();
    expect(textbox().value).toBe('');
    expect(isSet(textbox(), 'data-filled')).toBe(false);
  });

  it('binds [formControl] with setValue, typing and blur', async () => {
    const { fixture } = await render(StandaloneHost);
    const { control } = fixture.componentInstance;
    control.setValue('next');
    await fixture.whenStable();
    expect(textbox().value).toBe('next');
    const user = userEvent.setup();
    await user.type(textbox(), '!');
    expect(control.value).toBe('next!');
    await user.tab();
    expect(control.touched).toBe(true);
  });

  describe('submit attempt', () => {
    it('gives an invalid untouched field aria-invalid and data-submitted (formGroup), and a native reset clears it', async () => {
      const { container, fixture } = await render(ReactiveHost);
      fixture.componentInstance.email.setValue('');
      await fixture.whenStable();
      expect(isSet(textbox(), 'aria-invalid')).toBe(false);
      container.querySelector('form')?.requestSubmit();
      await fixture.whenStable();
      expect(fixture.componentInstance.submits()).toBe(1);
      expect(textbox().getAttribute('aria-invalid')).toBe('true');
      expect(isSet(textbox(), 'data-submitted')).toBe(true);
      container.querySelector('form')?.reset();
      await nextTask();
      await fixture.whenStable();
      expect(isSet(textbox(), 'data-submitted')).toBe(false);
      expect(isSet(textbox(), 'aria-invalid')).toBe(false);
    });

    it('does the same with NgForm', async () => {
      const { container, fixture } = await render(TemplateHost);
      await fixture.whenStable();
      fixture.componentInstance.ngForm().form.get('email')?.setErrors({ custom: true });
      await fixture.whenStable();
      container.querySelector('form')?.requestSubmit();
      await fixture.whenStable();
      expect(textbox().getAttribute('aria-invalid')).toBe('true');
      expect(isSet(textbox(), 'data-submitted')).toBe(true);
      container.querySelector('form')?.reset();
      await nextTask();
      await fixture.whenStable();
      expect(isSet(textbox(), 'data-submitted')).toBe(false);
    });

    it.each([
      [
        'FormGroup.reset()',
        (host: ReactiveHost) => {
          host.group.reset();
        },
      ],
      [
        'FormControl.reset()',
        (host: ReactiveHost) => {
          host.email.reset();
        },
      ],
      [
        'FormGroupDirective.resetForm()',
        (host: ReactiveHost) => {
          host.directive().resetForm();
        },
      ],
    ])('%s removes aria-invalid and data-submitted from an untouched empty required field', async (_name, reset) => {
      const { container, fixture } = await render(ReactiveHost);
      fixture.componentInstance.email.setValue('');
      await fixture.whenStable();
      container.querySelector('form')?.requestSubmit();
      await fixture.whenStable();
      expect(isSet(textbox(), 'data-submitted')).toBe(true);
      reset(fixture.componentInstance);
      await fixture.whenStable();
      expect(isSet(textbox(), 'data-submitted')).toBe(false);
      expect(isSet(textbox(), 'aria-invalid')).toBe(false);
    });

    it('NgForm.resetForm() removes them too', async () => {
      const { container, fixture } = await render(TemplateHost);
      await fixture.whenStable();
      fixture.componentInstance.ngForm().form.get('email')?.setErrors({ custom: true });
      await fixture.whenStable();
      container.querySelector('form')?.requestSubmit();
      await fixture.whenStable();
      expect(isSet(textbox(), 'data-submitted')).toBe(true);
      fixture.componentInstance.ngForm().resetForm();
      await fixture.whenStable();
      expect(isSet(textbox(), 'data-submitted')).toBe(false);
      expect(isSet(textbox(), 'aria-invalid')).toBe(false);
    });
  });
});

describe('Input with template-driven forms', () => {
  // A tripwire for the documented limit: Angular 22 does not apply the validator directives
  // (`required`, `minlength`, ...) to a control it binds through the custom-control path, so the attribute
  // makes the Input `required` natively and in the field but not the `NgModel` invalid.
  it('shows the required attribute but does not get an invalid control from it', async () => {
    const { fixture } = await render(TemplateHost);
    await fixture.whenStable();
    expect(textbox().required).toBe(true);
    expect(fixture.componentInstance.ngForm().form.get('email')?.valid).toBe(true);
  });

  it('renders an unset ngModel empty, then follows the model and typing', async () => {
    const { fixture } = await render(StandaloneModelHost);
    await fixture.whenStable();
    expect(textbox().value).toBe('');
    expect(isSet(textbox(), 'data-filled')).toBe(false);
    fixture.componentInstance.email.set('set');
    await fixture.whenStable();
    expect(textbox().value).toBe('set');
    await userEvent.setup().type(textbox(), '!');
    expect(fixture.componentInstance.email()).toBe('set!');
    fixture.componentInstance.email.set(undefined);
    await fixture.whenStable();
    expect(textbox().value).toBe('');
  });
});

describe('Input name from the forms control', () => {
  it('uses the control path, never the template-driven standalone or [formControl] case, and the author name wins', async () => {
    const { container } = await render(NamesHost);
    const named = (label: string): string | null =>
      container.querySelector(`[aria-label="${label}"]`)?.getAttribute('name') ?? null;
    expect(named('Email')).toBe('email');
    expect(named('Own')).toBe('custom');
    expect(named('Street')).toBe('address.street');
    expect(named('Item')).toBe('items.0.name');
  });

  it('renders no name for [formControl]', async () => {
    await render(StandaloneHost);
    expect(textbox().hasAttribute('name')).toBe(false);
  });

  it('renders no name for a standalone ngModel', async () => {
    const { fixture } = await render(StandaloneModelHost);
    await fixture.whenStable();
    expect(textbox().hasAttribute('name')).toBe(false);
  });

  it('does not warn about a missing value accessor', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await render(ReactiveHost);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
