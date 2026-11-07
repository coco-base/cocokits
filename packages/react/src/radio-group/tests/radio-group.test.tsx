// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { radioGroupMeta } from '@cocokits/machines/radio-group';
import { must, nextTask, strict } from '../../internal/tests/choice-fixtures';
import { Radio } from '../../radio';
import { RadioGroup, type RadioGroupChangeDetails } from '../index';
import { Example } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const radios = (): HTMLInputElement[] => screen.getAllByRole<HTMLInputElement>('radio');
const radio = (name: string): HTMLInputElement => screen.getByRole<HTMLInputElement>('radio', { name });
const checkedValues = (): string[] => radios().flatMap((input) => (input.checked ? [input.value] : []));
const group = (): HTMLElement => screen.getByRole('radiogroup');

/** Dispatches a native keydown on the input and returns it, to read `defaultPrevented`. */
function press(target: HTMLElement, init: KeyboardEventInit): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { ...init, bubbles: true, cancelable: true });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

describe('RadioGroup rendering', () => {
  it('renders the default element of the meta', () => {
    render(<Example />);
    expect(group().localName).toBe(radioGroupMeta.defaultElements?.root);
  });

  it('renders the root with its role, class and facts, and passes native props and the ref through', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      strict(
        <RadioGroup ref={ref} aria-label="Plan" id="plans" className="mine" disabled required orientation="horizontal">
          <Radio value="free">Free</Radio>
        </RadioGroup>,
      ),
    );
    const root = group();
    expect(root.tagName).toBe('DIV');
    expect(ref.current).toBe(root);
    expect(root.id).toBe('plans');
    expect(root.className).toBe('cck-radio-group mine');
    expect(root.getAttribute('aria-disabled')).toBe('true');
    expect(root.getAttribute('aria-required')).toBe('true');
    expect(root.getAttribute('aria-orientation')).toBe('horizontal');
    expect(root.hasAttribute('data-disabled')).toBe(true);
    expect(root.hasAttribute('data-required')).toBe(true);
    expect(root.getAttribute('data-orientation')).toBe('horizontal');
    expect(root.hasAttribute('name')).toBe(false);
    expect(root.hasAttribute('form')).toBe(false);
  });

  it('renders no optional facts by default', () => {
    render(<Example />);
    expect(group().getAttributeNames().sort()).toEqual(['aria-label', 'class', 'role']);
  });

  it('renders a render element and only the author dir', () => {
    render(
      <RadioGroup aria-label="Plan" render={<section data-x="1" />} dir="rtl">
        <Radio value="a">A</Radio>
      </RadioGroup>,
    );
    const root = group();
    expect(root.tagName).toBe('SECTION');
    expect(root.getAttribute('data-x')).toBe('1');
    expect(root.getAttribute('dir')).toBe('rtl');
  });

  it('gives the function form of render the state', () => {
    render(
      <RadioGroup
        aria-label="Plan"
        defaultValue="a"
        required
        render={(props, state) => <div {...props} data-seen={`${String(state.value)}-${String(state.required)}`} />}
      >
        <Radio value="a">A</Radio>
      </RadioGroup>,
    );
    expect(group().getAttribute('data-seen')).toBe('a-true');
  });

  it('shares one name and lets the group name win over a radio name', () => {
    render(
      <RadioGroup aria-label="Plan" name="plan">
        <Radio value="a" name="ignored">
          A
        </Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    expect(radios().map((input) => input.name)).toEqual(['plan', 'plan']);
  });

  it('warns in development for a radio without a value and never checks it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <RadioGroup aria-label="Plan">
        <Radio>No value</Radio>
      </RadioGroup>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain('no value');
    expect(radios()[0]?.checked).toBe(false);
  });

  it('keeps a value that matches no radio and checks none', () => {
    render(<Example value="nope" />);
    expect(checkedValues()).toEqual([]);
  });
});

