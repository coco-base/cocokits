// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, type VNode } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { Input } from '../index';
import { mountView } from '../../internal/tests/mount-helpers';
import { emailField, field } from './fixtures';

afterEach(cleanup);

const control = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('textbox');

describe('Input accessibility', () => {
  it.each<[string, () => VNode]>([
    ['alone, with a label', () => h('div', [h(Label, { for: 'a' }, () => 'Name'), h(Input, { id: 'a' })])],
    ['in a field with hints', () => emailField('email')],
    ['required', () => field({}, () => h(Input, { required: true }))],
    ['required on the field', () => field({ required: true })],
    ['invalid and touched', () => field({}, () => h(Input, { invalid: true, touched: true }))],
    ['invalid and submitted', () => field({}, () => h(Input, { invalid: true, submitted: true }))],
    ['disabled', () => field({ disabled: true })],
    ['read-only', () => field({ readonly: true })],
  ])('has no axe violations: %s', async (_name, ui) => {
    const { container } = mountView(ui);
    await nextTick();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('is named by the Label and described by every hint', async () => {
    mountView(() => emailField('email'));
    await nextTick();
    expect(screen.getByRole('textbox', { name: 'Email address' })).toBe(control());
    expect(screen.getByRole('textbox', { description: 'We only use it for the receipt. No spam.' })).toBe(control());
  });

  it('is a native required control, and the marker is hidden from assistive technology', async () => {
    mountView(() => field({ required: true }));
    await nextTick();
    expect(control().required).toBe(true);
    expect(control().hasAttribute('aria-required')).toBe(false);
    expect(screen.getByText('*').getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('textbox', { name: 'Name' })).toBe(control());
  });

  it('is reached by Tab and skipped when disabled, and read-only stays focusable', async () => {
    mountView(() =>
      h(FormField, null, () => [
        h(Input, { 'aria-label': 'a' }),
        h(Input, { 'aria-label': 'b', disabled: true }),
        h(Input, { 'aria-label': 'c', readonly: true }),
      ]),
    );
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('a'));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('c'));
  });
});
