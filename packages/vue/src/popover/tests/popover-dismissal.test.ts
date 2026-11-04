// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, render, screen } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PopoverClose, PopoverContent, PopoverRoot, PopoverTrigger } from '../index';
import { byId, mountView, popoverView, settle, stubOverlayBrowser, view } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Share' });

describe('Popover dismissal', () => {
  it('stays open on a press inside the content and closes on a press outside', async () => {
    mountView(popoverView({ inner: () => h('p', { id: 'text' }, 'Link copied') }));
    await userEvent.click(trigger());
    await settle();
    await userEvent.click(byId('text'));
    await settle();
    expect(screen.queryByRole('dialog')).not.toBeNull();
    await userEvent.click(byId('before'));
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('toggles from the trigger while open without a second close', async () => {
    const onUpdate = vi.fn();
    mountView(popoverView({ rootProps: { 'onUpdate:open': onUpdate } }));
    await userEvent.click(trigger());
    await settle();
    await userEvent.click(trigger());
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onUpdate.mock.calls).toEqual([[true], [false]]);
  });

  it('closes only the topmost popover on Escape, then the next', async () => {
    mountView(() => [
      h(PopoverRoot, null, () => [
        h(PopoverTrigger, null, () => 'Outer'),
        h(PopoverContent, { 'aria-label': 'Outer content' }, () => [
          h(PopoverRoot, null, () => [
            h(PopoverTrigger, null, () => 'Inner'),
            h(PopoverContent, { 'aria-label': 'Inner content' }, () => h(PopoverClose, null, () => 'Done')),
          ]),
        ]),
      ]),
    ]);
    await userEvent.click(screen.getByRole('button', { name: 'Outer' }));
    await settle();
    await userEvent.click(screen.getByRole('button', { name: 'Inner' }));
    await settle();
    expect(screen.queryByRole('dialog', { name: 'Inner content' })).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(screen.queryByRole('dialog', { name: 'Inner content' })).toBeNull();
    expect(screen.queryByRole('dialog', { name: 'Outer content' })).not.toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Inner' }));
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Outer' }));
  });

  it('counts a press inside a nested popover as inside the parent', async () => {
    mountView(() => [
      h(PopoverRoot, null, () => [
        h(PopoverTrigger, null, () => 'Outer'),
        h(PopoverContent, { 'aria-label': 'Outer content' }, () => [
          h(PopoverRoot, null, () => [
            h(PopoverTrigger, null, () => 'Inner'),
            h(PopoverContent, { 'aria-label': 'Inner content' }, () => h('p', { id: 'deep' }, 'Deep')),
          ]),
        ]),
      ]),
    ]);
    await userEvent.click(screen.getByRole('button', { name: 'Outer' }));
    await settle();
    await userEvent.click(screen.getByRole('button', { name: 'Inner' }));
    await settle();
    await userEvent.click(byId('deep'));
    await settle();
    expect(screen.queryByRole('dialog', { name: 'Inner content' })).not.toBeNull();
    expect(screen.queryByRole('dialog', { name: 'Outer content' })).not.toBeNull();
  });

  it('portals into an open modal dialog that holds the trigger', async () => {
    const original = Reflect.get(Element.prototype, 'matches') as (this: Element, selector: string) => boolean;
    const modal = document.createElement('dialog');
    modal.setAttribute('open', '');
    const container = document.createElement('div');
    modal.append(container);
    document.body.append(modal);
    vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
      return selector === ':modal' ? this === modal : original.call(this, selector);
    });
    render(view(popoverView({ rootProps: { open: true } })), { container });
    await settle();
    const content = screen.getByRole('dialog', { name: 'Share' });
    expect(modal.contains(content)).toBe(true);
    expect(container.contains(content)).toBe(false);
  });
});
