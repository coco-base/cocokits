// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi, expectTypeOf, type MockInstance } from 'vitest';
import { isSet, must, nextTask, strict } from '../../internal/tests/choice-fixtures';
import { Radio, type RadioProps } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const radio = (name: string): HTMLInputElement => screen.getByRole<HTMLInputElement>('radio', { name });
const rootOf = (name: string): HTMLElement => must(radio(name).closest<HTMLElement>('.cck-radio'));

/** Three radios of one group, each driven by one selected value. */
function Controlled({
  onChange,
  accept = true,
}: {
  readonly onChange: (plan: string, checked: boolean, reason: string) => void;
  readonly accept?: boolean;
}): ReactElement {
  const [plan, setPlan] = useState('free');
  return (
    <fieldset>
      <legend>Plan</legend>
      {['free', 'pro', 'team'].map((value) => (
        <Radio
          key={value}
          name="plan"
          value={value}
          checked={plan === value}
          onCheckedChange={(checked, details) => {
            onChange(value, checked, details.reason);
            if (checked && accept) setPlan(value);
          }}
        >
          {value.charAt(0).toUpperCase()}
          {value.slice(1)}
        </Radio>
      ))}
    </fieldset>
  );
}

describe('Radio rendering', () => {
  it('renders the anatomy around a native radio with the label content', () => {
    render(
      strict(
        <Radio name="plan" value="free">
          Free
        </Radio>,
      ),
    );
    const root = rootOf('Free');
    expect(root.tagName).toBe('DIV');
    expect(root.querySelector('.cck-radio__wrapper > .cck-radio__input-wrapper > input.cck-radio__input')).toBe(
      radio('Free'),
    );
    expect(root.querySelector('label.cck-radio__label')?.getAttribute('for')).toBe(radio('Free').id);
    expect(radio('Free').type).toBe('radio');
    expect(radio('Free').value).toBe('free');
    for (const part of ['backdrop', 'background']) {
      expect(root.querySelector(`.cck-radio__${part}`)?.getAttribute('aria-hidden')).toBe('true');
    }
    expect(root.querySelector('.cck-radio__input-wrapper')?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('renders only data-checked, data-disabled and data-required on the root, and no aria-checked', () => {
    render(
      <Radio name="plan" defaultChecked disabled required>
        Free
      </Radio>,
    );
    expect(
      rootOf('Free')
        .getAttributeNames()
        .filter((name) => name.startsWith('data-'))
        .sort(),
    ).toEqual(['data-checked', 'data-disabled', 'data-required']);
    expect(radio('Free').disabled).toBe(true);
    expect(radio('Free').required).toBe(true);
    expect(isSet(radio('Free'), 'aria-checked')).toBe(false);
    expect(isSet(radio('Free'), 'aria-readonly')).toBe(false);
  });

  it('sends ref to the input and the layout attributes to the root', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Radio ref={ref} name="p" className="mine" style={{ color: 'red' }} id="x" aria-label="Free">
        Caption
      </Radio>,
    );
    expect(ref.current).toBe(radio('Free'));
    expect(rootOf('Free').className).toBe('cck-radio mine');
    expect(rootOf('Free').style.color).toBe('red');
    expect(radio('Free').id).toBe('x');
    expect(isSet(rootOf('Free'), 'id')).toBe(false);
  });

  it('sends a native hidden to the root and not to the input', () => {
    render(
      <Radio name="plan" hidden>
        Free
      </Radio>,
    );
    const input = must(document.querySelector('input'));
    expect(must(input.closest<HTMLElement>('.cck-radio')).hidden).toBe(true);
    expect(input.hasAttribute('hidden')).toBe(false);
  });

  it('replaces the root through render and keeps the parts', () => {
    render(
      <Radio name="p" render={<section data-testid="root" />}>
        Free
      </Radio>,
    );
    expect(screen.getByTestId('root').tagName).toBe('SECTION');
    expect(screen.getByTestId('root').querySelector('label')?.textContent).toBe('Free');
  });

  it('carries the checked attribute and starts from defaultChecked', () => {
    render(
      <Radio name="p" defaultChecked>
        Free
      </Radio>,
    );
    expect(radio('Free').checked).toBe(true);
    expect(isSet(rootOf('Free'), 'data-checked')).toBe(true);
  });
});

describe('Radio groups', () => {
  it('unchecks the other uncontrolled radio of the group on a click and emits on it with user', async () => {
    const first = vi.fn();
    const second = vi.fn();
    render(
      strict(
        <>
          <Radio name="plan" defaultChecked onCheckedChange={first}>
            Free
          </Radio>
          <Radio name="plan" onCheckedChange={second}>
            Pro
          </Radio>
        </>,
      ),
    );
    await userEvent.click(radio('Pro'));
    expect(radio('Free').checked).toBe(false);
    expect(isSet(rootOf('Free'), 'data-checked')).toBe(false);
    expect(isSet(rootOf('Pro'), 'data-checked')).toBe(true);
    expect(first).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledWith(false, { reason: 'user', event: expect.any(Event) as Event });
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'user' }));
  });

  it('follows the group when the arrow key checks the next radio', async () => {
    const first = vi.fn();
    render(
      <fieldset>
        <Radio name="plan" defaultChecked onCheckedChange={first}>
          Free
        </Radio>
        <Radio name="plan">Pro</Radio>
      </fieldset>,
    );
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(radio('Free'));
    await user.keyboard('{ArrowDown}');
    expect(radio('Pro').checked).toBe(true);
    expect(isSet(rootOf('Free'), 'data-checked')).toBe(false);
    expect(first).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'user' }));
  });

  it('emits on a radio only when it was checked, and not for a radio of another name', async () => {
    const free = vi.fn();
    const pro = vi.fn();
    const other = vi.fn();
    render(
      <>
        <Radio name="plan" onCheckedChange={free}>
          Free
        </Radio>
        <Radio name="plan" defaultChecked onCheckedChange={pro}>
          Pro
        </Radio>
        <Radio name="team" defaultChecked onCheckedChange={other}>
          Team
        </Radio>
        <Radio name="plan">Business</Radio>
      </>,
    );
    await userEvent.click(radio('Business'));
    expect(pro).toHaveBeenCalledTimes(1);
    expect(free).not.toHaveBeenCalled();
    expect(other).not.toHaveBeenCalled();
    expect(radio('Team').checked).toBe(true);
  });

  it('keeps every radio of a controlling parent in step and emits on the one that lost the check', async () => {
    const onChange = vi.fn();
    render(strict(<Controlled onChange={onChange} />));
    expect(radio('Free').checked).toBe(true);
    await userEvent.click(radio('Pro'));
    expect(radio('Pro').checked).toBe(true);
    expect(radio('Free').checked).toBe(false);
    expect(isSet(rootOf('Free'), 'data-checked')).toBe(false);
    expect(onChange).toHaveBeenCalledWith('pro', true, 'user');
    expect(onChange).toHaveBeenCalledWith('free', false, 'user');
    expect(onChange).not.toHaveBeenCalledWith('team', false, expect.anything());
    expect(onChange.mock.calls.map((call: unknown[]) => call[0])).toEqual(['free', 'pro']);
  });

  it('keeps the controlled state when the parent rejects the change', async () => {
    const onChange = vi.fn();
    render(strict(<Controlled onChange={onChange} accept={false} />));
    await userEvent.click(radio('Pro'));
    expect(radio('Free').checked).toBe(true);
    expect(radio('Pro').checked).toBe(false);
    expect(isSet(rootOf('Free'), 'data-checked')).toBe(true);
    expect(onChange).toHaveBeenCalledWith('pro', true, 'user');
    expect(onChange).toHaveBeenCalledWith('free', false, 'user');
  });

  it('reports a user change from the native change event, the radio that lost the check first', async () => {
    const calls: string[] = [];
    render(
      <fieldset>
        <Radio
          name="plan"
          defaultChecked
          onCheckedChange={(checked, { event }) => calls.push(`free ${String(checked)} ${String(event?.type)}`)}
        >
          Free
        </Radio>
        <Radio
          name="plan"
          onCheckedChange={(checked, { event }) => calls.push(`pro ${String(checked)} ${String(event?.type)}`)}
        >
          Pro
        </Radio>
      </fieldset>,
    );
    await userEvent.click(radio('Pro'));
    expect(calls).toEqual(['free false change', 'pro true change']);
    calls.length = 0;
    radio('Pro').focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(calls).toEqual(['pro false change', 'free true change']);
  });

  it('follows the arrow key in a controlled group', async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(radio('Pro').checked).toBe(true);
    expect(isSet(rootOf('Free'), 'data-checked')).toBe(false);
    expect(onChange).toHaveBeenCalledWith('free', false, 'user');
  });

  it('shows a parent write and emits nothing for it', () => {
    const onCheckedChange = vi.fn();
    const view = render(
      <Radio name="p" checked={false} onCheckedChange={onCheckedChange}>
        Free
      </Radio>,
    );
    view.rerender(
      <Radio name="p" checked onCheckedChange={onCheckedChange}>
        Free
      </Radio>,
    );
    expect(radio('Free').checked).toBe(true);
    expect(isSet(rootOf('Free'), 'data-checked')).toBe(true);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});

