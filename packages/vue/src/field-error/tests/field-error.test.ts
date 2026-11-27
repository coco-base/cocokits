// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, ref, type VNode } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { fieldErrorAnatomy, fieldErrorMeta } from '@cocokits/machines/field-error';
import { ThemeProvider } from '@cocokits/vue-core';
import { defineThemeConfig } from '@cocokits/shared';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { Label } from '../../label';
import { FieldError } from '../index';
import { mountView, pick } from '../../internal/tests/mount-helpers';

afterEach(cleanup);

const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
const error = (): HTMLElement => screen.getByTestId('error');

describe('FieldError rendering', () => {
  it('renders the default element of the meta with the class and aria-live, and no role', () => {
    mountView(() => h(FieldError, { 'data-testid': 'error' }, () => 'Message'));
    expect(error().tagName.toLowerCase()).toBe(fieldErrorMeta.defaultElements?.root);
    expect(error().className).toBe(fieldErrorAnatomy.classes.root);
    expect(error().getAttributeNames().sort()).toEqual(['aria-live', 'class', 'data-testid']);
    expect(error().getAttribute('aria-live')).toBe('polite');
  });

  it('shows its content outside a FormField', () => {
    mountView(() => h(FieldError, { 'data-testid': 'error' }, () => 'Message'));
    expect(error().textContent).toBe('Message');
  });

  it('passes id and native attributes, joins class and exposes the element', () => {
    const exposed = ref<{ element: Element | null } | null>(null);
    mountView(() =>
      h(
        FieldError,
        { ref: exposed, 'data-testid': 'error', id: 'own', class: 'mine', style: { color: 'red' } },
        () => 'x',
      ),
    );
    expect(exposed.value?.element).toBe(error());
    expect(error().id).toBe('own');
    expect(error().className).toBe(`${fieldErrorAnatomy.classes.root} mine`);
    expect(error().style.color).toBe('red');
  });

  it('puts the theme attribute on its root', () => {
    const config = defineThemeConfig({
      name: 'test',
      components: {
        'field-error': {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(fieldErrorAnatomy.parts) },
        },
      },
    });
    mountView(() =>
      h(ThemeProvider, { themeConfig: config }, () => h(FieldError, { 'data-testid': 'error' }, () => 'Message')),
    );
    expect(error().getAttribute('data-probe')).toBe('on');
  });

  it('renders as another tag, and merges onto a child with asChild', () => {
    mountView(() => [
      h(FieldError, { 'data-testid': 'error', as: 'p' }, () => 'Message'),
      h(FieldError, { 'data-testid': 'child', asChild: true }, () => h('span', { class: 's' }, 'Own')),
    ]);
    expect(error().tagName.toLowerCase()).toBe('p');
    const child = screen.getByTestId('child');
    expect(child.tagName.toLowerCase()).toBe('span');
    expect(child.getAttribute('aria-live')).toBe('polite');
    expect(child.textContent).toBe('Own');
  });
});

describe('FieldError in a FormField', () => {
  const field = (props: { readonly force?: boolean; readonly invalid?: boolean } = {}): VNode =>
    h(FormField, null, {
      label: () => h(Label, null, () => 'Name'),
      error: () => h(FieldError, { 'data-testid': 'error', force: props.force }, () => 'Enter a name.'),
      default: () => h(Input, { invalid: props.invalid ?? true }),
    });

  it('renders its root without content before touch or submit', async () => {
    mountView(() => field());
    await nextTick();
    expect(error().textContent).toBe('');
    expect(error().getAttribute('aria-live')).toBe('polite');
  });

  it('renders the content after blur and hides it again when the field is valid', async () => {
    const valid = ref(false);
    mountView(() => field({ invalid: !valid.value }));
    await userEvent.click(screen.getByRole('textbox'));
    expect(error().textContent).toBe('');
    await userEvent.tab();
    expect(error().textContent).toBe('Enter a name.');
    valid.value = true;
    await nextTick();
    expect(error().textContent).toBe('');
  });

  it('renders the content after a submit event and hides it after a reset', async () => {
    mountView(() =>
      h(
        'form',
        {
          onSubmit: (event: Event) => {
            event.preventDefault();
          },
        },
        [field(), h('button', { type: 'reset' }, 'Reset')],
      ),
    );
    await fireEvent.submit(pick(document.body, 'form'));
    expect(error().textContent).toBe('Enter a name.');
    await userEvent.click(screen.getByText('Reset'));
    await nextTask();
    expect(error().textContent).toBe('');
  });

  it('shows with force whatever the field state', async () => {
    mountView(() => field({ force: true, invalid: false }));
    await nextTick();
    expect(error().textContent).toBe('Enter a name.');
  });

  it('shows only force in a field without a CocoKits control', async () => {
    mountView(() =>
      h(FormField, null, {
        error: () => [
          h(FieldError, { 'data-testid': 'plain' }, () => 'Plain'),
          h(FieldError, { 'data-testid': 'forced', force: true }, () => 'Forced'),
        ],
        default: () => h('input', { 'aria-label': 'Native' }),
      }),
    );
    await nextTick();
    expect(screen.getByTestId('plain').textContent).toBe('');
    expect(screen.getByTestId('forced').textContent).toBe('Forced');
  });

  it('keeps an asChild child in place with its own text only while shown', async () => {
    mountView(() =>
      h(FormField, null, {
        error: () => h(FieldError, { asChild: true }, () => h('p', { 'data-testid': 'error' }, 'Own')),
        default: () => h(Input, { invalid: true, 'aria-label': 'Name' }),
      }),
    );
    await nextTick();
    expect(error().tagName.toLowerCase()).toBe('p');
    expect(error().textContent).toBe('');
    await userEvent.click(screen.getByRole('textbox'));
    await userEvent.tab();
    expect(error().textContent).toBe('Own');
  });

  it('renders several errors in the feedback wrapper after the hints, each with its own gate', async () => {
    mountView(() =>
      h(
        FormField,
        { 'data-testid': 'field' },
        {
          error: () => [h(FieldError, null, () => 'One'), h(FieldError, { force: true }, () => 'Two')],
          default: () => h(Input, { invalid: true, 'aria-label': 'Name' }),
        },
      ),
    );
    await nextTick();
    const feedback = screen.getByTestId('field').querySelector('.cck-form-field__feedback-wrapper');
    expect([...(feedback?.children ?? [])].map((child) => child.textContent)).toEqual(['', 'Two']);
  });
});
