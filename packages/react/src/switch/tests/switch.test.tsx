// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../../checkbox';
import { isSet, must, nextFrame, strict } from '../../internal/tests/choice-fixtures';
import { Switch } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const toggle = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('switch');
const rootOf = (): HTMLElement => must(toggle().closest<HTMLElement>('.cck-switch'));

describe('Switch', () => {
  it('renders the label around the track and the content, and a checkbox input with role switch', () => {
    render(strict(<Switch>Email notifications</Switch>));
    const root = rootOf();
    expect(root.tagName).toBe('DIV');
    expect(root.querySelector('label.cck-switch__label > .cck-switch__track > input.cck-switch__input')).toBe(toggle());
    expect(toggle().type).toBe('checkbox');
    expect(toggle().getAttribute('role')).toBe('switch');
    expect(isSet(toggle(), 'aria-checked')).toBe(false);
    for (const part of ['thumb', 'backdrop']) {
      expect(root.querySelector(`.cck-switch__${part}`)?.getAttribute('aria-hidden')).toBe('true');
    }
    expect(root.querySelector('.cck-switch__track')?.hasAttribute('aria-hidden')).toBe(false);
    expect(root.querySelector('.cck-switch__label')?.getAttribute('for')).toBe(toggle().id);
    expect(screen.getByRole('switch', { name: 'Email notifications' })).toBe(toggle());
  });

  it('keeps a role the author passes from replacing the switch role', () => {
    const props = { role: 'checkbox' };
    render(<Switch {...(props as object)}>Email</Switch>);
    expect(toggle().getAttribute('role')).toBe('switch');
  });

  it('routes ref to the input and the layout attributes to the root', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Switch ref={ref} className="mine" style={{ color: 'red' }} name="n" value="v">
        Caption
      </Switch>,
    );
    expect(ref.current).toBe(toggle());
    expect(rootOf().className).toBe('cck-switch mine');
    expect(rootOf().style.color).toBe('red');
    expect(toggle().name).toBe('n');
    expect(toggle().value).toBe('v');
    expect(isSet(rootOf(), 'name')).toBe(false);
  });

  it('toggles on a click, the label and Space, and emits user once for each', async () => {
    const onCheckedChange = vi.fn();
    render(strict(<Switch onCheckedChange={onCheckedChange}>Caption</Switch>));
    const user = userEvent.setup();
    await user.click(toggle());
    expect(toggle().checked).toBe(true);
    expect(isSet(rootOf(), 'data-checked')).toBe(true);
    await user.click(must(document.querySelector('label')));
    expect(toggle().checked).toBe(false);
    toggle().focus();
    await user.keyboard(' ');
    expect(toggle().checked).toBe(true);
    expect(
      onCheckedChange.mock.calls.map((call: unknown[]) => [call[0], (call[1] as { reason: string }).reason]),
    ).toEqual([
      [true, 'user'],
      [false, 'user'],
      [true, 'user'],
    ]);
  });

  it('restores a change the controlling parent rejects', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch checked={false} onCheckedChange={onCheckedChange}>
        Caption
      </Switch>,
    );
    await userEvent.click(toggle());
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(toggle().checked).toBe(false);
  });

  it.each([
    ['uncontrolled', { defaultChecked: true }],
    ['controlled', { checked: true }],
  ])('blocks every user toggle while read-only when %s', async (_name, props) => {
    const onCheckedChange = vi.fn();
    render(
      <Switch readOnly onCheckedChange={onCheckedChange} {...props}>
        Caption
      </Switch>,
    );
    const user = userEvent.setup();
    expect(toggle().getAttribute('aria-readonly')).toBe('true');
    expect(isSet(rootOf(), 'data-readonly')).toBe(true);
    await user.click(toggle());
    await user.click(must(document.querySelector('label')));
    toggle().focus();
    await user.keyboard(' ');
    expect(toggle().checked).toBe(true);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(toggle());
  });

  it('renders no data-indeterminate and ignores a mixed state', () => {
    render(<Switch defaultChecked>Caption</Switch>);
    expect(isSet(rootOf(), 'data-indeterminate')).toBe(false);
    expect(toggle().indeterminate).toBe(false);
  });

  it('submits its value while checked and takes part in the form facts', async () => {
    render(
      <form data-testid="form">
        <Switch name="notify" value="yes" required invalid>
          Caption
        </Switch>
      </form>,
    );
    const form = screen.getByTestId<HTMLFormElement>('form');
    expect(new FormData(form).has('notify')).toBe(false);
    expect(form.checkValidity()).toBe(false);
    await userEvent.click(toggle());
    expect(new FormData(form).get('notify')).toBe('yes');
    expect(form.checkValidity()).toBe(true);
    expect(isSet(rootOf(), 'data-required')).toBe(true);
    expect(isSet(rootOf(), 'data-invalid')).toBe(true);
  });

  it('warns for an empty label part with no other name, and not for a Switch with content', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const warned = (): boolean => warn.mock.calls.some(([text]) => String(text).includes('has no accessible name'));
    render(<Switch />);
    await nextFrame();
    expect(warned()).toBe(true);
    warn.mockClear();
    cleanup();
    render(
      <>
        <Switch>Caption</Switch>
        <Switch aria-label="Name" />
        <Checkbox>Box</Checkbox>
      </>,
    );
    await nextFrame();
    expect(warned()).toBe(false);
  });
});
