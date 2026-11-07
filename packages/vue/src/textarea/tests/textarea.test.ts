// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { defineComponent, h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { textareaMeta } from '@cocokits/machines/textarea';
import { ThemeProvider } from '@cocokits/vue-core';
import { Textarea } from '../index';
import { mountView, pick } from '../../internal/tests/mount-helpers';
import { textareaThemeConfig } from './fixtures';

afterEach(cleanup);

const area = (): HTMLTextAreaElement => screen.getByRole<HTMLTextAreaElement>('textbox');

describe('Textarea rendering', () => {
  it('renders a native textarea with the class, no type and nothing else', () => {
    mountView(() => h(Textarea, { 'data-testid': 't' }));
    const element = screen.getByTestId('t');
    expect(element.tagName.toLowerCase()).toBe(textareaMeta.defaultElements?.root);
    // `value` is the text; jsdom reflects it as an attribute, browsers do not.
    expect(
      element
        .getAttributeNames()
        .filter((name) => name !== 'value')
        .sort(),
    ).toEqual(['class', 'data-testid']);
    expect(element.className).toBe('cck-textarea');
  });

  it('joins the class, merges the style, passes native attributes and the template ref', () => {
    const exposed = ref<{ element: HTMLTextAreaElement | null } | null>(null);
    mountView(() =>
      h(Textarea, {
        ref: exposed,
        'data-testid': 't',
        class: 'mine',
        style: { color: 'red' },
        rows: 5,
        cols: 30,
        wrap: 'hard',
        placeholder: 'Message',
        maxlength: 200,
        spellcheck: false,
      }),
    );
    const element = screen.getByTestId('t');
    expect(exposed.value?.element).toBe(element);
    expect([...element.classList].sort()).toEqual(['cck-textarea', 'mine']);
    expect(element.style.color).toBe('red');
    const expected = {
      rows: '5',
      cols: '30',
      wrap: 'hard',
      placeholder: 'Message',
      maxlength: '200',
      spellcheck: 'false',
    };
    for (const [name, value] of Object.entries(expected)) expect(element.getAttribute(name), name).toBe(value);
  });

  it('renders no rows of its own, so the native default applies', () => {
    mountView(() => h(Textarea, { 'data-testid': 't' }));
    expect(screen.getByTestId('t').hasAttribute('rows')).toBe(false);
  });

  it('puts the theme attribute of the textarea anatomy on the textarea', () => {
    mountView(() => h(ThemeProvider, { themeConfig: textareaThemeConfig }, () => h(Textarea, { 'data-testid': 't' })));
    expect(screen.getByTestId('t').getAttribute('data-probe')).toBe('on');
  });

  it('renders the state facts as native attributes and data-*, and the machine facts win over the author', () => {
    mountView(() =>
      h(Textarea, {
        'data-testid': 't',
        disabled: true,
        readonly: true,
        required: true,
        pending: true,
        'aria-invalid': 'true',
        'data-filled': 'x',
      }),
    );
    const element = screen.getByTestId('t');
    const names = [
      'disabled',
      'readonly',
      'required',
      'data-disabled',
      'data-readonly',
      'data-required',
      'data-pending',
    ];
    for (const name of names) expect(element.hasAttribute(name), name).toBe(true);
    expect(element.hasAttribute('aria-invalid')).toBe(false);
    expect(element.hasAttribute('data-filled')).toBe(false);
  });

  it('writes aria-invalid only while invalid and touched or submitted, and data-invalid always', async () => {
    mountView(() => h(Textarea, { 'data-testid': 't', invalid: true }));
    const element = screen.getByTestId('t');
    expect(element.hasAttribute('data-invalid')).toBe(true);
    expect(element.hasAttribute('aria-invalid')).toBe(false);
    await userEvent.click(element);
    await userEvent.tab();
    expect(element.getAttribute('aria-invalid')).toBe('true');
  });

  it('tracks focus, touched, dirty and filled from the user', async () => {
    mountView(() => h(Textarea, { 'data-testid': 't' }));
    const element = screen.getByTestId('t');
    await userEvent.click(element);
    expect(element.hasAttribute('data-focused')).toBe(true);
    await userEvent.keyboard('a');
    expect(element.hasAttribute('data-dirty')).toBe(true);
    expect(element.hasAttribute('data-filled')).toBe(true);
    await userEvent.tab();
    expect(element.hasAttribute('data-touched')).toBe(true);
    expect(element.hasAttribute('data-focused')).toBe(false);
  });
});

