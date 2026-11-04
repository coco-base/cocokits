import { Component, signal } from '@angular/core';
import {
  DefaultValueAccessor,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  type ValidatorFn,
} from '@angular/forms';
import { FormField, FormRoot, disabled, form, readonly, required } from '@angular/forms/signals';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckTextarea, CckTextareaImports } from '../index';
import { isSet, must, nextTask, textarea } from './fixtures';

const requiredValidator = (Validators as unknown as { required: ValidatorFn }).required;
const imports = [ReactiveFormsModule, FormsModule, ...CckTextareaImports, ...CckFormFieldImports];

const onSubmit = (): ReturnType<typeof vi.fn> =>
  vi.fn((event: SubmitEvent) => {
    event.preventDefault();
  });

describe('Textarea in a real form', () => {
  it('puts the value into FormData under its name, with LF line breaks', async () => {
    const handler = onSubmit();
    const { container } = await render(
      `<form (submit)="handler($event)"><textarea cckTextarea name="note" aria-label="Note">a&#10;b</textarea></form>`,
      { imports, componentProperties: { handler } },
    );
    await userEvent.setup().type(textarea(), '{Enter}c');
    container.querySelector('form')?.requestSubmit();
    const event = handler.mock.calls[0]?.[0] as SubmitEvent;
    expect(new FormData(event.target as HTMLFormElement).get('note')).toBe(textarea().value);
    expect(textarea().value).toContain('\nc');
  });

  it('blocks checkValidity while required and empty, and passes once it has text', async () => {
    const { container } = await render(`<form><textarea cckTextarea required aria-label="Note"></textarea></form>`, {
      imports,
    });
    const form = container.querySelector('form');
    expect(form?.checkValidity()).toBe(false);
    await userEvent.setup().type(textarea(), 'x');
    expect(form?.checkValidity()).toBe(true);
  });

  it('restores the value at mount on reset, reports form-reset and clears touched and dirty', async () => {
    const value = signal('start');
    const seen: { value: string; reason: string }[] = [];
    const { container, fixture } = await render(
      `<form><textarea cckTextarea aria-label="Note" [(value)]="value" (valueChangeDetails)="seen.push($event)"></textarea></form>`,
      { imports, componentProperties: { value, seen } },
    );
    const user = userEvent.setup();
    await user.type(textarea(), 'x');
    await user.tab();
    seen.length = 0;
    container.querySelector('form')?.reset();
    await nextTask();
    await fixture.whenStable();
    expect(textarea().value).toBe('start');
    expect(value()).toBe('start');
    expect(seen).toEqual([expect.objectContaining({ value: 'start', reason: 'form-reset' })]);
    expect(isSet(textarea(), 'data-touched')).toBe(false);
    expect(isSet(textarea(), 'data-dirty')).toBe(false);
  });

  it('emits the LF form of a CRLF mount value on a native reset', async () => {
    const value = signal('a\r\nb');
    const seen: { value: string; reason: string }[] = [];
    const { container, fixture } = await render(
      `<form><textarea cckTextarea aria-label="Note" [(value)]="value" (valueChangeDetails)="seen.push($event)"></textarea></form>`,
      { imports, componentProperties: { value, seen } },
    );
    await userEvent.setup().type(textarea(), 'x');
    seen.length = 0;
    container.querySelector('form')?.reset();
    await nextTask();
    await fixture.whenStable();
    expect(textarea().value).toBe('a\nb');
    expect(seen).toEqual([expect.objectContaining({ value: 'a\nb', reason: 'form-reset' })]);
    expect(value()).toBe('a\nb');
  });

  it('renders data-disabled under fieldset[disabled]', async () => {
    const { fixture } = await render(
      `<form><fieldset disabled><textarea cckTextarea aria-label="Note"></textarea></fieldset></form>`,
      { imports },
    );
    await fixture.whenStable();
    expect(textarea().disabled).toBe(true);
    expect(isSet(textarea(), 'data-disabled')).toBe(true);
  });

  it('gives an invalid untouched field aria-invalid and data-submitted on a submit without blur', async () => {
    const handler = onSubmit();
    const { container, fixture } = await render(
      `<form (submit)="handler($event)"><textarea cckTextarea invalid aria-label="Note"></textarea></form>`,
      { imports, componentProperties: { handler } },
    );
    expect(isSet(textarea(), 'aria-invalid')).toBe(false);
    container.querySelector('form')?.requestSubmit();
    await fixture.whenStable();
    expect(textarea().getAttribute('aria-invalid')).toBe('true');
    expect(isSet(textarea(), 'data-submitted')).toBe(true);
    container.querySelector('form')?.reset();
    await nextTask();
    await fixture.whenStable();
    expect(isSet(textarea(), 'aria-invalid')).toBe(false);
    expect(isSet(textarea(), 'data-submitted')).toBe(false);
  });
});

@Component({
  imports,
  template: `
    <form [formGroup]="group">
      <textarea cckTextarea formControlName="note" aria-label="Note"></textarea>
    </form>
  `,
})
class ReactiveHost {
  readonly note = new FormControl<string | null>('hi', requiredValidator);
  readonly group = new FormGroup({ note: this.note });
}

@Component({
  imports,
  template: `<textarea cckTextarea [formControl]="control" aria-label="Note"></textarea>`,
})
class StandaloneHost {
  readonly control = new FormControl<string | null>('', requiredValidator);
}

@Component({
  imports,
  template: `<textarea cckTextarea [(ngModel)]="text" name="note" aria-label="Note"></textarea>`,
})
class ModelHost {
  text: string | null = 'start';
}

