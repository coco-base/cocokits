// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { Input } from '../index';
import { mountView, pick } from '../../internal/tests/mount-helpers';
import { control, nextTask } from './fixtures';

afterEach(cleanup);

const form = (): HTMLFormElement => pick(document.body, 'form') as HTMLFormElement;
const resetButton = (text = 'Reset'): VNodeButton => h('button', { type: 'reset' }, text);
type VNodeButton = ReturnType<typeof h>;

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

describe('Input in a native form', () => {
  it('puts the value in FormData under its name, and blocks checkValidity while required and empty', async () => {
    mountView(() => h('form', null, [h(Input, { name: 'email', required: true })]));
    expect(form().checkValidity()).toBe(false);
    await userEvent.type(control(), 'a@b.c');
    expect(form().checkValidity()).toBe(true);
    expect(new FormData(form()).get('email')).toBe('a@b.c');
  });

  it('submits on Enter (implicit submission)', async () => {
    const onSubmit = vi.fn((event: Event) => {
      event.preventDefault();
    });
    mountView(() => h('form', { onSubmit }, [h(Input, { name: 'q' }), h('button', { type: 'submit' }, 'Go')]));
    await userEvent.type(control(), 'x{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('reset: restores the mount value, emits the update and clears touched and dirty', async () => {
    const onUpdate = vi.fn();
    const props = bound('start', onUpdate);
    mountView(() => h('form', null, [h(Input, props()), resetButton()]));
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

  it('reset of a v-model Input reports the value at mount, and the parent decides', async () => {
    const text = ref('mount');
    mountView(() =>
      h('form', null, [
        h(Input, {
          modelValue: text.value,
          'onUpdate:modelValue': (next: unknown) => {
            text.value = typeof next === 'string' ? next : '';
          },
        }),
        resetButton(),
      ]),
    );
    await userEvent.type(control(), '!');
    expect(control().value).toBe('mount!');
    await userEvent.click(screen.getByText('Reset'));
    await nextTask();
    expect(text.value).toBe('mount');
    expect(control().value).toBe('mount');
  });

  it('a canceled reset keeps the value and reports nothing', async () => {
    const onUpdate = vi.fn();
    const props = bound('start', onUpdate);
    mountView(() =>
      h(
        'form',
        {
          onReset: (event: Event) => {
            event.preventDefault();
          },
        },
        [h(Input, props()), resetButton()],
      ),
    );
    await userEvent.type(control(), '!');
    onUpdate.mockClear();
    await userEvent.click(screen.getByText('Reset'));
    await nextTask();
    expect(control().value).toBe('start!');
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('follows fieldset[disabled] on the Input and the field root', async () => {
    mountView(() => h('fieldset', { disabled: true }, [h(FormField, { 'data-testid': 'field' }, () => h(Input))]));
    await vi.waitFor(() => {
      expect(control().hasAttribute('data-disabled')).toBe(true);
    });
    await nextTick();
    expect(screen.getByTestId('field').hasAttribute('data-disabled')).toBe(true);
  });

  it('follows a later change of the fieldset', async () => {
    const disabled = ref(false);
    mountView(() => h('fieldset', { disabled: disabled.value }, [h(Input)]));
    expect(control().hasAttribute('data-disabled')).toBe(false);
    disabled.value = true;
    await vi.waitFor(() => {
      expect(control().hasAttribute('data-disabled')).toBe(true);
    });
  });

  it('the form attribute re-targets submit and reset', async () => {
    mountView(() => [
      h('form', { id: 'a', 'data-testid': 'a' }),
      h('form', { id: 'b' }),
      h(Input, { form: 'a', modelValue: 'start', name: 'n' }),
      h('button', { type: 'reset', form: 'b' }, 'Reset b'),
      h('button', { type: 'reset', form: 'a' }, 'Reset a'),
    ]);
    await userEvent.type(control(), '!');
    expect(new FormData(screen.getByTestId<HTMLFormElement>('a')).get('n')).toBe('start!');
    await userEvent.click(screen.getByText('Reset b'));
    await nextTask();
    expect(control().value).toBe('start!');
    await userEvent.click(screen.getByText('Reset a'));
    await nextTask();
    expect(control().value).toBe('start');
  });
});

describe('Input and the submit attempt', () => {
  it('marks an invalid untouched field on a submit, canceled ones included, and a native reset clears it', async () => {
    mountView(() =>
      h(
        'form',
        {
          onSubmit: (event: Event) => {
            event.preventDefault();
          },
        },
        [h(Input, { required: true, invalid: true }), resetButton()],
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

  it('lets a submitted prop win, so a library reset can clear it', async () => {
    const submitted = ref<boolean | undefined>(undefined);
    mountView(() => h('form', null, [h(Input, { required: true, invalid: true, submitted: submitted.value })]));
    await fireEvent.submit(form());
    expect(control().hasAttribute('data-submitted')).toBe(true);
    submitted.value = false;
    await nextTick();
    expect(control().hasAttribute('data-submitted')).toBe(false);
    expect(control().hasAttribute('aria-invalid')).toBe(false);
  });

  it('does not mark anything for checkValidity()', () => {
    mountView(() => h('form', null, [h(Input, { required: true, invalid: true })]));
    form().checkValidity();
    form().reportValidity();
    expect(control().hasAttribute('data-submitted')).toBe(false);
  });
});

describe('Input and a Label that is clicked', () => {
  it('focuses the input', async () => {
    mountView(() => h(FormField, null, { label: () => h(Label, null, () => 'Name'), default: () => h(Input) }));
    await userEvent.click(screen.getByText('Name'));
    expect(document.activeElement).toBe(control());
  });
});
