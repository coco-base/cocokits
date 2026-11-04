// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { defineComponent, h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { inputAnatomy, inputMeta } from '@cocokits/machines/input';
import { ThemeProvider } from '@cocokits/vue-core';
import { Input } from '../index';
import { mountView, pick } from '../../internal/tests/mount-helpers';
import { inputThemeConfig } from './fixtures';

afterEach(cleanup);

const input = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('textbox');

describe('Input rendering', () => {
  it('renders a native text input with the class and the type text, and nothing else', () => {
    mountView(() => h(Input, { 'data-testid': 'i' }));
    const element = screen.getByTestId('i');
    expect(element.tagName.toLowerCase()).toBe(inputMeta.defaultElements?.root);
    // `value` is the text; jsdom reflects it as an attribute, browsers do not.
    expect(
      element
        .getAttributeNames()
        .filter((name) => name !== 'value')
        .sort(),
    ).toEqual(['class', 'data-testid', 'type']);
    expect(element.getAttribute('type')).toBe('text');
  });

  it.each(['text', 'email', 'password', 'search', 'tel', 'url'] as const)('renders type %s', (type) => {
    mountView(() => h(Input, { 'data-testid': 'i', type }));
    expect(screen.getByTestId('i').getAttribute('type')).toBe(type);
  });

  it('renders type text for a type outside the six text types', () => {
    const untyped: Record<string, unknown> = { 'data-testid': 'i', type: 'checkbox' };
    mountView(() => h(Input, untyped));
    expect(screen.getByTestId('i').getAttribute('type')).toBe('text');
  });

  it('joins the class, merges the style and passes native attributes and the template ref', () => {
    const exposed = ref<{ element: HTMLInputElement | null } | null>(null);
    mountView(() =>
      h(Input, {
        ref: exposed,
        'data-testid': 'i',
        class: 'mine',
        style: { color: 'red' },
        placeholder: 'you@example.com',
        autocomplete: 'email',
        maxlength: 20,
      }),
    );
    const element = screen.getByTestId('i');
    expect(exposed.value?.element).toBe(element);
    expect([...element.classList].sort()).toEqual(['cck-input', 'mine']);
    expect(element.style.color).toBe('red');
    expect(element.getAttribute('placeholder')).toBe('you@example.com');
    expect(element.getAttribute('autocomplete')).toBe('email');
    expect(element.getAttribute('maxlength')).toBe('20');
  });

  it('puts the theme attribute of the input anatomy on the input', () => {
    mountView(() => h(ThemeProvider, { themeConfig: inputThemeConfig }, () => h(Input, { 'data-testid': 'i' })));
    expect(Object.keys(inputAnatomy.parts)).toEqual(['root']);
    expect(screen.getByTestId('i').getAttribute('data-probe')).toBe('on');
  });

  it('renders the state facts as native attributes and data-*', () => {
    mountView(() => h(Input, { 'data-testid': 'i', disabled: true, readonly: true, required: true, pending: true }));
    const element = screen.getByTestId('i');
    for (const name of ['disabled', 'readonly', 'required', 'data-disabled', 'data-readonly', 'data-required']) {
      expect(element.hasAttribute(name), name).toBe(true);
    }
    expect(element.hasAttribute('data-pending')).toBe(true);
    expect(element.hasAttribute('data-invalid')).toBe(false);
  });

  it('renders native hidden', () => {
    mountView(() => h(Input, { 'data-testid': 'i', hidden: true }));
    expect(screen.getByTestId('i').hidden).toBe(true);
  });

  it('writes aria-invalid only while invalid and touched or submitted, and data-invalid always', async () => {
    const invalid = ref(true);
    mountView(() => h(Input, { 'data-testid': 'i', invalid: invalid.value }));
    const element = screen.getByTestId('i');
    expect(element.hasAttribute('data-invalid')).toBe(true);
    expect(element.hasAttribute('aria-invalid')).toBe(false);
    await userEvent.click(element);
    await userEvent.tab();
    expect(element.getAttribute('aria-invalid')).toBe('true');
    expect(element.hasAttribute('data-touched')).toBe(true);
    invalid.value = false;
    await nextTick();
    expect(element.hasAttribute('aria-invalid')).toBe(false);
  });

  it('keeps the facts of the machine over an author aria-invalid or data-* attribute', () => {
    mountView(() => h(Input, { 'data-testid': 'i', 'aria-invalid': 'true', 'data-invalid': 'x', 'data-filled': 'x' }));
    const element = screen.getByTestId('i');
    for (const name of ['aria-invalid', 'data-invalid', 'data-filled'])
      expect(element.hasAttribute(name), name).toBe(false);
  });

  it('lets touched, dirty and submitted given as props win over the internal facts', async () => {
    mountView(() => h(Input, { 'data-testid': 'i', touched: false, dirty: true }));
    const element = screen.getByTestId('i');
    expect(element.hasAttribute('data-dirty')).toBe(true);
    await userEvent.click(element);
    await userEvent.tab();
    expect(element.hasAttribute('data-touched')).toBe(false);
  });

  it('tracks focus, touched, dirty and filled from the user', async () => {
    mountView(() => h(Input, { 'data-testid': 'i' }));
    const element = screen.getByTestId('i');
    await userEvent.click(element);
    expect(element.hasAttribute('data-focused')).toBe(true);
    await userEvent.keyboard('a');
    expect(element.hasAttribute('data-dirty')).toBe(true);
    expect(element.hasAttribute('data-filled')).toBe(true);
    await userEvent.tab();
    expect(element.hasAttribute('data-focused')).toBe(false);
    expect(element.hasAttribute('data-touched')).toBe(true);
    await userEvent.click(element);
    await userEvent.keyboard('{Backspace}');
    expect(element.hasAttribute('data-filled')).toBe(false);
  });
});