describe('Textarea value', () => {
  it('unbound: keeps its own text and emits update:modelValue on every keystroke', async () => {
    const calls: string[] = [];
    mountView(() => h(Textarea, { 'onUpdate:modelValue': (value: string) => calls.push(value) }));
    await userEvent.type(area(), 'ab');
    expect(area().value).toBe('ab');
    expect(calls).toEqual(['a', 'ab']);
  });

  it('v-model: a rejected change is restored, and a parent write fires nothing', async () => {
    const text = ref('fixed');
    const onUpdate = vi.fn();
    mountView(() => h(Textarea, { modelValue: text.value, 'onUpdate:modelValue': onUpdate }));
    await userEvent.type(area(), 'x');
    await nextTick();
    expect(onUpdate).toHaveBeenCalledOnce();
    expect(area().value).toBe('fixed');
    onUpdate.mockClear();
    text.value = 'other';
    await nextTick();
    expect(area().value).toBe('other');
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('renders null as the empty value', () => {
    mountView(() => h(Textarea, { modelValue: null }));
    expect(area().value).toBe('');
    expect(area().hasAttribute('data-filled')).toBe(false);
  });

  it('follows a parent that accepts the change', async () => {
    const text = ref('');
    mountView(() =>
      h(Textarea, {
        modelValue: text.value,
        'onUpdate:modelValue': (next: unknown) => {
          text.value = typeof next === 'string' ? next : '';
        },
      }),
    );
    await userEvent.type(area(), 'hi');
    expect(text.value).toBe('hi');
    expect(area().value).toBe('hi');
  });

  it('inserts a line break on Enter and never submits the form', async () => {
    const onSubmit = vi.fn((event: Event) => {
      event.preventDefault();
    });
    mountView(() => h('form', { onSubmit }, [h(Textarea), h('button', { type: 'submit' }, 'Go')]));
    await userEvent.type(area(), 'a{Enter}b');
    expect(area().value).toBe('a\nb');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a CRLF model with LF, emits nothing and does not rewrite the DOM on a render', async () => {
    const onUpdate = vi.fn();
    const model = 'a\r\nb\rc';
    const flag = ref(0);
    mountView(() =>
      h(Textarea, { modelValue: model, 'onUpdate:modelValue': onUpdate, class: `again-${String(flag.value)}` }),
    );
    expect(area().value).toBe('a\nb\nc');
    const writes = vi.spyOn(HTMLTextAreaElement.prototype, 'value', 'set');
    area().setSelectionRange(2, 2);
    flag.value = 1;
    await nextTick();
    expect(writes).not.toHaveBeenCalled();
    expect(area().selectionStart).toBe(2);
    expect(onUpdate).not.toHaveBeenCalled();
    writes.mockRestore();
  });

  it('runs the native listeners the author passes along with its own', async () => {
    const onInput = vi.fn();
    const onBlur = vi.fn();
    mountView(() => h(Textarea, { onInput, onBlur }));
    await userEvent.type(area(), 'a');
    await userEvent.tab();
    expect(onInput).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
    expect(area().hasAttribute('data-touched')).toBe(true);
  });

  it('works with the v-model of a compiled template', async () => {
    const Host = defineComponent({
      components: { Textarea },
      setup: () => ({ text: ref('start') }),
      template: '<Textarea v-model="text" /><output>{{ text }}</output>',
    });
    const { container } = render(Host);
    await userEvent.type(pick(container, 'textarea'), '!');
    expect(pick(container, 'output').textContent).toBe('start!');
  });
});

describe('Textarea defaultValue', () => {
  it('starts with the text, a user change sticks, and an update listener alone leaves it uncontrolled', async () => {
    const update = vi.fn();
    mountView(() => h(Textarea, { defaultValue: 'Ada', 'onUpdate:modelValue': update }));
    expect(area().value).toBe('Ada');
    await userEvent.type(area(), 'x');
    expect(area().value).toBe('Adax');
    expect(update).toHaveBeenCalledExactlyOnceWith('Adax');
  });

  it('is ignored when the model is bound, and a bound model with a listener is controlled', async () => {
    const update = vi.fn();
    mountView(() => h(Textarea, { modelValue: 'Bob', defaultValue: 'Ada', 'onUpdate:modelValue': update }));
    expect(area().value).toBe('Bob');
    await userEvent.type(area(), 'x');
    await nextTick();
    expect(update).toHaveBeenCalledExactlyOnceWith('Bobx');
    expect(area().value).toBe('Bob');
  });

  it('starts local state from a model bound without a listener', async () => {
    mountView(() => h(Textarea, { modelValue: 'Bob', defaultValue: 'Ada' }));
    expect(area().value).toBe('Bob');
    await userEvent.type(area(), 'x');
    expect(area().value).toBe('Bobx');
  });
});
