// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen, waitFor } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectAnatomy } from '@cocokits/machines/select';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import {
  gone,
  item,
  mountView,
  must,
  nextTask,
  selectRoot,
  settle,
  stubOverlayBrowser,
  trigger,
  valueText,
} from './fixtures';

const { classes } = selectAnatomy;

beforeEach(() => {
  stubOverlayBrowser();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const options = (): ReturnType<typeof h>[] => [item('Cake'), item('Pizza')];
const submitHandler = (): ReturnType<typeof vi.fn<(event: SubmitEvent) => void>> =>
  vi.fn((event: SubmitEvent) => {
    event.preventDefault();
  });
const dataOf = (handler: ReturnType<typeof submitHandler>, call = 0): FormData => {
  const form = handler.mock.calls[call]?.[0].target;
  if (!(form instanceof HTMLFormElement)) throw new Error('Expected a submit event of a form.');
  return new FormData(form);
};
const formView = (props: Record<string, unknown>, handler = submitHandler(), formProps = {}) =>
  mountView(() =>
    h('form', { onSubmit: handler, ...formProps }, [selectRoot({ name: 'dish', ...props }, { items: options })]),
  );

describe('Select native participation', () => {
  it('submits the value under its name, and the empty string while nothing is selected', async () => {
    const user = userEvent.setup();
    const handler = submitHandler();
    const { container } = formView({}, handler);
    must(container.querySelector('form')).requestSubmit();
    expect(dataOf(handler).getAll('dish')).toEqual(['']);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    must(container.querySelector('form')).requestSubmit();
    expect(dataOf(handler, 1).getAll('dish')).toEqual(['Pizza']);
  });

  it('submits one entry per value with multiple, and none while empty', () => {
    const handler = submitHandler();
    const filled = formView({ multiple: true, modelValue: ['Cake', 'Pizza'] }, handler);
    must(filled.container.querySelector('form')).requestSubmit();
    expect(dataOf(handler).getAll('dish')).toEqual(['Cake', 'Pizza']);
    filled.unmount();
    const empty = formView({ multiple: true }, handler);
    must(empty.container.querySelector('form')).requestSubmit();
    expect(dataOf(handler, 1).has('dish')).toBe(false);
  });

  it('renders hidden inputs for a name or for required, and none otherwise', () => {
    const plain = mountView(() => selectRoot({}, { items: options }));
    expect(plain.container.querySelector('input')).toBeNull();
    plain.unmount();
    const named = formView({ modelValue: 'Cake' });
    const input = must(named.container.querySelector('input'));
    expect(input.name).toBe('dish');
    expect(input.value).toBe('Cake');
    expect(input.getAttribute('aria-hidden')).toBe('true');
    expect(input.tabIndex).toBe(-1);
    expect(input.hasAttribute('class')).toBe(false);
    named.unmount();
    const required = mountView(() => selectRoot({ required: true }, { items: options }));
    expect(must(required.container.querySelector('input')).required).toBe(true);
    expect(must(required.container.querySelector('input')).hasAttribute('name')).toBe(false);
  });

  it('belongs to the form named by form', () => {
    const handler = submitHandler();
    const { container } = mountView(() => [
      h('form', { id: 'orders', onSubmit: handler }),
      selectRoot({ name: 'dish', form: 'orders', modelValue: 'Cake' }, { items: options }),
    ]);
    must(container.querySelector('form')).requestSubmit();
    expect(dataOf(handler).get('dish')).toBe('Cake');
  });

  it('blocks the submit while required and empty, focuses the trigger, and passes once chosen', async () => {
    const user = userEvent.setup();
    const handler = submitHandler();
    const { container } = formView({ required: true }, handler);
    const form = must(container.querySelector('form'));
    expect(form.checkValidity()).toBe(false);
    form.requestSubmit();
    expect(handler).not.toHaveBeenCalled();
    await nextTask();
    expect(document.activeElement).toBe(trigger());
    expect(trigger().getAttribute('aria-required')).toBe('true');
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    await gone();
    expect(form.checkValidity()).toBe(true);
    form.requestSubmit();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  describe('after an invalid submit', () => {
    const rootOf = (): Element | null => trigger().closest(`.${classes.root}`);
    const messageOf = (): string => {
      const id = trigger().getAttribute('aria-describedby') ?? '';
      return id
        .split(' ')
        .map((one) => document.getElementById(one)?.textContent ?? '')
        .join(' ')
        .trim();
    };

    it('marks the trigger and the root invalid and describes the trigger with the validation message', async () => {
      const { container } = formView({ required: true });
      expect(trigger().hasAttribute('aria-invalid')).toBe(false);
      must(container.querySelector('form')).requestSubmit();
      await nextTask();
      expect(trigger().getAttribute('aria-invalid')).toBe('true');
      expect(rootOf()?.hasAttribute('data-invalid')).toBe(true);
      const input = must(container.querySelector<HTMLInputElement>('input[aria-hidden]'));
      expect(input.validationMessage).not.toBe('');
      expect(messageOf()).toContain(input.validationMessage);
    });

    it('clears on the next value change', async () => {
      const user = userEvent.setup();
      const { container } = formView({ required: true });
      must(container.querySelector('form')).requestSubmit();
      await nextTask();
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Cake' }));
      await gone();
      expect(trigger().hasAttribute('aria-invalid')).toBe(false);
      expect(rootOf()?.hasAttribute('data-invalid')).toBe(false);
      expect(messageOf()).toBe('');
    });

    it('clears on a form reset', async () => {
      const { container } = formView({ required: true });
      const form = must(container.querySelector('form'));
      form.requestSubmit();
      await nextTask();
      expect(trigger().getAttribute('aria-invalid')).toBe('true');
      form.reset();
      await nextTask();
      expect(trigger().hasAttribute('aria-invalid')).toBe(false);
      expect(rootOf()?.hasAttribute('data-invalid')).toBe(false);
      expect(messageOf()).toBe('');
    });

    it('keeps a consumer invalid prop after the flag clears', async () => {
      const { container } = formView({ required: true, invalid: true });
      const form = must(container.querySelector('form'));
      form.requestSubmit();
      await nextTask();
      form.reset();
      await nextTask();
      expect(rootOf()?.hasAttribute('data-invalid')).toBe(true);
    });
  });

  it('blocks the submit of a required multiple Select with no value', () => {
    const { container } = formView({ required: true, multiple: true });
    expect(must(container.querySelector('form')).checkValidity()).toBe(false);
  });

  it('does not submit a disabled Select, and a disabling fieldset disables it', async () => {
    const handler = submitHandler();
    const { container } = mountView(() =>
      h('form', { onSubmit: handler }, [
        h('fieldset', { disabled: true }, [selectRoot({ name: 'dish', modelValue: 'Cake' }, { items: options })]),
      ]),
    );
    must(container.querySelector('form')).requestSubmit();
    expect(dataOf(handler).has('dish')).toBe(false);
    await waitFor(() => {
      expect(trigger().closest(`.${classes.root}`)?.hasAttribute('data-disabled')).toBe(true);
    });
  });

  it('restores the value at mount on reset', async () => {
    const user = userEvent.setup();
    const { container } = formView({ modelValue: 'Cake' });
    // Unbound v-model: the Select keeps its own value from here on.
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    await gone();
    must(container.querySelector('form')).reset();
    await waitFor(() => {
      expect(valueText()).toBe('Cake');
    });
    expect(must(container.querySelector<HTMLInputElement>('input[name="dish"]')).value).toBe('Cake');
  });

  it('keeps a bound null over defaultValue on reset', async () => {
    const onUpdate = vi.fn();
    const { container } = formView({
      modelValue: null,
      defaultValue: 'Cake',
      placeholder: 'Choose',
      'onUpdate:modelValue': onUpdate,
    });
    must(container.querySelector('form')).reset();
    await nextTask();
    expect(onUpdate).not.toHaveBeenCalledWith('Cake');
    expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose');
  });

  it('restores an empty single value on reset', async () => {
    const user = userEvent.setup();
    const { container } = formView({ placeholder: 'Choose' });
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    await gone();
    must(container.querySelector('form')).reset();
    await waitFor(() => {
      expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose');
    });
  });
});

describe('Select in a FormField', () => {
  function field(props: Record<string, unknown> = {}) {
    return () =>
      h(
        FormField,
        { required: true, ...props },
        {
          label: () => h(Label, null, () => 'Dish'),
          hint: () => h(Hint, null, () => 'Pick one'),
          default: () => selectRoot({ placeholder: 'Choose' }, { unnamed: true }),
        },
      );
  }

  it('is the control of the field: control id, label for, described by the feedback, required marker', () => {
    const { container } = mountView(field());
    const label = screen.getByText('Dish', { selector: 'label' });
    expect(trigger().id).toMatch(/-control$/);
    expect(label.getAttribute('for')).toBe(trigger().id);
    const feedback = must(container.querySelector<HTMLElement>('.cck-form-field__feedback-wrapper'));
    expect(trigger().getAttribute('aria-describedby')).toBe(feedback.id);
    expect(trigger().getAttribute('aria-required')).toBe('true');
    expect(label.textContent).toContain('*');
    expect(screen.getByRole('combobox', { name: /Dish/ })).toBe(trigger());
  });

  it('merges the author aria-describedby with the ids of the field', () => {
    const { container } = mountView(() =>
      h(
        FormField,
        { required: true },
        {
          label: () => h(Label, null, () => 'Dish'),
          hint: () => h(Hint, null, () => 'Pick one'),
          default: () =>
            selectRoot({ placeholder: 'Choose' }, { unnamed: true, trigger: { 'aria-describedby': 'mine' } }),
        },
      ),
    );
    const feedback = must(container.querySelector<HTMLElement>('.cck-form-field__feedback-wrapper'));
    const ids = (trigger().getAttribute('aria-describedby') ?? '').split(' ');
    expect(ids).toContain('mine');
    expect(ids).toContain(feedback.id);
  });

  it('gives the field its facts: filled, focused, required', async () => {
    const user = userEvent.setup();
    const { container } = mountView(field());
    const root = must(container.querySelector<HTMLElement>('.cck-form-field'));
    expect(root.hasAttribute('data-required')).toBe(true);
    expect(root.hasAttribute('data-filled')).toBe(false);
    await user.tab();
    await waitFor(() => {
      expect(root.hasAttribute('data-focused')).toBe(true);
    });
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{Enter}');
    await gone();
    await waitFor(() => {
      expect(root.hasAttribute('data-filled')).toBe(true);
    });
  });

  it('takes the field state: a disabled field disables the Select', async () => {
    mountView(field({ disabled: true }));
    await waitFor(() => {
      expect(trigger().disabled).toBe(true);
    });
  });

  it('focuses the trigger and does not open when the label is clicked', async () => {
    const user = userEvent.setup();
    mountView(field());
    await user.click(screen.getByText('Dish', { selector: 'label' }));
    expect(document.activeElement).toBe(trigger());
    expect(screen.queryByRole('listbox')).toBeNull();
    await user.click(trigger());
    expect(await screen.findByRole('listbox')).toBeTruthy();
  });

  it('lines the list up with the input wrapper of the field, not the trigger', async () => {
    const user = userEvent.setup();
    const { container } = mountView(field());
    const wrapper = must(container.querySelector<HTMLElement>('.cck-form-field__input-wrapper'));
    wrapper.getBoundingClientRect = () => new DOMRect(40, 10, 300, 48);
    await settle();
    await user.click(trigger());
    const list = await screen.findByRole('listbox');
    await waitFor(() => {
      expect(list.style.getPropertyValue('--anchor-width')).toBe('300px');
    });
  });

  it('lines the list up with the trigger outside a field', async () => {
    const user = userEvent.setup();
    mountView(() => selectRoot({}, { items: options }));
    trigger().getBoundingClientRect = () => new DOMRect(0, 0, 180, 40);
    await user.click(trigger());
    const list = await screen.findByRole('listbox');
    await waitFor(() => {
      expect(list.style.getPropertyValue('--anchor-width')).toBe('180px');
    });
  });
});
