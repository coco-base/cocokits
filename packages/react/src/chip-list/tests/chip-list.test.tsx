// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChipList, type ChipListChangeDetails } from '../index';
import { chipTexts, chips, Controlled, listRoot, removeOf, textbox } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ChipList parts', () => {
  it('renders a div root, one removable chip per value in order, then the text box', () => {
    render(<ChipList aria-label="Toppings" defaultValue={['Pizza', 'Salad']} placeholder="Add" />);
    expect(listRoot().tagName).toBe('DIV');
    expect(chipTexts()).toEqual(['Pizza', 'Salad']);
    expect(screen.getAllByRole('button').map((button) => button.className)).toEqual([
      'cck-chip__remove',
      'cck-chip__remove',
    ]);
    const input = textbox();
    expect(input.className).toBe('cck-chip-list__input');
    expect(input.getAttribute('type')).toBe('text');
    expect(input.getAttribute('autocomplete')).toBe('off');
    expect(input.getAttribute('placeholder')).toBe('Add');
    expect(input.hasAttribute('name')).toBe(false);
    expect(input.hasAttribute('required')).toBe(false);
    expect(listRoot().lastElementChild).toBe(input);
  });

  it('routes the labelling attributes to the text box and the rest to the root', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ChipList ref={ref} id="mine" aria-label="Toppings" aria-describedby="help" className="x" title="T" />);
    expect(textbox().id).toBe('mine');
    expect(textbox().getAttribute('aria-label')).toBe('Toppings');
    expect(textbox().getAttribute('aria-describedby')).toBe('help');
    expect(listRoot().hasAttribute('aria-label')).toBe(false);
    expect(listRoot().className).toBe('cck-chip-list x');
    expect(listRoot().getAttribute('title')).toBe('T');
    expect(ref.current).toBe(listRoot());
  });

  it('renders the root as the element given to render', () => {
    render(<ChipList aria-label="Toppings" defaultValue={['Pizza']} render={<section data-own="" />} />);
    expect(listRoot().tagName).toBe('SECTION');
    expect(listRoot().hasAttribute('data-own')).toBe(true);
    expect(chipTexts()).toEqual(['Pizza']);
  });

  it('renders native hidden on the root', () => {
    render(<ChipList aria-label="Toppings" hidden />);
    expect(listRoot().hasAttribute('hidden')).toBe(true);
  });
});

describe('ChipList adding', () => {
  it('adds a trimmed text on Enter, clears the draft and keeps the form from submitting', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: readonly string[], details: ChipListChangeDetails) => void>();
    render(<ChipList aria-label="Toppings" onValueChange={onValueChange} />);
    await user.type(textbox(), '  Pizza  ');
    const notPrevented = fireEvent.keyDown(textbox(), { key: 'Enter' });
    expect(notPrevented).toBe(false);
    expect(chipTexts()).toEqual(['Pizza']);
    expect(textbox().value).toBe('');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]?.[0]).toEqual(['Pizza']);
    expect(onValueChange.mock.calls[0]?.[1].reason).toBe('add');
    expect(onValueChange.mock.calls[0]?.[1].event).toBeInstanceOf(Event);
  });

  it('clears the draft of a duplicate and reports nothing', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ChipList aria-label="Toppings" defaultValue={['Pizza']} onValueChange={onValueChange} />);
    await user.type(textbox(), 'Pizza{Enter}');
    expect(chipTexts()).toEqual(['Pizza']);
    expect(textbox().value).toBe('');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it.each([
    ['an empty draft', '', { key: 'Enter' }, true],
    ['a blank draft', '   ', { key: 'Enter' }, true],
    ['Shift', 'Pizza', { key: 'Enter', shiftKey: true }, true],
    ['Ctrl', 'Pizza', { key: 'Enter', ctrlKey: true }, true],
    ['Alt', 'Pizza', { key: 'Enter', altKey: true }, true],
    ['Meta', 'Pizza', { key: 'Enter', metaKey: true }, true],
    ['an IME composition', 'Pizza', { key: 'Enter', isComposing: true }, true],
    ['another key', 'Pizza', { key: 'a' }, true],
  ])('adds nothing and keeps the default for %s', (_name, text, init, kept) => {
    const onValueChange = vi.fn();
    render(<ChipList aria-label="Toppings" onValueChange={onValueChange} />);
    fireEvent.change(textbox(), { target: { value: text } });
    expect(fireEvent.keyDown(textbox(), init)).toBe(kept);
    expect(chips()).toHaveLength(0);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(textbox().value).toBe(text);
  });

  it('adds on blur only with addOnBlur', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <>
        <ChipList aria-label="Toppings" />
        <button type="button">Other</button>
      </>,
    );
    await user.type(textbox(), 'Pizza');
    await user.click(screen.getByText('Other'));
    expect(chips()).toHaveLength(0);
    expect(textbox().value).toBe('Pizza');
    rerender(
      <>
        <ChipList aria-label="Toppings" addOnBlur />
        <button type="button">Other</button>
      </>,
    );
    await user.click(textbox());
    await user.click(screen.getByText('Other'));
    expect(chipTexts()).toEqual(['Pizza']);
    expect(textbox().value).toBe('');
  });
});

