// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h, nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountView, pick } from '../../internal/tests/mount-helpers';
import { Hint } from '../../hint';
import { bound, box, chipTexts, field, list, listRoot, nextTask, removeButtons } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const form = (): HTMLFormElement => pick(document.body, 'form') as HTMLFormElement;
const submitHandler = (): ReturnType<typeof vi.fn<(event: SubmitEvent) => void>> =>
  vi.fn((event: SubmitEvent) => {
    event.preventDefault();
  });
const hidden = (): HTMLInputElement[] => [...document.querySelectorAll<HTMLInputElement>('input[aria-hidden="true"]')];
const entries = (name: string): string[] => new FormData(form()).getAll(name).map(String);

describe('ChipList in a FormField', () => {
  it('wires the label, the description and the field facts to the text box', async () => {
    mountView(() => field({ required: true }, { defaultValue: ['Pizza'] }));
    await nextTick();
    expect(box().id).toBe('f-control');
    expect(screen.getByText('Toppings', { selector: 'label' }).getAttribute('for')).toBe('f-control');
    expect(screen.getByRole('textbox', { name: /Toppings/ })).toBe(box());
    expect(box().getAttribute('aria-describedby')).toContain('f-hint-1');
    expect(box().getAttribute('aria-required')).toBe('true');
    expect(box().required).toBe(false);
    expect(listRoot().hasAttribute('data-required')).toBe(true);
    expect(screen.getByTestId('field').hasAttribute('data-filled')).toBe(true);
  });

  it('gives the field disabled, read-only and invalid to the list by OR', async () => {
    mountView(() => field({ disabled: true }, { defaultValue: ['A'] }));
    await nextTick();
    expect(box().disabled).toBe(true);
    expect(removeButtons()[0]?.disabled).toBe(true);
    cleanup();
    mountView(() => field({ readonly: true }, { defaultValue: ['A'] }));
    await nextTick();
    expect(box().readOnly).toBe(true);
    expect(removeButtons()[0]?.disabled).toBe(true);
    cleanup();
    mountView(() => field({ invalid: true }, {}));
    await nextTick();
    expect(listRoot().hasAttribute('data-invalid')).toBe(true);
  });

  it('shows aria-invalid only after the list was touched', async () => {
    mountView(() => h('div', [field({}, { invalid: true }), h('button', 'next')]));
    await nextTick();
    expect(box().hasAttribute('aria-invalid')).toBe(false);
    await userEvent.click(box());
    await userEvent.tab();
    expect(box().getAttribute('aria-invalid')).toBe('true');
  });

  it('focuses the text box on a click on the input wrapper', async () => {
    mountView(() => field({}, { defaultValue: ['A'] }));
    await nextTick();
    await userEvent.click(pick(document.body, '.cck-form-field__input-wrapper'));
    expect(document.activeElement).toBe(box());
  });

  it('adds without Hint interference: the hint still describes the box', async () => {
    mountView(() => h('div', [field({}, {}), h(Hint, { id: 'outside' }, () => 'x')]));
    await nextTick();
    await userEvent.type(box(), 'Salad{Enter}');
    expect(chipTexts()).toEqual(['Salad']);
  });
});

