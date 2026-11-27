// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFormParticipation, type FormParticipation } from '../index';
import { must, nextTask } from './helpers';

let host: HTMLElement;
let created: FormParticipation[] = [];

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
});

afterEach(() => {
  for (const instance of created) instance.destroy();
  created = [];
  host.remove();
});

function track(instance: FormParticipation): FormParticipation {
  created.push(instance);
  return instance;
}

function mountForm(markup = '<input type="checkbox" name="a" checked />'): {
  form: HTMLFormElement;
  input: HTMLInputElement;
} {
  host.innerHTML = `<form id="f">${markup}<button type="reset">reset</button></form>`;
  const form = must(host.querySelector('form'));
  return { form, input: must(form.querySelector('input')) };
}

describe('createFormParticipation: checked mode', () => {
  it('syncValue writes getChecked() when it differs and leaves an equal state alone', () => {
    const { input } = mountForm();
    let model = false;
    const participation = track(createFormParticipation({ element: input, getChecked: () => model }));
    participation.syncValue();
    expect(input.checked).toBe(false);
    const setter = vi.spyOn(input, 'checked', 'set');
    participation.syncValue();
    expect(setter).not.toHaveBeenCalled();
    model = true;
    participation.syncValue();
    expect(input.checked).toBe(true);
  });

  it('does nothing after destroy', () => {
    const { input } = mountForm();
    const participation = createFormParticipation({ element: input, getChecked: () => false });
    participation.destroy();
    participation.syncValue();
    expect(input.checked).toBe(true);
  });

  it('calls onReset once after the browser reset, then syncs the DOM to the model', async () => {
    const { form, input } = mountForm();
    input.checked = false;
    const seen: boolean[] = [];
    track(
      createFormParticipation({
        element: input,
        getChecked: () => false,
        onReset: () => seen.push(input.checked),
      }),
    );
    form.reset();
    expect(seen).toEqual([]);
    await nextTask();
    expect(seen).toEqual([true]);
    expect(input.checked).toBe(false);
  });

  it('reports nothing for a canceled reset or a reset of another form', async () => {
    const { form, input } = mountForm();
    input.checked = false;
    const other = document.createElement('form');
    host.append(other);
    const onReset = vi.fn();
    track(createFormParticipation({ element: input, getChecked: () => true, onReset }));
    form.addEventListener('reset', (e) => {
      e.preventDefault();
    });
    form.reset();
    other.reset();
    await nextTask();
    expect(onReset).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
  });

  it('adds no change listener without onUncheckedByGroup', () => {
    const { input } = mountForm();
    const add = vi.spyOn(document, 'addEventListener');
    createFormParticipation({ element: input, getChecked: () => true }).destroy();
    expect(add.mock.calls.map(([type]) => type)).toEqual(['reset', 'submit']);
    add.mockRestore();
  });
});

describe('createFormParticipation: onUncheckedByGroup', () => {
  const radios = (markup: string): HTMLInputElement[] => {
    host.innerHTML = markup;
    return Array.from(host.querySelectorAll('input'));
  };
  const group = '<input type="radio" name="g" checked /><input type="radio" name="g" />';

  it('reports with the other radio change event when the user checks it', () => {
    const [a, b] = radios(group);
    const onUncheckedByGroup = vi.fn();
    track(createFormParticipation({ element: must(a), getChecked: () => true, onUncheckedByGroup }));
    must(b).click();
    expect(onUncheckedByGroup).toHaveBeenCalledTimes(1);
    const event = onUncheckedByGroup.mock.calls[0]?.[0] as Event;
    expect(event.type).toBe('change');
    expect(event.target).toBe(b);
  });

  it('does not report for another name, a checkbox or itself', () => {
    const [a, other, box] = radios(
      '<input type="radio" name="g" checked /><input type="radio" name="x" /><input type="checkbox" name="g" />',
    );
    const onUncheckedByGroup = vi.fn();
    track(createFormParticipation({ element: must(a), getChecked: () => true, onUncheckedByGroup }));
    must(other).click();
    must(box).click();
    must(a).click();
    expect(onUncheckedByGroup).not.toHaveBeenCalled();
  });

  it('does not report for an empty name', () => {
    const [a, b] = radios('<input type="radio" checked /><input type="radio" />');
    const onUncheckedByGroup = vi.fn();
    track(createFormParticipation({ element: must(a), getChecked: () => true, onUncheckedByGroup }));
    must(b).click();
    expect(onUncheckedByGroup).not.toHaveBeenCalled();
  });

  it('does not report for a radio of another form', () => {
    host.innerHTML = '<form><input type="radio" name="g" checked /></form><form><input type="radio" name="g" /></form>';
    const [a, b] = Array.from(host.querySelectorAll('input'));
    const onUncheckedByGroup = vi.fn();
    track(createFormParticipation({ element: must(a), getChecked: () => true, onUncheckedByGroup }));
    must(b).click();
    expect(onUncheckedByGroup).not.toHaveBeenCalled();
  });

  it('does not report when the element is still checked', () => {
    const [a, b] = radios(group);
    const onUncheckedByGroup = vi.fn();
    track(createFormParticipation({ element: must(a), getChecked: () => true, onUncheckedByGroup }));
    must(b).dispatchEvent(new Event('change', { bubbles: true }));
    expect(onUncheckedByGroup).not.toHaveBeenCalled();
  });

  it('does not report for a radio in another shadow root', () => {
    const [a] = radios('<input type="radio" name="g" checked />');
    const shadowHost = document.createElement('div');
    host.append(shadowHost);
    const shadow = shadowHost.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<input type="radio" name="g" />';
    const onUncheckedByGroup = vi.fn();
    track(createFormParticipation({ element: must(a), getChecked: () => true, onUncheckedByGroup }));
    must(shadow.querySelector('input')).click();
    expect(onUncheckedByGroup).not.toHaveBeenCalled();
  });

  it('is silent after destroy and removes the listener it added', () => {
    const [a, b] = radios(group);
    const onUncheckedByGroup = vi.fn();
    const remove = vi.spyOn(document, 'removeEventListener');
    createFormParticipation({ element: must(a), getChecked: () => true, onUncheckedByGroup }).destroy();
    expect(remove.mock.calls.map(([type]) => type)).toContain('change');
    remove.mockRestore();
    must(b).click();
    expect(onUncheckedByGroup).not.toHaveBeenCalled();
  });
});
