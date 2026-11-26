// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { h, nextTick, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FieldError } from '../../field-error';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Input } from '../../input';
import { mountView } from '../../internal/tests/mount-helpers';
import { Label } from '../../label';
import { Leading } from '../../leading';
import { Radio } from '../../radio';
import { RadioGroup } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const plans = (props: Record<string, unknown> = {}): VNode =>
  h(RadioGroup, props, () => [h(Radio, { value: 'free' }, () => 'Free'), h(Radio, { value: 'pro' }, () => 'Pro')]);

const inField = (fieldProps: Record<string, unknown>, groupProps: Record<string, unknown> = {}): (() => VNode) => {
  return () =>
    h(
      FormField,
      { id: 'f', ...fieldProps },
      {
        label: () => h(Label, null, () => 'Plan'),
        default: () => plans(groupProps),
        hint: () => h(Hint, null, () => 'Billed monthly.'),
        error: () => h(FieldError, null, () => 'Pick a plan.'),
      },
    );
};

const group = (): HTMLElement => screen.getByRole('radiogroup');
const radio = (name: string): HTMLInputElement => screen.getByRole<HTMLInputElement>('radio', { name });

describe('RadioGroup in a FormField', () => {
  it('is named by the Label through aria-labelledby and described by the hint, and the Label has no for', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(inField({}));
    await nextTick();
    const label = screen.getByText('Plan');
    expect(label.hasAttribute('for')).toBe(false);
    expect(group().getAttribute('aria-labelledby')).toBe(label.id);
    expect(group().id).toBe('f-control');
    expect(group().getAttribute('aria-describedby')).toContain(screen.getByText('Billed monthly.').id);
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBe(group());
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps an aria-label and an id of the author over the Label and the control id', async () => {
    mountView(inField({}, { id: 'mine', 'aria-label': 'Mine' }));
    await nextTick();
    expect(group().hasAttribute('aria-labelledby')).toBe(false);
    expect(group().getAttribute('aria-label')).toBe('Mine');
    expect(group().id).toBe('mine');
  });

  it('takes the disabled and required state of the field', async () => {
    mountView(inField({ disabled: true, required: true }));
    await nextTick();
    expect(group().getAttribute('aria-disabled')).toBe('true');
    expect(group().getAttribute('aria-required')).toBe('true');
    expect(radio('Free').disabled).toBe(true);
    expect(radio('Free').required).toBe(true);
  });

  it('shows the field error and the invalid state of a required touched group with no value', async () => {
    mountView(inField({}, { required: true, touched: true }));
    await nextTick();
    await nextTick();
    expect(group().getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Pick a plan.')).toBeTruthy();
  });

  it('does not claim the field from a zone', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() =>
      h(
        FormField,
        { id: 'f' },
        {
          label: () => h(Label, null, () => 'Amount'),
          leading: () => h(Leading, null, () => plans({ 'aria-label': 'Unit' })),
          default: () => h(Input),
        },
      ),
    );
    await nextTick();
    expect(screen.getByRole('textbox', { name: 'Amount' }).id).toBe('f-control');
    expect(group().id).toBe('');
    expect(group().hasAttribute('aria-labelledby')).toBe(false);
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('RadioGroup and a blocked submit', () => {
  it('shows the invalid state of a required group with no value after a blocked submit, and a reset clears it', async () => {
    mountView(() => h('form', null, [plans({ 'aria-label': 'Plan', required: true })]));
    await nextTick();
    const form = document.querySelector('form');
    if (!form) throw new Error('No form rendered.');
    expect(group().hasAttribute('aria-invalid')).toBe(false);
    expect(form.checkValidity()).toBe(false);
    await nextTick();
    expect(group().getAttribute('aria-invalid')).toBe('true');
    expect(group().hasAttribute('data-invalid')).toBe(true);
    form.reset();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await nextTick();
    expect(group().hasAttribute('aria-invalid')).toBe(false);
  });
});
