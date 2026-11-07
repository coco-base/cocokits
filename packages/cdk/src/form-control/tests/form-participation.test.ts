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

function mountForm(markup = '<input name="a" value="start" />'): { form: HTMLFormElement; input: HTMLInputElement } {
  host.innerHTML = `<form id="f">${markup}<button type="reset">reset</button></form>`;
  const form = must(host.querySelector('form'));
  const input = must(form.querySelector('input'));
  return { form, input };
}

const cancelOnForm = (form: HTMLFormElement): void => {
  form.addEventListener('reset', (e) => {
    e.preventDefault();
  });
};

describe('createFormParticipation: syncValue', () => {
  it('writes getValue() when it differs and leaves an equal value alone', () => {
    const { input } = mountForm();
    let model = 'one';
    const participation = track(createFormParticipation({ element: input, getValue: () => model }));
    participation.syncValue();
    expect(input.value).toBe('one');
    const setter = vi.spyOn(input, 'value', 'set');
    participation.syncValue();
    expect(setter).not.toHaveBeenCalled();
    model = 'two';
    participation.syncValue();
    expect(input.value).toBe('two');
  });

  it('does nothing after destroy', () => {
    const { input } = mountForm();
    const participation = createFormParticipation({ element: input, getValue: () => 'x' });
    participation.destroy();
    participation.syncValue();
    expect(input.value).toBe('start');
  });
});

