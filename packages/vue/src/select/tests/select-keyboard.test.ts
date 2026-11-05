// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen, waitFor } from '@testing-library/vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  active,
  gone,
  mountView,
  option,
  record,
  selectView,
  settle,
  stubOverlayBrowser,
  trigger,
  valueText,
} from './fixtures';

let scrollIntoView: ReturnType<typeof stubOverlayBrowser>;

beforeEach(() => {
  scrollIntoView = stubOverlayBrowser();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Select keyboard', () => {
  it('moves with the arrows, stops at the ends, skips the disabled option, and Home/End/PageUp/PageDown jump', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await waitFor(() => {
      expect(active()).toBe('Cake');
    });
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
    mountView(selectView());
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('s');
    expect(active()).toBe('Steak');
    await new Promise((resolve) => setTimeout(resolve, 600));
    await user.keyboard('b');
    expect(active()).toBe('Burger');
  });

  it('chooses with Enter and Space, closes a single Select and keeps the focus on the trigger', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props));
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Enter}');
    await gone();
    expect(valueText()).toBe('Burger');
    expect(document.activeElement).toBe(trigger());
    expect(recorded.values).toEqual(['Burger']);
    expect(recorded.opens.at(-1)).toEqual(false);
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown} ');
    await gone();
    expect(valueText()).toBe('Steak');
  });

  it('chooses and closes with Alt+ArrowUp', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Alt>}{ArrowUp}{/Alt}');
    await gone();
    expect(valueText()).toBe('Burger');
  });

  it('closes with Escape and changes nothing', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props));
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Escape}');
    await gone();
    expect(recorded.values).toEqual([]);
    expect(recorded.opens.at(-1)).toEqual(false);
    expect(document.activeElement).toBe(trigger());
  });

  it('chooses the highlighted option on Tab and lets the focus move on', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}');
    await user.tab();
    await gone();
    expect(valueText()).toBe('Burger');
    expect(document.activeElement).toBe(document.getElementById('after'));
  });

  it('scrolls the highlighted option into view at the nearest edge on a keyboard move, not on a pointer move', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await settle();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
    scrollIntoView.mockClear();
    await user.keyboard('{ArrowDown}');
    await settle();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    scrollIntoView.mockClear();
    await user.hover(option('Steak'));
    await settle();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