describe('Textarea with formControlName, [formControl] and ngModel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('never selects the DefaultValueAccessor and binds the value both ways', async () => {
    const used = ['writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState'].map((name) =>
      vi.spyOn(DefaultValueAccessor.prototype, name as 'writeValue'),
    );
    const { fixture } = await render(ReactiveHost);
    expect(used.flatMap((spy) => spy.mock.calls)).toEqual([]);
    expect(textarea().value).toBe('hi');
    await userEvent.setup().type(textarea(), '!');
    expect(fixture.componentInstance.note.value).toBe('hi!');
    fixture.componentInstance.note.setValue('model');
    await fixture.whenStable();
    expect(textarea().value).toBe('model');
  });

  it('names the textarea after the control path', async () => {
    await render(ReactiveHost);
    expect(textarea().name).toBe('note');
  });

  it('flows required, disabled, touched and dirty from the control', async () => {
    const { fixture } = await render(ReactiveHost);
    const control = fixture.componentInstance.note;
    control.setValue('');
    await fixture.whenStable();
    expect(isSet(textarea(), 'data-invalid')).toBe(true);
    expect(isSet(textarea(), 'aria-invalid')).toBe(false);
    const user = userEvent.setup();
    await user.click(textarea());
    await user.tab();
    await fixture.whenStable();
    expect(textarea().getAttribute('aria-invalid')).toBe('true');
    expect(isSet(textarea(), 'data-touched')).toBe(true);
    control.disable();
    await fixture.whenStable();
    expect(textarea().disabled).toBe(true);
  });

  it('clears aria-invalid and data-submitted on FormGroup.reset()', async () => {
    const { fixture, container } = await render(ReactiveHost);
    fixture.componentInstance.note.setValue('');
    container.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    expect(isSet(textarea(), 'data-submitted')).toBe(true);
    fixture.componentInstance.group.reset();
    await fixture.whenStable();
    expect(isSet(textarea(), 'aria-invalid')).toBe(false);
    expect(isSet(textarea(), 'data-submitted')).toBe(false);
  });

  it('binds [formControl] with no accessor', async () => {
    const { fixture } = await render(StandaloneHost);
    await userEvent.setup().type(textarea(), 'ab');
    expect(fixture.componentInstance.control.value).toBe('ab');
  });

  it('binds ngModel with no accessor', async () => {
    const { fixture } = await render(ModelHost);
    await fixture.whenStable();
    expect(textarea().value).toBe('start');
    await userEvent.setup().type(textarea(), '!');
    expect(fixture.componentInstance.text).toBe('start!');
  });

  it('is the CckTextarea directive', async () => {
    const { fixture } = await render(ReactiveHost);
    expect(fixture.debugElement.children[0]?.children[0]?.injector.get(CckTextarea)).toBeInstanceOf(CckTextarea);
  });
});

@Component({
  imports: [FormField, FormRoot, ...CckTextareaImports, ...CckFormFieldImports],
  template: `
    <form [formRoot]="f">
      <div cckFormField><textarea cckTextarea [formField]="f.note" aria-label="Note"></textarea></div>
    </form>
  `,
})
class SignalHost {
  readonly flags = signal({ required: false, disabled: false, readonly: false });
  readonly state = signal({ note: '' });
  readonly f = form(this.state, (path) => {
    required(path.note, { when: () => this.flags().required });
    disabled(path.note, { when: () => this.flags().disabled });
    readonly(path.note, { when: () => this.flags().readonly });
  });
}

describe('Textarea with Signal Forms [formField]', () => {
  it('updates the model on typing and shows the model', async () => {
    const { fixture } = await render(SignalHost);
    const host = fixture.componentInstance;
    await userEvent.setup().type(textarea(), 'ab');
    expect(host.state().note).toBe('ab');
    expect(host.f.note().dirty()).toBe(true);
    host.state.set({ note: 'from model' });
    await fixture.whenStable();
    expect(textarea().value).toBe('from model');
  });

  it('renders required(), disabled() and readonly() natively and names the textarea', async () => {
    const { fixture } = await render(SignalHost);
    fixture.componentInstance.flags.set({ required: true, disabled: true, readonly: true });
    await fixture.whenStable();
    expect(textarea().required).toBe(true);
    expect(textarea().disabled).toBe(true);
    expect(textarea().readOnly).toBe(true);
    expect(textarea().name).toMatch(/\.note$/);
    expect(isSet(must((fixture.nativeElement as HTMLElement).querySelector('.cck-form-field')), 'data-required')).toBe(
      true,
    );
  });

  it('field().reset() clears touched and dirty, and form().reset() clears the submitted fact', async () => {
    const { fixture, container } = await render(SignalHost);
    const host = fixture.componentInstance;
    host.flags.set({ required: true, disabled: false, readonly: false });
    await fixture.whenStable();
    const user = userEvent.setup();
    await user.type(textarea(), 'abc');
    await user.tab();
    host.f.note().reset('');
    await fixture.whenStable();
    expect(isSet(textarea(), 'data-touched')).toBe(false);
    expect(isSet(textarea(), 'data-dirty')).toBe(false);
    container.querySelector('form')?.requestSubmit();
    await fixture.whenStable();
    expect(textarea().getAttribute('aria-invalid')).toBe('true');
    host.f().reset();
    await fixture.whenStable();
    expect(isSet(textarea(), 'aria-invalid')).toBe(false);
    expect(isSet(textarea(), 'data-submitted')).toBe(false);
  });
});