describe('ChipList removing', () => {
  it('removes the value at the position of the chip and reports the reason', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: readonly string[], details: ChipListChangeDetails) => void>();
    render(<ChipList aria-label="Toppings" defaultValue={['A', 'B', 'C']} onValueChange={onValueChange} />);
    await user.click(removeOf('B'));
    expect(chipTexts()).toEqual(['A', 'C']);
    expect(onValueChange).toHaveBeenCalledWith(['A', 'C'], expect.objectContaining({ reason: 'remove' }));
    expect(onValueChange.mock.calls[0]?.[1].event).toBeInstanceOf(Event);
  });

  it('removes only the chip at that position when the parent value holds duplicates, with no warning', async () => {
    const user = userEvent.setup();
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const onChange = vi.fn();
    render(<Controlled initial={['Pizza', 'Pizza']} onChange={onChange} />);
    expect(chipTexts()).toEqual(['Pizza', 'Pizza']);
    await user.click(screen.getAllByRole('button', { name: 'Pizza' })[1]);
    expect(onChange).toHaveBeenCalledWith(['Pizza'], expect.objectContaining({ reason: 'remove' }));
    expect(chipTexts()).toEqual(['Pizza']);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it('removes with Enter and Space on the remove button', async () => {
    const user = userEvent.setup();
    render(<ChipList aria-label="Toppings" defaultValue={['A', 'B', 'C']} />);
    removeOf('A').focus();
    await user.keyboard('{Enter}');
    expect(chipTexts()).toEqual(['B', 'C']);
    removeOf('B').focus();
    await user.keyboard(' ');
    expect(chipTexts()).toEqual(['C']);
  });
});

describe('ChipList disabled and read-only', () => {
  it.each([
    ['disabled', { disabled: true }],
    ['read-only', { readOnly: true }],
  ])('adds and removes nothing while %s', async (_name, props) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ChipList aria-label="Toppings" defaultValue={['A']} onValueChange={onValueChange} {...props} />);
    fireEvent.change(textbox(), { target: { value: 'B' } });
    fireEvent.keyDown(textbox(), { key: 'Enter' });
    await user.click(removeOf('A'));
    expect(chipTexts()).toEqual(['A']);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(removeOf('A').hasAttribute('disabled')).toBe(true);
    expect(removeOf('A').closest('.cck-chip')?.hasAttribute('data-disabled')).toBe(true);
  });

  it('disables the text box natively when disabled and makes it readonly when read-only', () => {
    const { rerender } = render(<ChipList aria-label="Toppings" disabled />);
    expect(textbox().hasAttribute('disabled')).toBe(true);
    expect(listRoot().hasAttribute('data-disabled')).toBe(true);
    rerender(<ChipList aria-label="Toppings" readOnly />);
    expect(textbox().hasAttribute('disabled')).toBe(false);
    expect(textbox().hasAttribute('readonly')).toBe(true);
    expect(listRoot().hasAttribute('data-readonly')).toBe(true);
  });
});

