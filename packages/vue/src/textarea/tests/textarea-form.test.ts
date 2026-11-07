// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormField } from '../../form-field';
import { Textarea } from '../index';
import { mountView, pick } from '../../internal/tests/mount-helpers';
import { nextTask } from './fixtures';

afterEach(cleanup);

/** The props of a v-model parent that accepts every change and passes it to `onUpdate`. */
function bound(initial: string, onUpdate: (value: string) => void): () => Record<string, unknown> {
  const text = ref(initial);
  return () => ({
    modelValue: text.value,
    'onUpdate:modelValue': (next: string) => {
      text.value = next;
      onUpdate(next);
    },
  });
}

const form = (): HTMLFormElement => pick(document.body, 'form') as HTMLFormElement;
const control = (): HTMLTextAreaElement => screen.getByRole<HTMLTextAreaElement>('textbox');
const resetButton = (): ReturnType<typeof h> => h('button', { type: 'reset' }, 'Reset');

describe('Textarea in a native form', () => {
  it('puts the value in FormData under its name, and blocks checkValidity while required and empty', async () => {
    mountView(() => h('form', null, [h(Textarea, { name: 'message', required: true })]));
    expect(form().checkValidity()).toBe(false);
    await userEvent.type(control(), 'a{Enter}b');
    expect(form().checkValidity()).toBe(true);
    // jsdom gives LF where a browser gives CRLF.
    expect(new FormData(form()).get('message')).toMatch(/^a\r?\nb$/);
  });

  it('reset: restores the mount value, emits the update and clears touched and dirty', async () => {
    const onUpdate = vi.fn();
    const props = bound('start', onUpdate);
    mountView(() => h('form', null, [h(Textarea, props()), resetButton()]));
    await userEvent.type(control(), '!');
    await userEvent.tab();
    expect(control().hasAttribute('data-touched')).toBe(true);
    expect(control().hasAttribute('data-dirty')).toBe(true);
    onUpdate.mockClear();
    await userEvent.click(screen.getByText('Reset'));
    await nextTask();
    expect(control().value).toBe('start');
    expect(onUpdate).toHaveBeenCalledOnce();
    expect(onUpdate).toHaveBeenCalledWith('start');
    expect(control().hasAttribute('data-touched')).toBe(false);
    expect(control().hasAttribute('data-dirty')).toBe(false);
  });

  it('reset of a Textarea mounted with CRLF emits the LF form', async () => {
    const onUpdate = vi.fn();
    const props = bound('a\r\nb', onUpdate);
    mountView(() => h('form', null, [h(Textarea, props()), resetButton()]));
    await userEvent.type(control(), '!');
    onUpdate.mockClear();
    await userEvent.click(screen.getByText('Reset'));
    await nextTask();
    expect(control().value).toBe('a\nb');
    expect(onUpdate).toHaveBeenCalledWith('a\nb');
  });

  it('reset of a v-model Textarea mounted with CRLF emits the LF form, and the parent decides', async () => {
    const text = ref('a\r\nb');
    const onUpdate = vi.fn();
    mountView(() =>
      h('form', null, [
        h(Textarea, {
          modelValue: text.value,
          'onUpdate:modelValue': (next: unknown) => {
            text.value = typeof next === 'string' ? next : '';
            onUpdate(next);
          },
        }),
        resetButton(),
      ]),
    );
    await userEvent.type(control(), '!');
    onUpdate.mockClear();
    await userEvent.click(screen.getByText('Reset'));
    await nextTask();
    expect(onUpdate).toHaveBeenCalledWith('a\nb');
    expect(text.value).toBe('a\nb');
    expect(control().value).toBe('a\nb');
  });

  it('follows fieldset[disabled] on the Textarea and the field root', async () => {
    mountView(() => h('fieldset', { disabled: true }, [h(FormField, { 'data-testid': 'field' }, () => h(Textarea))]));
    await vi.waitFor(() => {
      expect(control().hasAttribute('data-disabled')).toBe(true);
    });
    await nextTick();
    expect(screen.getByTestId('field').hasAttribute('data-disabled')).toBe(true);
  });

  it('marks an invalid untouched field on a submit, and a native reset clears it', async () => {
    mountView(() =>
      h(
        'form',
        {
          onSubmit: (event: Event) => {
            event.preventDefault();
          },
        },
        [h(Textarea, { required: true, invalid: true }), resetButton()],
      ),
    );
    expect(control().hasAttribute('aria-invalid')).toBe(false);
    await fireEvent.submit(form());
    expect(control().getAttribute('aria-invalid')).toBe('true');
    expect(control().hasAttribute('data-submitted')).toBe(true);
    await userEvent.click(screen.getByText('Reset'));
    await nextTask();
    expect(control().hasAttribute('aria-invalid')).toBe(false);
    expect(control().hasAttribute('data-submitted')).toBe(false);
  });
});
