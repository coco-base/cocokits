// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { Switch } from '../../switch';
import { Checkbox } from '../index';
import { isSet, must, strict } from '../../internal/tests/choice-fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const box = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('checkbox');
const select = (selector: string): Element | null => document.querySelector(selector);

function Field({ field = {}, control = {} }: { readonly field?: object; readonly control?: object }): ReactElement {
  return (
    <FormField id="f" label={<Label>Notifications</Label>} hint={<Hint>Weekly only.</Hint>} {...field}>
      <Checkbox {...control}>Email me</Checkbox>
    </FormField>
  );
}

describe('Checkbox in a FormField', () => {
  it('gives the input the control id and points both labels at it', () => {
    render(strict(<Field />));
    expect(box().id).toBe('f-control');
    expect(select('.cck-label')?.getAttribute('for')).toBe('f-control');
    expect(select('.cck-checkbox__label')?.getAttribute('for')).toBe('f-control');
    expect(box().labels?.length).toBe(2);
  });

  it('computes the name from the field label, then the inner label', () => {
    render(<Field />);
    expect(screen.getByRole('checkbox', { name: 'Notifications Email me' })).toBe(box());
  });

  it('works the same for a Switch', () => {
    render(
      <FormField id="s" label={<Label>Notifications</Label>}>
        <Switch>Email me</Switch>
      </FormField>,
    );
    expect(screen.getByRole('switch', { name: 'Notifications Email me' }).id).toBe('s-control');
  });

  it('ends aria-describedby with the feedback wrapper, after the author ids', () => {
    render(<Field control={{ 'aria-describedby': 'note' }} />);
    expect(box().getAttribute('aria-describedby')).toBe('note f-feedback');
  });

  it('is described by the hint', () => {
    render(<Field />);
    expect(screen.getByRole('checkbox', { description: 'Weekly only.' })).toBe(box());
  });

  it('lets an author id win and the labels follow it', () => {
    render(<Field control={{ id: 'mine' }} />);
    expect(box().id).toBe('mine');
    expect(select('.cck-checkbox__label')?.getAttribute('for')).toBe('mine');
    expect(select('.cck-label')?.getAttribute('for')).toBe('mine');
  });

  it('keeps an explicit Label htmlFor', () => {
    render(
      <>
        <FormField id="f" label={<Label htmlFor="elsewhere">Notifications</Label>}>
          <Checkbox>Email me</Checkbox>
        </FormField>
        <input id="elsewhere" aria-label="other" />
      </>,
    );
    expect(select('.cck-label')?.getAttribute('for')).toBe('elsewhere');
    expect(select('.cck-checkbox__label')?.getAttribute('for')).toBe('f-control');
  });

  it('passes the field disabled, required, readOnly and invalid to the input and shows the marker', () => {
    render(<Field field={{ disabled: true, required: true, readOnly: true, invalid: true }} />);
    expect(box().disabled).toBe(true);
    expect(box().required).toBe(true);
    expect(box().getAttribute('aria-readonly')).toBe('true');
    expect(isSet(must(select('.cck-checkbox')), 'data-invalid')).toBe(true);
    expect(select('.cck-label__required-marker')?.textContent).toBe('*');
  });

  it('blocks a toggle when the field is read-only', async () => {
    const onCheckedChange = vi.fn();
    render(<Field field={{ readOnly: true }} control={{ onCheckedChange }} />);
    await userEvent.click(box());
    expect(box().checked).toBe(false);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('shows the control facts on the field root and data-filled while checked', async () => {
    render(strict(<Field field={{ 'data-testid': 'field' }} />));
    const field = screen.getByTestId('field');
    expect(isSet(field, 'data-filled')).toBe(false);
    await userEvent.click(box());
    expect(isSet(field, 'data-filled')).toBe(true);
    expect(isSet(field, 'data-dirty')).toBe(true);
    expect(isSet(must(select('.cck-checkbox')), 'data-filled')).toBe(false);
  });

  it('focuses the input from a click on the field box padding and keeps a label click native', async () => {
    render(<Field />);
    const user = userEvent.setup();
    await user.click(must(select('.cck-form-field__input-wrapper')));
    expect(document.activeElement).toBe(box());
    expect(box().checked).toBe(false);
    await user.click(must(select('.cck-checkbox__label')));
    expect(box().checked).toBe(true);
  });

  it('keeps its own generated id as a second control and warns once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <FormField id="g">
        <Checkbox>One</Checkbox>
        <Checkbox>Two</Checkbox>
      </FormField>,
    );
    const [first, second] = screen.getAllByRole<HTMLInputElement>('checkbox');
    expect(first.id).toBe('g-control');
    expect(second.id).not.toBe('');
    expect(second.id).not.toBe('g-control');
    expect(document.querySelectorAll('.cck-checkbox__label')[1].getAttribute('for')).toBe(second.id);
    expect(warn.mock.calls.filter(([text]) => String(text).includes('holds one control'))).toHaveLength(1);
  });
});