describe('createFormParticipation: reset', () => {
  it('calls onReset once after the element was reset, then the DOM equals getValue()', async () => {
    const { form, input } = mountForm();
    input.value = 'typed';
    const seen: string[] = [];
    const onSubmittedChange = vi.fn();
    track(
      createFormParticipation({
        element: input,
        getValue: () => 'model',
        onReset: () => seen.push(input.value),
        onSubmittedChange,
      }),
    );
    form.reset();
    expect(seen).toEqual([]);
    await nextTask();
    expect(seen).toEqual(['start']);
    expect(input.value).toBe('model');
    expect(onSubmittedChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('passes the reset event', async () => {
    const { form, input } = mountForm();
    const onReset = vi.fn();
    track(createFormParticipation({ element: input, getValue: () => '', onReset }));
    form.reset();
    await nextTask();
    expect(onReset).toHaveBeenCalledTimes(1);
    expect((onReset.mock.calls[0]?.[0] as Event).type).toBe('reset');
  });

  it.each([
    { name: 'a listener on the form', cancel: cancelOnForm },
    {
      name: 'a listener on the document, added later',
      cancel: () => {
        document.addEventListener(
          'reset',
          (e) => {
            e.preventDefault();
          },
          { once: true },
        );
      },
    },
    {
      name: 'a listener that stops propagation and cancels',
      cancel: (form: HTMLFormElement) => {
        form.addEventListener('reset', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      },
    },
  ])('reports nothing for a reset canceled by $name', async ({ cancel }) => {
    const { form, input } = mountForm();
    input.value = 'typed';
    const onReset = vi.fn();
    const onSubmittedChange = vi.fn();
    track(createFormParticipation({ element: input, getValue: () => 'model', onReset, onSubmittedChange }));
    cancel(form);
    form.reset();
    await nextTask();
    expect(onReset).not.toHaveBeenCalled();
    expect(onSubmittedChange).not.toHaveBeenCalled();
    expect(input.value).toBe('typed');
  });

  it('reports nothing for a reset of another form', async () => {
    const { input } = mountForm();
    const other = document.createElement('form');
    host.append(other);
    const onReset = vi.fn();
    track(createFormParticipation({ element: input, getValue: () => 'model', onReset }));
    other.reset();
    await nextTask();
    expect(onReset).not.toHaveBeenCalled();
  });

  it('follows the form attribute, also after it changes', async () => {
    host.innerHTML = '<form id="a"></form><form id="b"></form><input form="a" value="start" />';
    const input = must(host.querySelector('input'));
    const [formA, formB] = Array.from(host.querySelectorAll('form'));
    const onReset = vi.fn();
    track(createFormParticipation({ element: input, getValue: () => 'model', onReset }));
    formB?.reset();
    await nextTask();
    expect(onReset).not.toHaveBeenCalled();
    formA?.reset();
    await nextTask();
    expect(onReset).toHaveBeenCalledTimes(1);
    input.setAttribute('form', 'b');
    formA?.reset();
    await nextTask();
    expect(onReset).toHaveBeenCalledTimes(1);
    formB?.reset();
    await nextTask();
    expect(onReset).toHaveBeenCalledTimes(2);
  });

  it('reports a reset through the reset button', async () => {
    const { form, input } = mountForm();
    const onReset = vi.fn();
    track(createFormParticipation({ element: input, getValue: () => 'model', onReset }));
    must(form.querySelector('button')).click();
    await nextTask();
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('works for a textarea', async () => {
    host.innerHTML = '<form><textarea>start</textarea></form>';
    const form = must(host.querySelector('form'));
    const area = must(host.querySelector('textarea'));
    track(createFormParticipation({ element: area, getValue: () => 'model' }));
    form.reset();
    await nextTask();
    expect(area.value).toBe('model');
  });

  it('is silent after destroy, also for a reset already scheduled', async () => {
    const { form, input } = mountForm();
    const onReset = vi.fn();
    const participation = createFormParticipation({ element: input, getValue: () => 'model', onReset });
    form.reset();
    participation.destroy();
    await nextTask();
    form.reset();
    await nextTask();
    expect(onReset).not.toHaveBeenCalled();
    expect(input.value).toBe('start');
  });

  it('ignores a control outside any form', async () => {
    host.innerHTML = '<input value="start" />';
    const input = must(host.querySelector('input'));
    const onReset = vi.fn();
    track(createFormParticipation({ element: input, getValue: () => 'model', onReset }));
    document.dispatchEvent(new Event('reset', { bubbles: true, cancelable: true }));
    await nextTask();
    expect(onReset).not.toHaveBeenCalled();
  });
});

describe('createFormParticipation: submit', () => {
  it('reports true on every submit of the owner form, canceled ones included', () => {
    const { form, input } = mountForm();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
    });
    const onSubmittedChange = vi.fn();
    track(createFormParticipation({ element: input, getValue: () => '', onSubmittedChange }));
    form.requestSubmit();
    form.requestSubmit();
    expect(onSubmittedChange.mock.calls).toEqual([[true], [true]]);
  });

  it('reports a submit event dispatched on the form', () => {
    const { form, input } = mountForm();
    form.addEventListener(
      'submit',
      (e) => {
        e.preventDefault();
      },
      { once: true },
    );
    const onSubmittedChange = vi.fn();
    track(createFormParticipation({ element: input, getValue: () => '', onSubmittedChange }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(onSubmittedChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('ignores another form, and the invalid event from checkValidity and reportValidity', () => {
    const { input } = mountForm('<input name="a" required />');
    const other = document.createElement('form');
    host.append(other);
    const onSubmittedChange = vi.fn();
    track(createFormParticipation({ element: input, getValue: () => '', onSubmittedChange }));
    other.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(input.checkValidity()).toBe(false);
    expect(input.reportValidity()).toBe(false);
    expect(onSubmittedChange).not.toHaveBeenCalled();
  });

  it('a submit then an uncanceled reset reports true then false', async () => {
    const { form, input } = mountForm();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
    });
    const onSubmittedChange = vi.fn();
    track(createFormParticipation({ element: input, getValue: () => '', onSubmittedChange }));
    form.requestSubmit();
    form.reset();
    await nextTask();
    expect(onSubmittedChange.mock.calls).toEqual([[true], [false]]);
  });

  it('is silent after destroy', () => {
    const { form, input } = mountForm();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
    });
    const onSubmittedChange = vi.fn();
    createFormParticipation({ element: input, getValue: () => '', onSubmittedChange }).destroy();
    form.requestSubmit();
    expect(onSubmittedChange).not.toHaveBeenCalled();
  });
});

describe('createFormParticipation: destroy', () => {
  it('can be called twice', () => {
    const { input } = mountForm();
    const participation = createFormParticipation({
      element: input,
      getValue: () => '',
      onFieldsetDisabledChange: () => undefined,
    });
    participation.destroy();
    expect(() => {
      participation.destroy();
    }).not.toThrow();
  });

  it('removes the listeners it added with the options it used', () => {
    const { input } = mountForm();
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    createFormParticipation({ element: input, getValue: () => '' }).destroy();
    const summary = (calls: readonly (readonly unknown[])[]): unknown[][] =>
      calls.map(([type, , capture]) => [type, capture]);
    expect(summary(add.mock.calls)).toEqual([
      ['reset', true],
      ['submit', true],
    ]);
    expect(summary(remove.mock.calls)).toEqual(summary(add.mock.calls));
    add.mockRestore();
    remove.mockRestore();
  });
});