describe('RadioGroup keyboard', () => {
  it('arrows focus and check the next and previous radio, with a wrap', async () => {
    render(<Example defaultValue="free" />);
    const user = userEvent.setup();
    radio('Free').focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(radio('Pro'));
    expect(checkedValues()).toEqual(['pro']);
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(document.activeElement).toBe(radio('Free'));
    expect(checkedValues()).toEqual(['free']);
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(radio('Team'));
    await user.keyboard('{ArrowLeft}');
    expect(checkedValues()).toEqual(['pro']);
  });

  it('skips a disabled radio', async () => {
    render(<Example defaultValue="free" lockPro />);
    radio('Free').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(radio('Team'));
    expect(checkedValues()).toEqual(['team']);
  });

  it('stops at the end with loop=false and prevents the browser move', () => {
    render(<Example defaultValue="team" loop={false} />);
    radio('Team').focus();
    expect(press(radio('Team'), { key: 'ArrowDown' }).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(radio('Team'));
    expect(checkedValues()).toEqual(['team']);
  });

  it('moves only on the axis of the orientation and still blocks the other', () => {
    render(<Example defaultValue="free" orientation="vertical" />);
    radio('Free').focus();
    expect(press(radio('Free'), { key: 'ArrowRight' }).defaultPrevented).toBe(true);
    expect(checkedValues()).toEqual(['free']);
    press(radio('Free'), { key: 'ArrowDown' });
    expect(checkedValues()).toEqual(['pro']);
  });

  it('swaps Left and Right in rtl', async () => {
    render(<Example defaultValue="free" dir="rtl" />);
    radio('Free').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(checkedValues()).toEqual(['pro']);
    await userEvent.keyboard('{ArrowDown}');
    expect(checkedValues()).toEqual(['team']);
  });

  it('leaves Home, End, Enter and modified arrows alone', () => {
    render(<Example defaultValue="free" />);
    radio('Free').focus();
    for (const init of [{ key: 'Home' }, { key: 'End' }, { key: 'Enter' }, { key: 'ArrowDown', ctrlKey: true }]) {
      expect(press(radio('Free'), init).defaultPrevented).toBe(false);
    }
    expect(checkedValues()).toEqual(['free']);
  });

  it('handles nothing in a disabled group', () => {
    render(<Example defaultValue="free" disabled />);
    expect(press(radio('Free'), { key: 'ArrowDown' }).defaultPrevented).toBe(false);
  });

  it('runs the author onKeyDown first, and a prevented key is left alone', () => {
    const onKeyDown = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });
    render(<Example defaultValue="free" onKeyDown={onKeyDown} />);
    fireEvent.keyDown(radio('Free'), { key: 'ArrowDown' });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(checkedValues()).toEqual(['free']);
  });

  it('Space checks the focused unchecked radio', async () => {
    render(<Example />);
    radio('Pro').focus();
    await userEvent.keyboard(' ');
    expect(checkedValues()).toEqual(['pro']);
  });

  it('Space in the group selects the focused radio and reports the group change once', async () => {
    const onValueChange = vi.fn<(value: string | null, details: RadioGroupChangeDetails) => void>();
    render(<Example defaultValue="free" onValueChange={onValueChange} />);
    radio('Pro').focus();
    await userEvent.keyboard(' ');
    expect(checkedValues()).toEqual(['pro']);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]?.[0]).toBe('pro');
  });
});

