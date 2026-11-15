// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/vue';
import { h, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  byId,
  controlled,
  item,
  menu,
  menuView,
  mountView,
  open,
  settle,
  stubOverlayBrowser,
  trigger,
} from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Menu uncontrolled open', () => {
  it('starts closed, opens and closes itself', async () => {
    mountView(menuView());
    expect(menu()).toBeNull();
    await open();
    expect(menu()).not.toBeNull();
    await userEvent.click(trigger());
    await settle();
    expect(menu()).toBeNull();
  });

  it('starts open with defaultOpen, read once', async () => {
    mountView(menuView({ rootProps: { defaultOpen: true } }));
    await settle();
    expect(menu()).not.toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });
});

describe('Menu controlled open', () => {
  it('follows the parent and does not emit for a parent change', async () => {
    const onUpdate = vi.fn();
    const state = ref(false);
    mountView(menuView({ open: state, rootProps: { 'onUpdate:open': onUpdate } }));
    state.value = true;
    await settle();
    expect(menu()).not.toBeNull();
    state.value = false;
    await settle();
    expect(menu()).toBeNull();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('keeps its state when the parent does not accept a change', async () => {
    mountView(menuView({ rootProps: { open: false, 'onUpdate:open': () => undefined } }));
    await userEvent.click(trigger());
    await settle();
    expect(menu()).toBeNull();
  });

  it('writes the parent through v-model', async () => {
    const { Component, open: state } = controlled();
    mountView(() => [h(Component)]);
    await open();
    expect(state.value).toBe(true);
    state.value = false;
    await settle();
    expect(menu()).toBeNull();
  });
});

/** Opens the menu, makes one cause close it, and reports the update:open calls. */
describe.each([
  ['a click on the trigger', async () => userEvent.click(trigger())],
  ['an item running', async () => userEvent.click(item('Edit'))],
  ['Escape', async () => userEvent.keyboard('{Escape}')],
  ['a press outside', async () => userEvent.click(byId('after'))],
  ['Tab', async () => userEvent.tab()],
])('Menu change by %s', (_name, cause) => {
  it('emits update:open once with false', async () => {
    const onUpdate = vi.fn();
    mountView(menuView({ rootProps: { 'onUpdate:open': onUpdate } }));
    await open();
    expect(onUpdate.mock.calls).toEqual([[true]]);
    await cause();
    await settle();
    expect(onUpdate.mock.calls).toEqual([[true], [false]]);
    expect(menu()).toBeNull();
  });
});
