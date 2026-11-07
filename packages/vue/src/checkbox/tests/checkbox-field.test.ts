// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormField } from '../../form-field';
import { Checkbox } from '../index';
import { mountView } from '../../internal/tests/mount-helpers';
import { box, field } from './fixtures';
import { must } from '../../internal/tests/choice-helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const q = (selector: string): HTMLElement => must(document.querySelector<HTMLElement>(selector));
const caption = (): VNode => field();

describe('Checkbox in a FormField', () => {
  it('gives the input the control id and points both labels at it', async () => {
    mountView(() => caption());
    await nextTick();
    expect(box().id).toBe('f-control');
    expect(q('.cck-label').getAttribute('for')).toBe('f-control');
    expect(q('.cck-checkbox__label').getAttribute('for')).toBe('f-control');
    expect(box().labels?.length).toBe(2);
  });

  it('computes the name from the field label, then the inner label', async () => {
    mountView(() => caption());
    await nextTick();
    expect(screen.getByRole('checkbox', { name: 'Notifications Email me' })).toBe(box());
  });

  it('ends aria-describedby with the hint id and is described by the hint', async () => {
    mountView(() => field(() => h(Checkbox, { ariaDescribedby: 'note' }, () => 'Email me')));
    await nextTick();
    expect(box().getAttribute('aria-describedby')).toBe('note f-hint-1');
    expect(screen.getByRole('checkbox', { description: 'Weekly only.' })).toBe(box());
  });

  it('lets an author id win and the labels follow it', async () => {
    mountView(() => field(() => h(Checkbox, { id: 'mine' }, () => 'Email me')));
    await nextTick();
    expect(box().id).toBe('mine');
    expect(q('.cck-checkbox__label').getAttribute('for')).toBe('mine');
    expect(q('.cck-label').getAttribute('for')).toBe('mine');
  });

  it('passes the field disabled, required, readonly and invalid to the input', async () => {
    mountView(() => field(undefined, { disabled: true, required: true, readonly: true, invalid: true }));
    await nextTick();
    const input = box();
    expect(input.disabled).toBe(true);
    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-readonly')).toBe('true');
    expect(q('.cck-checkbox').hasAttribute('data-invalid')).toBe(true);
    expect(q('.cck-label__required-marker').textContent).toBe('*');
  });

  it('shows the control facts on the field root and data-filled while checked', async () => {
    mountView(() => caption());
    await nextTick();
    const fieldRoot = q('.cck-form-field');
    expect(fieldRoot.hasAttribute('data-filled')).toBe(false);
    await userEvent.click(box());
    expect(fieldRoot.hasAttribute('data-filled')).toBe(true);
    expect(fieldRoot.hasAttribute('data-dirty')).toBe(true);
    expect(q('.cck-checkbox').hasAttribute('data-filled')).toBe(false);
  });

  it('focuses the input from a click on the field box padding and keeps a label click native', async () => {
    mountView(() => caption());
    await nextTick();
    await userEvent.click(q('.cck-form-field__input-wrapper'));
    expect(document.activeElement).toBe(box());
    expect(box().checked).toBe(false);
    await userEvent.click(q('.cck-checkbox__label'));
    expect(box().checked).toBe(true);
  });

  it('keeps its own generated id as a second control and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() => h(FormField, { id: 'g' }, () => [h(Checkbox, null, () => 'One'), h(Checkbox, null, () => 'Two')]));
    await nextTick();
    const [first, second] = [...document.querySelectorAll('input')];
    expect(first.id).toBe('g-control');
    expect(second.id).not.toBe('g-control');
    expect(second.id).not.toBe('');
    await nextTick();
    expect(document.querySelectorAll('.cck-checkbox__label')[1].getAttribute('for')).toBe(second.id);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