describe('ChipList value and change', () => {
  it('never reports a value the parent sets', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<ChipList aria-label="Toppings" value={['A']} onValueChange={onValueChange} />);
    rerender(<ChipList aria-label="Toppings" value={['A', 'B']} onValueChange={onValueChange} />);
    expect(chipTexts()).toEqual(['A', 'B']);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('keeps showing the parent value when the parent ignores a change', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ChipList aria-label="Toppings" value={['A']} onValueChange={onValueChange} />);
    await user.type(textbox(), 'B{Enter}');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(chipTexts()).toEqual(['A']);
    await user.click(removeOf('A'));
    expect(chipTexts()).toEqual(['A']);
  });

  it('shows a parent value with duplicates and empty texts as given', () => {
    render(<ChipList aria-label="Toppings" value={['A', 'A', '']} />);
    expect(chipTexts()).toEqual(['A', 'A', '']);
  });

  it('works controlled and uncontrolled', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Controlled initial={['A']} />);
    await user.type(textbox(), 'B{Enter}');
    expect(chipTexts()).toEqual(['A', 'B']);
    unmount();
    render(<ChipList aria-label="Toppings" defaultValue={['A']} />);
    await user.type(textbox(), 'B{Enter}');
    expect(chipTexts()).toEqual(['A', 'B']);
  });

  it('marks the list filled with a value or draft text, and dirty after a user change', async () => {
    const user = userEvent.setup();
    render(<ChipList aria-label="Toppings" />);
    expect(listRoot().hasAttribute('data-filled')).toBe(false);
    await user.type(textbox(), 'P');
    expect(listRoot().hasAttribute('data-filled')).toBe(true);
    await user.clear(textbox());
    expect(listRoot().hasAttribute('data-filled')).toBe(false);
    expect(listRoot().hasAttribute('data-dirty')).toBe(false);
    await user.type(textbox(), 'Pizza{Enter}');
    expect(listRoot().hasAttribute('data-filled')).toBe(true);
    expect(listRoot().hasAttribute('data-dirty')).toBe(true);
  });

  it('is focused while focus is inside, and touched once focus leaves', async () => {
    const user = userEvent.setup();
    render(
      <>
        <ChipList aria-label="Toppings" defaultValue={['A']} />
        <button type="button">Other</button>
      </>,
    );
    await user.click(textbox());
    expect(listRoot().hasAttribute('data-focused')).toBe(true);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(removeOf('A'));
    expect(listRoot().hasAttribute('data-focused')).toBe(true);
    expect(listRoot().hasAttribute('data-touched')).toBe(false);
    await user.click(screen.getByText('Other'));
    expect(listRoot().hasAttribute('data-focused')).toBe(false);
    expect(listRoot().hasAttribute('data-touched')).toBe(true);
  });
});

interface FocusRow {
  readonly name: string;
  readonly start: readonly string[];
  /** The chip whose remove button has focus, or `'input'`. */
  readonly focus: string;
  readonly change: 'activate' | 'shrink' | 'read-only' | 'other-value' | 'disable' | 'add';
  readonly after: 'input' | 'stays';
}

const focusRows: readonly FocusRow[] = [
  { name: 'first chip activated', start: ['A', 'B', 'C'], focus: 'A', change: 'activate', after: 'input' },
  { name: 'middle chip activated', start: ['A', 'B', 'C'], focus: 'B', change: 'activate', after: 'input' },
  { name: 'last chip activated', start: ['A', 'B', 'C'], focus: 'C', change: 'activate', after: 'input' },
  { name: 'the chip at that position is gone', start: ['A', 'B', 'C'], focus: 'C', change: 'shrink', after: 'input' },
  { name: 'the list turns read-only', start: ['A', 'B'], focus: 'B', change: 'read-only', after: 'input' },
  { name: 'the position stays', start: ['A', 'B', 'C'], focus: 'A', change: 'other-value', after: 'stays' },
  { name: 'the input adds', start: ['A'], focus: 'input', change: 'add', after: 'input' },
  { name: 'the list turns disabled', start: ['A', 'B'], focus: 'B', change: 'disable', after: 'stays' },
];

describe('ChipList focus when a remove button goes away', () => {
  it.each(focusRows)('$name: focus $after', async ({ start, focus, change, after }) => {
    const user = userEvent.setup();
    const ui = (props: { value: readonly string[]; readOnly?: boolean; disabled?: boolean }): ReactElement => (
      <ChipList aria-label="Toppings" {...props} onValueChange={() => undefined} />
    );
    const { rerender } = render(ui({ value: start }));
    const target = focus === 'input' ? textbox() : removeOf(focus);
    act(() => {
      target.focus();
    });
    if (change === 'activate') await user.keyboard('{Enter}');
    if (change === 'shrink') rerender(ui({ value: ['A'] }));
    if (change === 'read-only') rerender(ui({ value: start, readOnly: true }));
    if (change === 'other-value') rerender(ui({ value: ['A', 'X', 'Y'] }));
    if (change === 'disable') rerender(ui({ value: start, disabled: true }));
    if (change === 'add') await user.keyboard('X{Enter}');
    if (after === 'input') expect(document.activeElement).toBe(textbox());
    else expect(document.activeElement).toBe(target);
  });
});
