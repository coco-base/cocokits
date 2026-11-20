// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  active,
  Example,
  gone,
  lastReason,
  nextFrame,
  option,
  reasonsOf,
  stubTopLayer,
  trigger,
  valueText,
} from './fixtures';

let scrollIntoView: ReturnType<typeof stubTopLayer>;

beforeEach(() => {
  scrollIntoView = stubTopLayer();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Select keyboard', () => {
  it('moves with the arrows, stops at the ends, skips the disabled option, and Home/End/PageUp/PageDown jump', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    expect(active()).toBe('Cake');
    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('Burger');
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(active()).toBe('Steak');
    await user.keyboard('{ArrowUp}');
    expect(active()).toBe('Burger');
    await user.keyboard('{Home}');
    expect(active()).toBe('Cake');
    await user.keyboard('{End}');
    expect(active()).toBe('Steak');
    await user.keyboard('{PageUp}');
    expect(active()).toBe('Cake');
    await user.keyboard('{PageDown}');
    expect(active()).toBe('Steak');
  });

  it('finds an option by typing, and a pause empties the buffer', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard('{ArrowDown}s');
    expect(active()).toBe('Steak');
    await new Promise((resolve) => setTimeout(resolve, 600));
    await user.keyboard('b');
    expect(active()).toBe('Burger');
  });

  it('chooses with Enter and Space, closes a single Select and keeps the focus on the trigger', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    render(<Example onValueChange={onValueChange} onOpenChange={onOpenChange} />);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await gone();
    expect(valueText()).toBe('Burger');
    expect(document.activeElement).toBe(trigger());
    expect(reasonsOf(onValueChange)).toEqual([['Burger', 'user']]);
    expect(lastReason(onOpenChange)).toBe('select');
    await user.keyboard('{ArrowDown}{ArrowDown} ');
    await gone();
    expect(valueText()).toBe('Steak');
  });

  it('chooses and closes with Alt+ArrowUp', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{Alt>}{ArrowUp}{/Alt}');
    await gone();
    expect(valueText()).toBe('Burger');
  });

  it('closes with Escape and changes nothing', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} onValueChange={onValueChange} />);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{Escape}');
    await gone();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(lastReason(onOpenChange)).toBe('escape');
    expect(document.activeElement).toBe(trigger());
  });

  it('chooses the highlighted option on Tab and lets the focus move on', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await user.tab();
    await gone();
    expect(valueText()).toBe('Burger');
    expect(document.activeElement).toBe(document.getElementById('after'));
  });

  it('scrolls the highlighted option into view at the nearest edge on a keyboard move, not on a pointer move', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await nextFrame();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
    scrollIntoView.mockClear();
    await user.keyboard('{ArrowDown}');
    await nextFrame();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    scrollIntoView.mockClear();
    await user.hover(option('Steak'));
    await nextFrame();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
