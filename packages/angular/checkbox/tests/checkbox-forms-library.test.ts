import { Component, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
  type ValidatorFn,
} from '@angular/forms';
import { viewChild } from '@angular/core';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CckCheckboxImports } from '../index';
import { box, isSet, nextTask } from './fixtures';

/** `Validators.requiredTrue` itself (Angular finds it by identity), typed as a plain function for the unbound-method rule. */
const requiredTrue = (Validators as unknown as { requiredTrue: ValidatorFn }).requiredTrue;

const imports = [ReactiveFormsModule, FormsModule, ...CckCheckboxImports];

@Component({
  imports,
  template: `
    <form [formGroup]="group">
      <div cckCheckbox formControlName="terms" (checkedChangeDetails)="emitted.update((n) => n + 1)">Accept</div>
    </form>
  `,
})
class ReactiveHost {
  readonly terms = new FormControl<boolean | null>(false, requiredTrue);
  readonly group = new FormGroup({ terms: this.terms });
  readonly emitted = signal(0);
}

@Component({
  imports,
  template: `<div cckCheckbox [formControl]="control">Accept</div>`,
})
class StandaloneHost {
  readonly control = new FormControl<boolean | null>(true);
}

@Component({
  imports,
  template: `
    <form>
      <div cckCheckbox name="terms" [(ngModel)]="terms">Accept</div>
    </form>
  `,
})
class TemplateHost {
  readonly terms: boolean | null | undefined = undefined;
  readonly ngForm = viewChild.required(NgForm);
}

@Component({
  imports,
  template: `
    <form [formGroup]="group">
      <div cckCheckbox formControlName="email">Email</div>
      <div cckCheckbox formControlName="own" name="custom">Own</div>
      <div formGroupName="prefs"><div cckCheckbox formControlName="email">Prefs</div></div>
      <div formArrayName="items"><div cckCheckbox [formControlName]="0">Item</div></div>
    </form>
  `,
})
class NamesHost {
  readonly group = new FormGroup({
    email: new FormControl(false),
    own: new FormControl(false),
    prefs: new FormGroup({ email: new FormControl(false) }),
    items: new FormArray([new FormControl(false)]),
  });
}

describe('Checkbox with reactive forms', () => {
  it('binds formControlName without a ControlValueAccessor: setValue, click, blur and disable', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { fixture } = await render(ReactiveHost);
    const { terms } = fixture.componentInstance;
    const user = userEvent.setup();
    expect(box().checked).toBe(false);
    terms.setValue(true);
    await fixture.whenStable();
    expect(box().checked).toBe(true);
    expect(fixture.componentInstance.emitted()).toBe(0);
    await user.click(box());
    expect(terms.value).toBe(false);
    expect(terms.dirty).toBe(true);
    await user.tab();
    expect(terms.touched).toBe(true);
    terms.disable();
    await fixture.whenStable();
    expect(box().disabled).toBe(true);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('is invalid with Validators.requiredTrue until checked', async () => {
    const { fixture } = await render(ReactiveHost);
    const { terms } = fixture.componentInstance;
    expect(terms.valid).toBe(false);
    expect(isSet(box(), 'aria-invalid')).toBe(false);
    await userEvent.setup().click(box());
    expect(terms.valid).toBe(true);
  });

  it('resets the control and the DOM on a native reset and leaves the emit alone', async () => {
    const { container, fixture } = await render(ReactiveHost);
    const { terms } = fixture.componentInstance;
    await userEvent.setup().click(box());
    fixture.componentInstance.emitted.set(0);
    container.querySelector('form')?.reset();
    await nextTask();
    await fixture.whenStable();
    expect(terms.value).toBeNull();
    expect(terms.pristine).toBe(true);
    expect(box().checked).toBe(false);
    expect(fixture.componentInstance.emitted()).toBe(0);
  });

  it('renders a nullable FormControl reset as unchecked', async () => {
    const { fixture } = await render(StandaloneHost);
    expect(box().checked).toBe(true);
    fixture.componentInstance.control.reset();
    await fixture.whenStable();
    expect(box().checked).toBe(false);
  });

  it('binds [formControl] with setValue and a click', async () => {
    const { fixture } = await render(StandaloneHost);
    const { control } = fixture.componentInstance;
    control.setValue(false);
    await fixture.whenStable();
    expect(box().checked).toBe(false);
    await userEvent.setup().click(box());
    expect(control.value).toBe(true);
    expect(control.dirty).toBe(true);
  });

  it('clears the submitted fact on FormControl.reset()', async () => {
    const { container, fixture } = await render(ReactiveHost);
    fixture.componentInstance.terms.setValue(false);
    container.querySelector('form')?.requestSubmit();
    await fixture.whenStable();
    expect(isSet(box(), 'aria-invalid')).toBe(true);
    fixture.componentInstance.terms.reset();
    await fixture.whenStable();
    expect(isSet(box(), 'aria-invalid')).toBe(false);
  });
});

describe('Checkbox with template-driven forms', () => {
  it('renders an unset ngModel unchecked, then follows the model and a click', async () => {
    const { fixture } = await render(TemplateHost);
    await fixture.whenStable();
    expect(box().checked).toBe(false);
    fixture.componentInstance.ngForm().form.get('terms')?.setValue(true);
    await fixture.whenStable();
    expect(box().checked).toBe(true);
    await userEvent.setup().click(box());
    expect(fixture.componentInstance.ngForm().form.get('terms')?.value).toBe(false);
    fixture.componentInstance.ngForm().form.get('terms')?.setValue(undefined);
    await fixture.whenStable();
    expect(box().checked).toBe(false);
  });
});

describe('Checkbox name from the forms control', () => {
  it('uses the control path and the author name wins', async () => {
    const { container } = await render(NamesHost);
    const names = [...container.querySelectorAll('input')].map((input) => input.getAttribute('name'));
    expect(names).toEqual(['email', 'custom', 'prefs.email', 'items.0']);
  });

  it('renders no name for [formControl]', async () => {
    await render(StandaloneHost);
    expect(box().hasAttribute('name')).toBe(false);
  });
});