describe('Radio in a form', () => {
  it('submits the value of the checked radio, and blocks checkValidity while required and none is checked', async () => {
    render(
      <form data-testid="form">
        <Radio name="plan" value="free" required>
          Free
        </Radio>
        <Radio name="plan" value="pro">
          Pro
        </Radio>
      </form>,
    );
    const form = screen.getByTestId<HTMLFormElement>('form');
    expect(new FormData(form).has('plan')).toBe(false);
    expect(form.checkValidity()).toBe(false);
    await userEvent.click(radio('Pro'));
    expect(new FormData(form).get('plan')).toBe('pro');
    expect(form.checkValidity()).toBe(true);
  });

  it('restores the mount state on a reset and reports form-reset on both radios', async () => {
    const free = vi.fn();
    const pro = vi.fn();
    render(
      strict(
        <form data-testid="form">
          <Radio name="plan" defaultChecked onCheckedChange={free}>
            Free
          </Radio>
          <Radio name="plan" onCheckedChange={pro}>
            Pro
          </Radio>
        </form>,
      ),
    );
    await userEvent.click(radio('Pro'));
    free.mockClear();
    pro.mockClear();
    act(() => {
      screen.getByTestId<HTMLFormElement>('form').reset();
    });
    await act(nextTask);
    expect(radio('Free').checked).toBe(true);
    expect(isSet(rootOf('Free'), 'data-checked')).toBe(true);
    expect(isSet(rootOf('Pro'), 'data-checked')).toBe(false);
    expect(free).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'form-reset' }));
    expect(pro).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'form-reset' }));
  });

  it('renders data-disabled from a disabling fieldset', async () => {
    const view = render(
      <fieldset disabled={false}>
        <Radio name="p">Free</Radio>
      </fieldset>,
    );
    view.rerender(
      <fieldset disabled>
        <Radio name="p">Free</Radio>
      </fieldset>,
    );
    await act(nextTask);
    expect(isSet(rootOf('Free'), 'data-disabled')).toBe(true);
    expect(radio('Free').disabled).toBe(true);
  });
});

describe('Radio props', () => {
  it('does not accept aria-invalid or aria-readonly, which a radio does not support', () => {
    expectTypeOf<RadioProps>().not.toHaveProperty('aria-invalid');
    expectTypeOf<RadioProps>().not.toHaveProperty('aria-readonly');
    const props = { 'aria-invalid': 'true' };
    render(
      <Radio name="p" {...props}>
        Free
      </Radio>,
    );
    expect(isSet(radio('Free'), 'aria-invalid')).toBe(false);
  });
});

describe('Radio name warning', () => {
  const warned = (warn: MockInstance): boolean =>
    warn.mock.calls.some(([text]: unknown[]) => String(text).includes('Radio has no name'));

  it('warns without a name, and not with one', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Radio>Free</Radio>);
    expect(warned(warn)).toBe(true);
    warn.mockClear();
    cleanup();
    render(<Radio name="plan">Free</Radio>);
    expect(warned(warn)).toBe(false);
  });
});
