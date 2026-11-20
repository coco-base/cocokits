// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../index';
import { mountView } from '../../internal/tests/mount-helpers';
import { box, root } from './fixtures';
import { must, nextTask } from '../../internal/tests/choice-helpers';

afterEach(cleanup);

const form = (): HTMLFormElement => must(document.querySelector('form'));
const data = (): FormData => new FormData(form());
const reset = h('button', { type: 'reset' }, 'Reset');

describe('Checkbox in a real form', () => {
  it('submits on while checked, the value when given, and nothing while unchecked', async () => {
    const checked = ref(false);
    mountView(() =>
      h('form', null, [
        h(Checkbox, { name: 'a', modelValue: checked.value }, () => 'A'),
        h(Checkbox, { name: 'b', value: 'yes', modelValue: true }, () => 'B'),
      ]),
    );
    expect(data().has('a')).toBe(false);
    expect(data().get('b')).toBe('yes');
    checked.value = true;
    await nextTick();
    expect(data().get('a')).toBe('on');
  });

  it('blocks checkValidity while required and unchecked', async () => {
    mountView(() => h('form', null, [h(Checkbox, { required: true }, () => 'Accept')]));
    expect(form().checkValidity()).toBe(false);
    await userEvent.click(box());
    expect(form().checkValidity()).toBe(true);
  });

  it('sets submitted on a submit attempt and marks aria-invalid', async () => {
    const onSubmit = vi.fn((event: Event) => {
      event.preventDefault();
    });
    mountView(() => h('form', { onSubmit }, [h(Checkbox, { invalid: true }, () => 'Accept')]));
    expect(box().hasAttribute('aria-invalid')).toBe(false);
    form().requestSubmit();
    await nextTick();
    expect(box().getAttribute('aria-invalid')).toBe('true');
    expect(root().hasAttribute('data-submitted')).toBe(true);
  });

  describe('reset', () => {
    it('restores the value at mount, emits update:modelValue and clears touched and dirty', async () => {
      const checked = ref(true);
      const seen: boolean[] = [];
      mountView(() =>
        h('form', null, [
          h(
            Checkbox,
            {
              modelValue: checked.value,
              'onUpdate:modelValue': (next: unknown) => {
                checked.value = next === true;
                seen.push(next === true);
              },
            },
            () => 'A',
          ),
          reset,
        ]),
      );
      await userEvent.click(box());
      await userEvent.tab();
      expect(checked.value).toBe(false);
      expect(root().hasAttribute('data-touched')).toBe(true);
      seen.length = 0;
      form().reset();
      await nextTask();
      await nextTick();
      expect(box().checked).toBe(true);
      expect(checked.value).toBe(true);
      expect(seen).toHaveLength(1);
      expect(seen[0]).toBe(true);
      expect(root().hasAttribute('data-touched')).toBe(false);
      expect(root().hasAttribute('data-dirty')).toBe(false);
    });

    it('restores an unbound control to its mount value', async () => {
      mountView(() => h('form', null, [h(Checkbox, { 'aria-label': 'A' })]));
      await userEvent.click(box());
      expect(box().checked).toBe(true);
      form().reset();
      await nextTask();
      await nextTick();
      expect(box().checked).toBe(false);
      expect(root().hasAttribute('data-checked')).toBe(false);
    });

    it('keeps the value when a listener cancels the reset', async () => {
      const onChecked = vi.fn();
      mountView(() =>
        h(
          'form',
          {
            onReset: (event: Event) => {
              event.preventDefault();
            },
          },
          [h(Checkbox, { 'onUpdate:modelValue': onChecked, 'aria-label': 'A' })],
        ),
      );
      await userEvent.click(box());
      onChecked.mockClear();
      form().reset();
      await nextTask();
      expect(box().checked).toBe(true);
      expect(onChecked).not.toHaveBeenCalled();
    });

    it('re-targets submit and reset through the form attribute', async () => {
      mountView(() => [h('form', { id: 'f' }), h(Checkbox, { form: 'f', name: 'a', 'aria-label': 'A' })]);
      await userEvent.click(box());
      expect(new FormData(must(document.querySelector<HTMLFormElement>('form#f'))).get('a')).toBe('on');
      must(document.querySelector<HTMLFormElement>('form#f')).reset();
      await nextTask();
      await nextTick();
      expect(box().checked).toBe(false);
    });
  });

  it('renders data-disabled from a disabling fieldset and disables the input natively', async () => {
    const disabled = ref(false);
    mountView(() => h('form', null, [h('fieldset', { disabled: disabled.value }, [h(Checkbox, null, () => 'A')])]));
    expect(root().hasAttribute('data-disabled')).toBe(false);
    disabled.value = true;
    await vi.waitFor(() => {
      expect(root().hasAttribute('data-disabled')).toBe(true);
    });
    expect(must(document.querySelector('input')).disabled).toBe(true);
  });
});
