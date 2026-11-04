// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/vue';
import { defineComponent, h, nextTick, ref, type Component, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FieldError } from '@cocokits/vue/field-error';
import { Leading } from '@cocokits/vue/leading';
import { Prefix } from '@cocokits/vue/prefix';
import { Suffix } from '@cocokits/vue/suffix';
import { Textarea as BaseTextarea } from '@cocokits/vue/textarea';
import { Trailing } from '@cocokits/vue/trailing';
import { ThemeProvider } from '@cocokits/vue-core';
import { defineAnatomy } from '@cocokits/shared';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { FormField, Textarea } from '../src/index';

/** The classes come from an anatomy of the same block, as the theme-config tests do; a theme may not import a machine. */
const textareaAnatomy = defineAnatomy({
  block: 'textarea',
  parts: { root: { name: 'Root', description: 'The textarea.' } },
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const themed = (
  renderFn: () => VNode | VNode[],
  overrides?: Record<string, Record<string, string | boolean | null>>,
): Component =>
  defineComponent({
    setup: () => () => h(ThemeProvider, { themeConfig: cocokitsThemeConfig, overrides }, renderFn),
  });
const textarea = (): HTMLTextAreaElement => screen.getByTestId<HTMLTextAreaElement>('textarea');

describe('theme Textarea', () => {
  it('renders no data-auto-resize by default', () => {
    render(themed(() => h(Textarea, { 'data-testid': 'textarea' })));
    expect(textarea().hasAttribute('data-auto-resize')).toBe(false);
    expect(textarea().className).toBe(textareaAnatomy.classes.root);
  });

  it('renders the presence attribute for true, and none for false and null', () => {
    render(themed(() => h(Textarea, { 'data-testid': 'textarea', autoResize: true })));
    expect(textarea().getAttribute('data-auto-resize')).toBe('');
    cleanup();
    render(themed(() => h(Textarea, { 'data-testid': 'textarea', autoResize: false })));
    expect(textarea().hasAttribute('data-auto-resize')).toBe(false);
    cleanup();
    render(
      themed(() => h(Textarea, { 'data-testid': 'textarea', autoResize: null }), { textarea: { autoResize: true } }),
    );
    expect(textarea().hasAttribute('data-auto-resize')).toBe(false);
  });

  it('follows a changed autoResize prop', async () => {
    const current = ref(false);
    render(themed(() => h(Textarea, { 'data-testid': 'textarea', autoResize: current.value })));
    expect(textarea().hasAttribute('data-auto-resize')).toBe(false);
    current.value = true;
    await nextTick();
    expect(textarea().hasAttribute('data-auto-resize')).toBe(true);
  });

  it('lets a provider override win over the default, and the own prop over the override', () => {
    render(
      themed(
        () => [h(Textarea, { 'data-testid': 'textarea' }), h(Textarea, { 'data-testid': 'own', autoResize: false })],
        { textarea: { autoResize: true } },
      ),
    );
    expect(textarea().hasAttribute('data-auto-resize')).toBe(true);
    expect(screen.getByTestId('own').hasAttribute('data-auto-resize')).toBe(false);
  });

  it('renders no data-auto-resize for a base without a theme provider', () => {
    render(BaseTextarea, { attrs: { 'data-testid': 'textarea' } });
    expect(textarea().hasAttribute('data-auto-resize')).toBe(false);
  });

  it('forwards v-model, the props and the native attributes', async () => {
    const text = ref('a');
    const changes: string[] = [];
    render(
      themed(() =>
        h(Textarea, {
          'data-testid': 'textarea',
          rows: 4,
          required: true,
          modelValue: text.value,
          'onUpdate:modelValue': (value: unknown) => {
            text.value = String(value);
            changes.push(String(value));
          },
        }),
      ),
    );
    expect(textarea().value).toBe('a');
    expect(textarea().getAttribute('rows')).toBe('4');
    expect(textarea().hasAttribute('required')).toBe(true);
    textarea().value = 'ab';
    textarea().dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    expect(text.value).toBe('ab');
    expect(changes).toEqual(['ab']);
  });

  it('exposes the textarea element', async () => {
    const instance = ref<{ readonly element: HTMLTextAreaElement | null } | null>(null);
    render(themed(() => h(Textarea, { 'data-testid': 'textarea', ref: instance })));
    await nextTick();
    expect(instance.value?.element).toBe(textarea());
  });
});

describe('theme FormField with the zones and a Textarea', () => {
  it('forwards the zone slots, keeps the DOM order and an empty FieldError root', () => {
    render(
      themed(() =>
        h(
          FormField,
          { 'data-testid': 'field', size: 'lg', invalid: true },
          {
            default: () => h(Textarea, { 'data-testid': 'textarea', 'aria-label': 'Message', autoResize: true }),
            leading: () => h(Leading, { 'data-testid': 'leading' }, () => 'L'),
            prefix: () => h(Prefix, { 'data-testid': 'prefix' }, () => 'P'),
            suffix: () => h(Suffix, { 'data-testid': 'suffix' }, () => 'S'),
            trailing: () => h(Trailing, { 'data-testid': 'trailing' }, () => 'T'),
            error: () => h(FieldError, { 'data-testid': 'error' }, () => 'Enter a message.'),
          },
        ),
      ),
    );
    const field = screen.getByTestId('field');
    const box = field.querySelector('.cck-form-field__input-wrapper');
    const wrapper = field.querySelector('.cck-form-field__wrapper');
    expect(box?.getAttribute('data-size')).toBe('lg');
    expect([...(box?.children ?? [])].map((child) => child.getAttribute('data-testid'))).toEqual([
      'prefix',
      'textarea',
      'suffix',
    ]);
    expect([...(wrapper?.children ?? [])].map((child) => child.getAttribute('data-testid') ?? 'box')).toEqual([
      'leading',
      'box',
      'trailing',
    ]);
    expect(box?.matches(':has(> .cck-textarea)')).toBe(true);
    const error = screen.getByTestId('error');
    expect(error.getAttribute('aria-live')).toBe('polite');
    expect(error.textContent).toBe('');
    expect(error.matches(':empty')).toBe(true);
  });
});