describe('ChipList in a native form', () => {
  it('does not submit on Enter with text, and submits on Enter with an empty box', async () => {
    const onSubmit = submitHandler();
    mountView(() => h('form', { onSubmit }, [list({ name: 'toppings' }), h('button', { type: 'submit' }, 'Go')]));
    await userEvent.type(box(), 'Salad{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(chipTexts()).toEqual(['Salad']);
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('puts one entry per chip under the name and nothing from the text box', async () => {
    mountView(() => h('form', [list({ name: 'toppings', defaultValue: ['Pizza', 'Cake'] })]));
    expect(entries('toppings')).toEqual(['Pizza', 'Cake']);
    await userEvent.type(box(), 'draft');
    expect(entries('toppings')).toEqual(['Pizza', 'Cake']);
    expect(box().name).toBe('');
    await userEvent.keyboard('{Enter}');
    await nextTick();
    expect(entries('toppings')).toEqual(['Pizza', 'Cake', 'draft']);
  });

  it('renders no hidden input without a name or required, and clipped inputs otherwise', () => {
    mountView(() => h('form', [list({ defaultValue: ['A'] })]));
    expect(hidden()).toHaveLength(0);
    cleanup();
    mountView(() => h('form', [list({ name: 'toppings', defaultValue: ['A', 'B'] })]));
    expect(hidden()).toHaveLength(2);
    for (const input of hidden()) {
      expect(input.tabIndex).toBe(-1);
      expect(input.getAttribute('class')).toBeNull();
      expect(input.name).toBe('toppings');
    }
  });

  it('ties the entries to another form with form', () => {
    mountView(() =>
      h('div', [h('form', { id: 'other' }), list({ name: 'toppings', form: 'other', defaultValue: ['Pizza'] })]),
    );
    expect(new FormData(pick(document.body, '#other') as HTMLFormElement).getAll('toppings')).toEqual(['Pizza']);
  });

  it('blocks checkValidity while required and empty, not while it holds a chip', async () => {
    mountView(() => h('form', [list({ name: 'toppings', required: true })]));
    expect(form().checkValidity()).toBe(false);
    expect(hidden()).toHaveLength(1);
    await userEvent.type(box(), 'Salad{Enter}');
    await nextTick();
    expect(form().checkValidity()).toBe(true);
    expect(box().required).toBe(false);
  });

  it('renders the empty blocking input for required without a name', () => {
    mountView(() => h('form', [list({ required: true })]));
    expect(form().checkValidity()).toBe(false);
  });

  it('focuses the text box and shows the invalid fact when a submit is blocked', async () => {
    const onSubmit = submitHandler();
    mountView(() =>
      h('form', { onSubmit }, [list({ name: 'toppings', required: true }), h('button', { type: 'submit' }, 'Go')]),
    );
    await userEvent.click(screen.getByText('Go'));
    await nextTask();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(box());
    expect(listRoot().hasAttribute('data-invalid')).toBe(true);
  });

  it('restores the default value on reset, emits it, clears the draft and the submitted fact', async () => {
    const onUpdate = vi.fn();
    const parent = bound(['A'], onUpdate);
    mountView(() =>
      h('form', { onSubmit: submitHandler() }, [
        list({ ...parent.props(), defaultValue: ['A'], name: 'toppings' }),
        h('button', { type: 'submit' }, 'Go'),
        h('button', { type: 'reset' }, 'Reset'),
      ]),
    );
    await userEvent.type(box(), 'B{Enter}');
    await userEvent.type(box(), 'draft');
    await userEvent.click(screen.getByText('Go'));
    expect(listRoot().hasAttribute('data-submitted')).toBe(true);
    onUpdate.mockClear();
    await userEvent.click(screen.getByText('Reset'));
    await nextTask();
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(['A']);
    expect(chipTexts()).toEqual(['A']);
    expect(box().value).toBe('');
    expect(listRoot().hasAttribute('data-submitted')).toBe(false);
    expect(entries('toppings')).toEqual(['A']);
  });

  it('restores the value at mount on reset when the list has no default value', async () => {
    const onUpdate = vi.fn();
    const parent = bound(['A'], onUpdate);
    mountView(() =>
      h('form', [list({ ...parent.props(), name: 'toppings' }), h('button', { type: 'reset' }, 'Reset')]),
    );
    await userEvent.type(box(), 'B{Enter}');
    onUpdate.mockClear();
    await userEvent.click(screen.getByText('Reset'));
    await nextTask();
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(['A']);
    expect(chipTexts()).toEqual(['A']);
  });

  it('is disabled by a disabled fieldset: the text box, the buttons and the fact', async () => {
    mountView(() => h('form', [h('fieldset', { disabled: true }, [list({ name: 't', defaultValue: ['A'] })])]));
    await nextTask();
    expect(box().disabled).toBe(true);
    expect(removeButtons()[0]?.disabled).toBe(true);
    expect(listRoot().hasAttribute('data-disabled')).toBe(true);
    expect(entries('t')).toEqual([]);
  });
});