describe('Input value', () => {
  it('unbound: keeps its own text and emits update:modelValue on every keystroke', async () => {
    const calls: string[] = [];
    mountView(() =>
      h(Input, {
        'onUpdate:modelValue': (value: string) => calls.push(value),
      }),
    );
    await userEvent.type(input(), 'abc');
    expect(input().value).toBe('abc');
    expect(calls).toEqual(['a', 'ab', 'abc']);
  });

  it('fires the event on every input event, composition included', async () => {
    const onUpdate = vi.fn<(value: string) => void>();
    mountView(() => h(Input, { 'onUpdate:modelValue': onUpdate }));
    await fireEvent.compositionStart(input());
    await fireEvent.input(input(), { target: { value: 'k' }, isComposing: true });
    await fireEvent.input(input(), { target: { value: 'ki' }, isComposing: true });
    await fireEvent.compositionEnd(input());
    expect(onUpdate.mock.calls.map(([value]) => value)).toEqual(['k', 'ki']);
    expect(input().value).toBe('ki');
  });

  it('v-model: a parent that accepts the change shows the typed text', async () => {
    const text = ref('');
    mountView(() =>
      h(Input, {
        modelValue: text.value,
        'onUpdate:modelValue': (next: unknown) => {
          text.value = typeof next === 'string' ? next : '';
        },
      }),
    );
    await userEvent.type(input(), 'hello');
    expect(text.value).toBe('hello');
    expect(input().value).toBe('hello');
  });

  it('v-model: a rejected change is written back to the DOM, and the event still fires', async () => {
    const onUpdate = vi.fn();
    mountView(() => h(Input, { modelValue: 'fixed', 'onUpdate:modelValue': onUpdate }));
    await userEvent.type(input(), 'x');
    await nextTick();
    expect(onUpdate).toHaveBeenCalledWith('fixedx');
    expect(input().value).toBe('fixed');
  });

  it('follows the parent and fires nothing when the parent writes', async () => {
    const text = ref('a');
    const onUpdate = vi.fn();
    mountView(() => h(Input, { modelValue: text.value, 'onUpdate:modelValue': onUpdate }));
    text.value = 'b';
    await nextTick();
    expect(input().value).toBe('b');
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('renders null and undefined as empty, with no data-filled', async () => {
    const text = ref<string | null | undefined>('x');
    mountView(() => h(Input, { modelValue: text.value }));
    expect(input().hasAttribute('data-filled')).toBe(true);
    text.value = null;
    await nextTick();
    expect(input().value).toBe('');
    expect(input().hasAttribute('data-filled')).toBe(false);
    text.value = 'y';
    await nextTick();
    text.value = undefined;
    await nextTick();
    expect(input().value).toBe('');
  });

  it('runs the native listeners the author passes along with its own', async () => {
    const onInput = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    mountView(() => h(Input, { onInput, onFocus, onBlur }));
    await userEvent.type(input(), 'a');
    await userEvent.tab();
    expect(onInput).toHaveBeenCalledOnce();
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
    expect(input().hasAttribute('data-touched')).toBe(true);
  });

  it('works with the v-model of a compiled template', async () => {
    const Host = defineComponent({
      components: { Input },
      setup: () => ({ text: ref('start') }),
      template: '<Input v-model="text" /><output>{{ text }}</output>',
    });
    const { container } = render(Host);
    await userEvent.type(pick(container, 'input'), '!');
    expect(pick(container, 'output').textContent).toBe('start!');
  });
});

describe('Input defaultValue', () => {
  it('starts with the text, a user change sticks, and an update listener alone leaves it uncontrolled', async () => {
    const update = vi.fn();
    mountView(() => h(Input, { defaultValue: 'Ada', 'onUpdate:modelValue': update }));
    expect(input().value).toBe('Ada');
    await userEvent.type(input(), 'x');
    expect(input().value).toBe('Adax');
    expect(update).toHaveBeenCalledExactlyOnceWith('Adax');
  });

  it('is ignored when the model is bound, and a bound model with a listener is controlled', async () => {
    const update = vi.fn();
    mountView(() => h(Input, { modelValue: 'Bob', defaultValue: 'Ada', 'onUpdate:modelValue': update }));
    expect(input().value).toBe('Bob');
    await userEvent.type(input(), 'x');
    await nextTick();
    expect(update).toHaveBeenCalledExactlyOnceWith('Bobx');
    expect(input().value).toBe('Bob');
  });

  it('starts local state from a model bound without a listener', async () => {
    mountView(() => h(Input, { modelValue: 'Bob', defaultValue: 'Ada' }));
    expect(input().value).toBe('Bob');
    await userEvent.type(input(), 'x');
    expect(input().value).toBe('Bobx');
  });
});