describe('RadioGroup tab stop', () => {
  it('is the checked radio, else the first enabled, and Tab leaves the group', async () => {
    render(<Example lockPro defaultValue="team" />);
    expect(radios().map((input) => input.tabIndex)).toEqual([-1, -1, 0]);
    cleanup();
    render(<Example lockPro />);
    expect(radios().map((input) => input.tabIndex)).toEqual([0, -1, -1]);
    const user = userEvent.setup();
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(radio('Free'));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(radio('Free'));
  });

  it('revalidates when the first radio becomes disabled, and when radios are added, removed and moved', () => {
    function Dynamic({ order, lock }: { readonly order: readonly string[]; readonly lock: boolean }): ReactElement {
      return (
        <RadioGroup aria-label="Plan">
          {order.map((value) => (
            <Radio key={value} value={value} disabled={lock && value === 'a'}>
              {value}
            </Radio>
          ))}
        </RadioGroup>
      );
    }
    const { rerender } = render(<Dynamic order={['a', 'b']} lock={false} />);
    expect(radios().map((input) => input.tabIndex)).toEqual([0, -1]);
    rerender(<Dynamic order={['a', 'b']} lock />);
    expect(radios().map((input) => input.tabIndex)).toEqual([-1, 0]);
    rerender(<Dynamic order={['c', 'a', 'b']} lock />);
    expect(radios().map((input) => [input.value, input.tabIndex])).toEqual([
      ['c', 0],
      ['a', -1],
      ['b', -1],
    ]);
    rerender(<Dynamic order={['b', 'c']} lock />);
    expect(radios().map((input) => [input.value, input.tabIndex])).toEqual([
      ['b', 0],
      ['c', -1],
    ]);
  });

  it('removes the tab stop of a disabled group and disables every radio', () => {
    render(<Example disabled defaultValue="free" />);
    expect(radios().every((input) => input.disabled && input.tabIndex === -1)).toBe(true);
  });
});

describe('RadioGroup value', () => {
  it('is uncontrolled with defaultValue and reports one change per user check with the native event', async () => {
    const onValueChange = vi.fn<(value: string | null, details: RadioGroupChangeDetails) => void>();
    render(<Example defaultValue="free" onValueChange={onValueChange} />);
    await userEvent.click(radio('Pro'));
    expect(checkedValues()).toEqual(['pro']);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]?.[0]).toBe('pro');
    expect(onValueChange.mock.calls[0]?.[1].reason).toBe('user');
    expect(onValueChange.mock.calls[0]?.[1].event?.type).toBe('change');
    await userEvent.click(screen.getByText('Team'));
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(onValueChange.mock.calls[1]?.[0]).toBe('team');
  });

  it('reports once for an arrow key, and the radios report nothing of their own', async () => {
    const onValueChange = vi.fn();
    const onCheckedChange = vi.fn();
    render(
      <RadioGroup aria-label="Plan" defaultValue="a" onValueChange={onValueChange}>
        <Radio value="a" onCheckedChange={onCheckedChange}>
          A
        </Radio>
        <Radio value="b" onCheckedChange={onCheckedChange}>
          B
        </Radio>
      </RadioGroup>,
    );
    radio('A').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('is controlled: a rejected change is written back and a parent write fires nothing', async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Example value="free" onValueChange={onValueChange} />);
    await userEvent.click(radio('Pro'));
    await nextTask();
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(checkedValues()).toEqual(['free']);
    rerender(<Example value="team" onValueChange={onValueChange} />);
    expect(checkedValues()).toEqual(['team']);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    rerender(<Example value={null} onValueChange={onValueChange} />);
    expect(checkedValues()).toEqual([]);
  });

  it('is controlled by a parent that accepts the change', async () => {
    function Parent(): ReactElement {
      const [value, setValue] = useState<string | null>('free');
      return <Example value={value} onValueChange={setValue} />;
    }
    render(<Parent />);
    await userEvent.click(radio('Team'));
    await nextTask();
    expect(checkedValues()).toEqual(['team']);
    expect(radios().map((input) => input.tabIndex)).toEqual([-1, -1, 0]);
  });

  it('ignores the own checked state of a radio in a group', () => {
    render(
      <RadioGroup aria-label="Plan" defaultValue="b">
        <Radio value="a" checked>
          A
        </Radio>
        <Radio value="b" defaultChecked={false}>
          B
        </Radio>
      </RadioGroup>,
    );
    expect(checkedValues()).toEqual(['b']);
  });
});

