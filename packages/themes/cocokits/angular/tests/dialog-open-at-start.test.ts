import { Component, inject, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckDialog, CckDialogImports } from '@cocokits/angular/dialog';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogContentTheme, CckDialogTheme } from '../src/index';
import { providers } from './helpers';

@Component({
  imports: [...CckDialogImports, CckDialogTheme, CckDialogContentTheme],
  template: `
    <button [cckDialogTriggerFor]="dialog" [open]="true" [dialogSize]="size()" type="button">Open</button>
    <ng-template #dialog>
      <dialog cckDialogContent><h2 cckDialogTitle>Delete project</h2></dialog>
    </ng-template>
  `,
})
class Host {
  readonly size = signal<'lg' | 'sm'>('lg');
}

@Component({
  imports: [...CckDialogImports, CckDialogTheme, CckDialogContentTheme],
  template: `
    <ng-template cckDialog [open]="true" [dialogSize]="size()">
      <dialog cckDialogContent><h2 cckDialogTitle>Delete project</h2></dialog>
    </ng-template>
  `,
})
class TemplateHost {
  readonly size = signal<'lg' | 'sm'>('lg');
}

@Component({ template: `<p>{{ text }}</p>` })
class ServiceBody {
  protected readonly text = 'Body';
}

@Component({
  imports: [...CckDialogImports, CckDialogTheme, CckDialogContentTheme],
  template: `
    <ng-template cckDialog [open]="true" dialogSize="lg">
      <dialog cckDialogContent aria-label="Sized">
        <button type="button" (click)="openService()">Open service</button>
      </dialog>
    </ng-template>
  `,
})
class ServiceFromSized {
  private readonly service = inject(CckDialog);
  openService(): void {
    this.service.open(ServiceBody, { ariaLabel: 'Service' });
  }
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

describe('theme dialog that is open at start (the browser)', () => {
  it.each([
    ['on the trigger', Host],
    ['on the template of a dialog without a trigger', TemplateHost],
  ])('shows the root size %s in the first render, and a later change shows the new size', async (_name, host) => {
    const { fixture } = await render<Host | TemplateHost>(host, { providers });
    const content = await screen.findByRole('dialog');
    expect(content.getAttribute('data-size')).toBe('lg');
    fixture.componentInstance.size.set('sm');
    await fixture.whenStable();
    expect(content.getAttribute('data-size')).toBe('sm');
  });

  it('gives a service dialog opened from the content of a sized dialog the default size', async () => {
    await render(ServiceFromSized, { providers, routes: [{ path: '**', children: [] }] });
    const sized = await screen.findByRole('dialog', { name: 'Sized' });
    expect(sized.getAttribute('data-size')).toBe('lg');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open service' }));
    const service = await screen.findByRole('dialog', { name: 'Service' });
    expect(service.getAttribute('data-size')).toBe(cocokitsThemeConfig.components.dialog.size.default);
  });
});
