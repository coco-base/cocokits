// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { FieldError } from '../../field-error';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { Prefix } from '../../prefix';
import { Suffix } from '../../suffix';
import { Textarea } from '../index';
import { mountView } from '../../internal/tests/mount-helpers';
import { messageField, nextFrame } from './fixtures';

afterEach(cleanup);

const withLabel = (area: () => VNode, props: Record<string, unknown> = {}): (() => VNode) => {
  return () =>
    h(FormField, props, {
      label: () => h(Label, null, () => 'Message'),
      hint: () => h(Hint, null, () => 'Help'),
      error: () => h(FieldError, null, () => 'Write something.'),
      default: area,
    });
};

describe('Textarea accessibility', () => {
  it.each<[string, () => VNode]>([
    ['alone, with a name', () => h(Textarea, { 'aria-label': 'Message' })],
    ['in a field with every zone, hints and a shown FieldError', () => messageField()],
    ['required', withLabel(() => h(Textarea, { required: true }))],
    ['invalid and touched, with the error shown', withLabel(() => h(Textarea, { invalid: true, touched: true }))],
    ['disabled', withLabel(() => h(Textarea, { disabled: true }))],
    ['read-only', withLabel(() => h(Textarea, { readonly: true, modelValue: 'x' }))],
    [
      'with an aria-hidden icon and a named button',
      () =>
        h(FormField, null, {
          label: () => h(Label, null, () => 'Message'),
          prefix: () => h(Prefix, null, () => h('svg', { 'aria-hidden': 'true', width: 12, height: 12 })),
          suffix: () => h(Suffix, null, () => h('button', { type: 'button', 'aria-label': 'Clear' }, 'x')),
          default: () => h(Textarea),
        }),
    ],
  ])('has no axe violation %s', async (_name, ui) => {
    const { container } = mountView(ui);
    await nextTick();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('is named by the label and described by each hint and the error', async () => {
    mountView(() => messageField('msg'));
    await nextTick();
    const area = screen.getByRole('textbox', { name: 'Message' });
    expect(area.getAttribute('aria-describedby')).toBe('msg-hint-1 msg-hint-2 msg-error-1');
    expect(document.getElementById('msg-feedback')?.textContent).toBe('Be kind.Be short.Write a message.');
  });

  it('adds nothing to the description while the FieldError is not shown, and announces it after blur', async () => {
    mountView(withLabel(() => h(Textarea, { invalid: true })));
    await nextTick();
    const area = screen.getByRole('textbox', { name: 'Message' });
    const feedback = (): string =>
      (area.getAttribute('aria-describedby') ?? '')
        .split(' ')
        .map((id) => document.getElementById(id)?.textContent ?? '')
        .join(' ')
        .trim();
    expect(feedback()).toBe('Help');
    await userEvent.click(area);
    await userEvent.tab();
    expect(area.getAttribute('aria-invalid')).toBe('true');
    expect(feedback()).toBe('Help Write something.');
  });

  it('takes focus on Tab, skips a disabled textarea, keeps a read-only one and steals no focus on mount', async () => {
    mountView(() => [
      h(Textarea, { 'aria-label': 'one' }),
      h(Textarea, { 'aria-label': 'off', disabled: true }),
      h(Textarea, { 'aria-label': 'read', readonly: true }),
    ]);
    expect(document.activeElement).toBe(document.body);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('one'));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('read'));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByLabelText('one'));
  });

  it('warns after mount when nothing names the Textarea in a field, and not when a Label or aria-label does', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const warned = (): boolean =>
      warn.mock.calls.some(([text]) => String(text).includes('a Textarea in a FormField has no accessible name'));
    mountView(() => h(FormField, null, () => h(Textarea)));
    await nextFrame();
    expect(warned()).toBe(true);
    warn.mockClear();
    cleanup();
    mountView(() => [
      h(FormField, null, { label: () => h(Label, null, () => 'Message'), default: () => h(Textarea) }),
      h(FormField, null, () => h(Textarea, { 'aria-label': 'Other' })),
      h(Textarea, { 'aria-label': 'Third' }),
    ]);
    await nextFrame();
    expect(warned()).toBe(false);
    warn.mockRestore();
  });
});