describe('RadioGroup forms', () => {
  function Form(props: Parameters<typeof Example>[0]): ReactElement {
    return (
      <form>
        <Example {...props} />
        <button type="reset">reset</button>
      </form>
    );
  }
  const form = (): HTMLFormElement => must(document.querySelector('form'));
  const data = (): [string, string][] =>
    [...new FormData(form()).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']);

  it('submits name=value of the checked radio and nothing when none is checked', async () => {
    render(<Form name="plan" />);
    expect(data()).toEqual([]);
    await userEvent.click(radio('Pro'));
    expect(data()).toEqual([['plan', 'pro']]);
  });

  it('is invalid while required and none is checked', async () => {
    render(<Form required />);
    expect(form().checkValidity()).toBe(false);
    await userEvent.click(radio('Free'));
    expect(form().checkValidity()).toBe(true);
  });

  it('gives radios without their own form the group form', () => {
    render(
      <RadioGroup aria-label="Plan" form="outside">
        <Radio value="a">A</Radio>
        <Radio value="b" form="other">
          B
        </Radio>
      </RadioGroup>,
    );
    expect(radios().map((input) => input.getAttribute('form'))).toEqual(['outside', 'other']);
  });

  it('restores the mount value on reset and reports once, only when the value changed', async () => {
    const onValueChange = vi.fn<(value: string | null, details: RadioGroupChangeDetails) => void>();
    render(<Form defaultValue="free" onValueChange={onValueChange} />);
    await userEvent.click(radio('Team'));
    onValueChange.mockClear();
    await userEvent.click(screen.getByRole('button', { name: 'reset' }));
    await nextTask();
    expect(checkedValues()).toEqual(['free']);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]?.[0]).toBe('free');
    expect(onValueChange.mock.calls[0]?.[1].reason).toBe('form-reset');
    onValueChange.mockClear();
    await userEvent.click(screen.getByRole('button', { name: 'reset' }));
    await nextTask();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('reports a reset of a controlled group once and not when the value is the mount value', async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Form value="free" onValueChange={onValueChange} />);
    rerender(<Form value="team" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'reset' }));
    await nextTask();
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]?.[0]).toBe('free');
  });

  it('restores the mount value of a controlled null group, not the default value, on reset', async () => {
    const onValueChange = vi.fn();
    render(<Form value={null} defaultValue="free" onValueChange={onValueChange} />);
    expect(checkedValues()).toEqual([]);
    await userEvent.click(screen.getByRole('button', { name: 'reset' }));
    await nextTask();
    expect(checkedValues()).toEqual([]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('disables the radios of a disabling fieldset', () => {
    render(
      <fieldset disabled>
        <Example />
      </fieldset>,
    );
    expect(radios().every((input) => input.matches(':disabled'))).toBe(true);
  });
});

describe('RadioGroup pointer click', () => {
  function Controlled(): ReactElement {
    const [plan, setPlan] = useState('free');
    return (
      <>
        <RadioGroup
          aria-label="Plan"
          value={plan}
          onValueChange={(next) => {
            setPlan(next ?? '');
          }}
        >
          <Radio value="free">Free</Radio>
          <Radio value="pro">Pro</Radio>
        </RadioGroup>
        <p>plan [{plan}]</p>
      </>
    );
  }

  it('follows a click on another radio of a controlled group', async () => {
    render(<Controlled />);
    await userEvent.click(radio('Pro'));
    expect(screen.getByText('plan [pro]')).toBeTruthy();
    expect(checkedValues()).toEqual(['pro']);
  });

  it('writes the model back to the radio that lost the check after the whole change event, not in a microtask', async () => {
    // The browser runs microtasks between the listeners of one native `change` event. A write-back queued by the
    // radio that lost the check would run before the radio the user checked has reported, and undo the click.
    const microtasks = vi.spyOn(globalThis, 'queueMicrotask');
    render(<Controlled />);
    microtasks.mockClear();
    await userEvent.click(radio('Pro'));
    // Only the radio the user checked queues one.
    expect(microtasks).toHaveBeenCalledTimes(1);
  });
});
