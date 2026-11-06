import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelectImports, type CckSelectChange, type SelectOpenChangeDetails } from '../index';
import { gone, must, nextTask, trigger } from './helpers';
import { stubOverlayApis } from './overlay-stubs';

@Component({
  imports: [...CckSelectImports],
  template: `
    <div
      cckSelect
      aria-label="Dish"
      [multiple]="multiple()"
      [disableClose]="disableClose()"
      [closePredicate]="predicate()"
      [(value)]="value"
      (selectionChange)="changes.push($event)"
      (openedChange)="opened.push($event)"
    >
      <div cckSelectOption value="Cake">Cake</div>
      <div cckSelectOption value="Pizza">Pizza</div>
      <div cckSelectOption value="Burger">Burger</div>
    </div>
    <button id="after">After</button>
    <p id="empty">Empty</p>
  `,
})
class Host {
  readonly value = signal<string | readonly string[] | null | undefined>(undefined);
  readonly multiple = signal(false);
  readonly disableClose = signal(false);
  readonly asked: SelectOpenChangeDetails[] = [];
  readonly answer = signal(true);
  readonly predicate = signal<((details: SelectOpenChangeDetails) => boolean) | undefined>(undefined);
  readonly changes: CckSelectChange<string | readonly string[]>[] = [];
  readonly opened: boolean[] = [];

  /** Installs a predicate that records what it was asked and answers `answer`. */
  refuse(): void {
    this.predicate.set((details) => {
      this.asked.push(details);
      return this.answer();
    });
  }
}

async function setup(): Promise<{
  host: Host;
  user: ReturnType<typeof userEvent.setup>;
  settle: () => Promise<unknown>;
}> {
  const { fixture } = await render(Host);
  return { host: fixture.componentInstance, user: userEvent.setup(), settle: () => fixture.whenStable() };
}

/** Opens the list on "Pizza" with the keyboard. */
async function openOnPizza(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.tab();
  await user.keyboard('{ArrowDown}{ArrowDown}');
  await screen.findByRole('listbox');
}

