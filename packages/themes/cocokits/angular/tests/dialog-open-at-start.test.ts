import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { CckDialogImports } from '@cocokits/angular/dialog';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogContentTheme, CckDialogTheme } from '../src/index';
import { providers } from './helpers';

@Component({
  imports: [...CckDialogImports, CckDialogTheme, CckDialogContentTheme],
  template: `
    <ng-container cckDialog [open]="true" [dialogSize]="size()">
      <button cckDialogTrigger type="button">Open</button>
      <ng-template cckDialogPortal>
        <dialog cckDialogContent><h2 cckDialogTitle>Delete project</h2></dialog>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly size = signal<'lg' | 'sm'>('lg');
}

/** jsdom has no Popover API and no modal dialog: the stubs show a popover and mark a modal dialog as open. */
beforeEach(() => {
  const matches = Object.getOwnPropertyDescriptor(Element.prototype, 'matches')?.value as (
    this: Element,
    selector: string,
  ) => boolean;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    if (selector === ':modal') return this.localName === 'dialog' && this.hasAttribute('data-modal');
    return matches.call(this, selector);
  });
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    this.style.display = 'block';
  };
  HTMLElement.prototype.hidePopover = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
    this.setAttribute('data-modal', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.removeAttribute('data-modal');
    this.dispatchEvent(new Event('close'));
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
});

describe('theme dialog that is open at start (the browser, A7.6)', () => {
  it('shows the root size in the first render, and a later change shows the new size', async () => {
    const { fixture } = await render(Host, { providers });
    const content = await screen.findByRole('dialog');
    expect(content.getAttribute('data-size')).toBe('lg');
    fixture.componentInstance.size.set('sm');
    await fixture.whenStable();
    expect(content.getAttribute('data-size')).toBe('sm');
  });
});
