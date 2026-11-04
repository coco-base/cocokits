import { Component, viewChild, signal, type ElementRef } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { injectFormParticipation } from '../src/index';

function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}

@Component({ selector: 'input[testParticipation]', template: '' })
class TestInput {
  readonly model = signal('model');
  readonly resets: Event[] = [];
  readonly participation = injectFormParticipation({
    getValue: () => this.model(),
    onReset: (event) => this.resets.push(event),
  });
}

@Component({
  imports: [TestInput],
  template: `
    <form (submit)="$event.preventDefault()">
      <fieldset [attr.disabled]="disabled() ? '' : null">
        @if (shown()) {
          <input testParticipation value="start" />
        }
      </fieldset>
    </form>
  `,
})
class Host {
  readonly shown = signal(true);
  readonly disabled = signal(false);
}

const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

async function mount(): Promise<{ fixture: ComponentFixture<Host>; root: HTMLElement; input: HTMLInputElement }> {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  return { fixture, root, input: must(root.querySelector('input')) };
}

function instanceOf(fixture: ComponentFixture<Host>): TestInput {
  const debug = fixture.debugElement.query((node) => node.componentInstance instanceof TestInput);
  return debug.componentInstance as TestInput;
}

afterEach(() => {
  vi.restoreAllMocks();
  TestBed.resetTestingModule();
});

describe('injectFormParticipation', () => {
  it('starts with false signals and creates the instance after the first render', async () => {
    const { fixture } = await mount();
    const { participation } = instanceOf(fixture);
    expect(participation.fieldsetDisabled()).toBe(false);
    expect(participation.submitted()).toBe(false);
  });

  it('syncValue writes the model to the host', async () => {
    const { fixture, input } = await mount();
    const component = instanceOf(fixture);
    component.participation.syncValue();
    expect(input.value).toBe('model');
    component.model.set('next');
    component.participation.syncValue();
    expect(input.value).toBe('next');
  });

  it('follows the fieldset', async () => {
    const { fixture } = await mount();
    const { participation } = instanceOf(fixture);
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    await nextTask();
    expect(participation.fieldsetDisabled()).toBe(true);
    fixture.componentInstance.disabled.set(false);
    await fixture.whenStable();
    await nextTask();
    expect(participation.fieldsetDisabled()).toBe(false);
  });

  it('reports a submit, then an uncanceled reset calls onReset, syncs and clears submitted', async () => {
    const { fixture, root, input } = await mount();
    const component = instanceOf(fixture);
    const form = must(root.querySelector('form'));
    form.requestSubmit();
    expect(component.participation.submitted()).toBe(true);
    input.value = 'typed';
    form.reset();
    await nextTask();
    expect(component.resets).toHaveLength(1);
    expect(input.value).toBe('model');
    expect(component.participation.submitted()).toBe(false);
  });

  it('clearSubmitted clears submitted without a reset, and the next submit sets it again', async () => {
    const { fixture, root } = await mount();
    const { participation } = instanceOf(fixture);
    const form = must(root.querySelector('form'));
    form.requestSubmit();
    expect(participation.submitted()).toBe(true);
    participation.clearSubmitted();
    expect(participation.submitted()).toBe(false);
    form.requestSubmit();
    expect(participation.submitted()).toBe(true);
  });

  it('cleans up with the host while the form stays in the document: no report, and syncValue is a no-op', async () => {
    const { fixture, root } = await mount();
    const component = instanceOf(fixture);
    const form = must(root.querySelector('form'));
    const removed = vi.spyOn(document, 'removeEventListener');
    fixture.componentInstance.shown.set(false);
    await fixture.whenStable();
    expect(removed.mock.calls.map(([type]) => type)).toEqual(expect.arrayContaining(['reset', 'submit']));
    expect(form.isConnected).toBe(true);
    expect(form.querySelector('input')).toBeNull();
    form.reset();
    await nextTask();
    expect(component.resets).toHaveLength(0);
    expect(() => {
      component.participation.syncValue();
    }).not.toThrow();
  });
});

@Component({
  selector: 'input[testChecked]',
  template: '',
})
class TestChecked {
  readonly model = signal(true);
  readonly resets: Event[] = [];
  readonly unchecked: Event[] = [];
  readonly participation = injectFormParticipation({
    getChecked: () => this.model(),
    onReset: (event) => this.resets.push(event),
    onUncheckedByGroup: (event) => this.unchecked.push(event),
  });
}

@Component({
  selector: 'span[testInner]',
  template: '<input #inner type="radio" name="g" />',
})
class TestInner {
  private readonly inner = viewChild.required<ElementRef<HTMLInputElement>>('inner');
  readonly model = signal(true);
  readonly unchecked: Event[] = [];
  readonly participation = injectFormParticipation({
    getChecked: () => this.model(),
    onUncheckedByGroup: (event) => this.unchecked.push(event),
    element: () => this.inner().nativeElement,
  });
}

@Component({
  imports: [TestChecked, TestInner],
  template: `
    <form>
      <input testChecked type="checkbox" />
      <span testInner></span>
      <input id="other" type="radio" name="g" />
    </form>
  `,
})
class CheckedHost {
  readonly ready = true;
}

describe('injectFormParticipation in checked mode', () => {
  async function mountChecked(): Promise<{
    fixture: ComponentFixture<CheckedHost>;
    root: HTMLElement;
    checked: TestChecked;
    inner: TestInner;
  }> {
    const fixture = TestBed.createComponent(CheckedHost);
    await fixture.whenStable();
    const find = <T>(type: new (...args: never[]) => T): T =>
      fixture.debugElement.query((node) => node.componentInstance instanceof type).componentInstance as T;
    return {
      fixture,
      root: fixture.nativeElement as HTMLElement,
      checked: find(TestChecked),
      inner: find(TestInner),
    };
  }

  it('syncValue writes the model to .checked of the host', async () => {
    const { root, checked } = await mountChecked();
    const box = must(root.querySelector<HTMLInputElement>('input[type=checkbox]'));
    checked.participation.syncValue();
    expect(box.checked).toBe(true);
    checked.model.set(false);
    checked.participation.syncValue();
    expect(box.checked).toBe(false);
  });

  it('calls onReset once after an uncanceled reset and syncs the model', async () => {
    const { root, checked } = await mountChecked();
    const box = must(root.querySelector<HTMLInputElement>('input[type=checkbox]'));
    box.checked = false;
    must(root.querySelector('form')).reset();
    await nextTask();
    expect(checked.resets).toHaveLength(1);
    expect(box.checked).toBe(true);
  });

  it('binds the input that the element option returns, not the host', async () => {
    const { root, inner } = await mountChecked();
    const radio = must(root.querySelector<HTMLInputElement>('span[testInner] input'));
    radio.checked = false;
    inner.participation.syncValue();
    expect(radio.checked).toBe(true);
  });

  it('reports a radio that another radio of its group unchecked', async () => {
    const { root, inner } = await mountChecked();
    const radio = must(root.querySelector<HTMLInputElement>('span[testInner] input'));
    radio.checked = true;
    const other = must(root.querySelector<HTMLInputElement>('#other'));
    other.checked = true;
    other.dispatchEvent(new Event('change', { bubbles: true }));
    expect(inner.unchecked).toHaveLength(1);
  });
});