describe('Select refusal', () => {
  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('disableClose', () => {
    it('keeps the list open on Escape, with its highlight', async () => {
      const { host, user, settle } = await setup();
      host.disableClose.set(true);
      await settle();
      await openOnPizza(user);
      await user.keyboard('{Escape}');
      await nextTask();
      expect(screen.getByRole('listbox')).toBeTruthy();
      expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Pizza' }).id);
      expect(host.value()).toBeUndefined();
    });

    it('keeps the list open on an outside press, with the focus on the trigger and nothing chosen', async () => {
      const { host, user, settle } = await setup();
      host.disableClose.set(true);
      await settle();
      await openOnPizza(user);
      await user.click(must(document.getElementById('empty')));
      await nextTask();
      expect(screen.getByRole('listbox')).toBeTruthy();
      expect(document.activeElement).toBe(trigger());
      expect(host.value()).toBeUndefined();
      expect(host.changes).toEqual([]);
    });

    it('gives the focus back to the trigger after a refused touch press', async () => {
      const { host, user, settle } = await setup();
      host.disableClose.set(true);
      await settle();
      await openOnPizza(user);
      const empty = must(document.getElementById('empty'));
      // A touch press moves the focus before the layer decides, on the click that follows.
      empty.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true }));
      trigger().blur();
      empty.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'touch', bubbles: true }));
      empty.click();
      await nextTask();
      expect(screen.getByRole('listbox')).toBeTruthy();
      expect(document.activeElement).toBe(trigger());
      expect(host.value()).toBeUndefined();
    });

    it('still closes when an option is chosen and when the trigger is clicked', async () => {
      const { host, user, settle } = await setup();
      host.disableClose.set(true);
      await settle();
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Burger' }));
      await gone();
      expect(host.value()).toBe('Burger');
      await user.click(trigger());
      await screen.findByRole('listbox');
      await user.click(trigger());
      await gone();
    });
  });

  describe('closePredicate', () => {
    it('is asked with the reason and the event for the trigger, Escape, an outside press and a choice', async () => {
      const { host, user, settle } = await setup();
      host.refuse();
      host.answer.set(true);
      await settle();
      await user.click(trigger());
      await screen.findByRole('listbox');
      await user.click(trigger());
      await gone();
      await user.keyboard('{ArrowDown}');
      await screen.findByRole('listbox');
      await user.keyboard('{Escape}');
      await gone();
      await user.click(trigger());
      await screen.findByRole('listbox');
      await user.click(must(document.getElementById('empty')));
      await gone();
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Cake' }));
      await gone();
      expect(host.asked.map((details) => details.reason)).toEqual(['trigger', 'escape', 'outside-press', 'select']);
      expect(host.asked.every((details) => details.event instanceof Event)).toBe(true);
    });

    it('keeps the list open when it returns false, for the trigger, Escape and an outside press', async () => {
      const { host, user, settle } = await setup();
      host.refuse();
      host.answer.set(false);
      await settle();
      await openOnPizza(user);
      await user.keyboard('{Escape}');
      await nextTask();
      expect(screen.getByRole('listbox')).toBeTruthy();
      await user.click(trigger());
      await nextTask();
      expect(screen.getByRole('listbox')).toBeTruthy();
      await user.click(must(document.getElementById('empty')));
      await nextTask();
      expect(screen.getByRole('listbox')).toBeTruthy();
      expect(document.activeElement).toBe(trigger());
      expect(host.value()).toBeUndefined();
      expect(host.asked.map((details) => details.reason)).toEqual(['escape', 'trigger', 'outside-press']);
    });

    it('keeps the list open after a click choice, and the value is chosen', async () => {
      const { host, user, settle } = await setup();
      host.refuse();
      host.answer.set(false);
      await settle();
      await user.click(trigger());
      await user.click(await screen.findByRole('option', { name: 'Burger' }));
      expect(screen.getByRole('listbox')).toBeTruthy();
      expect(host.value()).toBe('Burger');
      expect(host.changes).toMatchObject([{ value: 'Burger', reason: 'user' }]);
      expect(host.opened).toEqual([true]);
    });

    it('does not check close(), toggle() or a write of the parent', async () => {
      const { host, settle } = await setup();
      host.refuse();
      host.answer.set(false);
      await settle();
      host.value.set('Cake');
      await settle();
      expect(host.asked).toEqual([]);
    });
  });

  describe('focus leaving the trigger', () => {
    it('chooses the highlighted option on Tab and closes with a refusing predicate and disableClose', async () => {
      const { host, user, settle } = await setup();
      host.refuse();
      host.answer.set(false);
      host.disableClose.set(true);
      await settle();
      await openOnPizza(user);
      await user.tab();
      await gone();
      expect(host.value()).toBe('Pizza');
      expect(host.changes).toMatchObject([{ value: 'Pizza', reason: 'user' }]);
      expect(document.activeElement).toBe(document.getElementById('after'));
      // A focus-out close is never asked.
      expect(host.asked).toEqual([]);
    });

    it('chooses the highlighted option when a script moves the focus, and closes', async () => {
      const { host, user, settle } = await setup();
      host.refuse();
      host.answer.set(false);
      host.disableClose.set(true);
      await settle();
      await openOnPizza(user);
      must(document.getElementById('after')).focus();
      await gone();
      expect(host.value()).toBe('Pizza');
      expect(host.asked).toEqual([]);
    });

    it('closes a multiple Select without a change', async () => {
      const { host, user, settle } = await setup();
      host.multiple.set(true);
      await settle();
      await openOnPizza(user);
      must(document.getElementById('after')).focus();
      await gone();
      expect(host.value()).toBeUndefined();
      expect(host.changes).toEqual([]);
    });

    it('changes nothing when the window loses focus', async () => {
      const { host, user, settle } = await setup();
      await openOnPizza(user);
      trigger().dispatchEvent(new FocusEvent('blur'));
      await settle();
      await nextTask();
      expect(screen.getByRole('listbox')).toBeTruthy();
      expect(host.value()).toBeUndefined();
    });
  });

  describe('an accepted outside press', () => {
    it('chooses the highlighted option when the press moved the focus, and closes with the outside-press reason', async () => {
      const { host, user, settle } = await setup();
      host.refuse();
      host.answer.set(true);
      await settle();
      await openOnPizza(user);
      await user.click(must(document.getElementById('after')));
      await gone();
      expect(host.value()).toBe('Pizza');
      expect(host.asked.map((details) => details.reason)).toEqual(['outside-press']);
    });

    it('closes a multiple Select without a change', async () => {
      const { host, user, settle } = await setup();
      host.multiple.set(true);
      await settle();
      await openOnPizza(user);
      await user.click(must(document.getElementById('empty')));
      await gone();
      expect(host.value()).toBeUndefined();
    });

    it('closes without a change on Escape', async () => {
      const { host, user } = await setup();
      await openOnPizza(user);
      await user.keyboard('{Escape}');
      await gone();
      expect(host.value()).toBeUndefined();
    });
  });
});
