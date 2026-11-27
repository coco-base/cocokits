import { signal, type WritableSignal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogImports } from '../dialog';
import { stubOverlayApis } from '../dialog/tests/overlay-stubs';
import { CckMenuImports } from '../menu';
import { CckPopoverImports } from '../popover';
import { CckTooltip, CckTooltipImports } from '../tooltip';

const imports = [...CckMenuImports, ...CckPopoverImports, ...CckTooltipImports, ...CckDialogImports];

interface Overlay {
  readonly name: string;
  /** The trigger attribute that names the template. */
  readonly trigger: string;
  /** The template content; `{label}` is the accessible name. */
  readonly content: string;
  /** The role the open content has. */
  readonly role: string;
}

const OVERLAYS: readonly Overlay[] = [
  {
    name: 'Menu',
    trigger: 'cckMenuTriggerFor',
    content: '<cck-menu-content aria-label="{label}"><cck-menu-item>Edit</cck-menu-item></cck-menu-content>',
    role: 'menu',
  },
  {
    name: 'Popover',
    trigger: 'cckPopoverTriggerFor',
    content: '<cck-popover-content aria-label="{label}">Text</cck-popover-content>',
    role: 'dialog',
  },
  {
    name: 'Dialog',
    trigger: 'cckDialogTriggerFor',
    content:
      '<dialog cckDialogContent aria-label="{label}"><button cckDialogClose type="button">Close</button></dialog>',
    role: 'dialog',
  },
];

const contents = (role: string): HTMLElement[] => screen.queryAllByRole(role);

beforeEach(stubOverlayApis);
afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(document, 'fullscreenElement');
});

describe.each(OVERLAYS)('one $name template used by two triggers', (overlay) => {
  it('gives each trigger its own instance: closing one leaves the other open', async () => {
    const a = signal(false);
    const b = signal(false);
    const { fixture } = await render(
      `<button type="button" [${overlay.trigger}]="shared" [(open)]="a">A</button>
      <button type="button" [${overlay.trigger}]="shared" [(open)]="b">B</button>
      <ng-template #shared>${overlay.content.replace('{label}', 'Shared')}</ng-template>`,
      { imports, componentProperties: { a, b } },
    );
    const triggerA = screen.getByRole('button', { name: 'A' });
    const triggerB = screen.getByRole('button', { name: 'B' });
    a.set(true);
    b.set(true);
    fixture.detectChanges();
    await waitFor(() => {
      expect(contents(overlay.role)).toHaveLength(2);
    });
    const [first, second] = contents(overlay.role);
    expect(first.id).not.toBe(second.id);
    expect(triggerA.getAttribute('aria-expanded')).toBe('true');
    expect(triggerB.getAttribute('aria-expanded')).toBe('true');
    a.set(false);
    fixture.detectChanges();
    await waitFor(() => {
      expect(contents(overlay.role)).toHaveLength(1);
    });
    expect(triggerA.getAttribute('aria-expanded')).toBe('false');
    expect(triggerB.getAttribute('aria-expanded')).toBe('true');
    expect(b()).toBe(true);
  });
});

describe.each(OVERLAYS)('a $name trigger removed with @if while its overlay is open', (overlay) => {
  it('closes the overlay, leaves no dismiss layer behind and logs no error', async () => {
    const error = vi.spyOn(console, 'error');
    const user = userEvent.setup();
    const shown: WritableSignal<boolean> = signal(true);
    const open = signal(false);
    const { fixture } = await render(
      `@if (shown()) {
        <button type="button" [${overlay.trigger}]="removed" [(open)]="open">Removed</button>
      }
      <ng-template #removed>${overlay.content.replace('{label}', 'Removed')}</ng-template>
      <button type="button" [cckPopoverTriggerFor]="other">Other</button>
      <ng-template #other><cck-popover-content aria-label="Other">Text</cck-popover-content></ng-template>`,
      { imports, componentProperties: { shown, open } },
    );
    open.set(true);
    fixture.detectChanges();
    await screen.findByRole(overlay.role, { name: 'Removed' });
    shown.set(false);
    fixture.detectChanges();
    await waitFor(() => {
      expect(screen.queryByRole(overlay.role, { name: 'Removed' })).toBeNull();
    });
    // The removed trigger's layer would be the top one and take the Escape meant for the other overlay.
    await user.click(screen.getByRole('button', { name: 'Other' }));
    await screen.findByRole('dialog', { name: 'Other' });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Other' })).toBeNull();
    });
    expect(error).not.toHaveBeenCalled();
  });
});

describe('Tooltip triggers', () => {
  const tip = (label: string): string =>
    `<ng-template #${label.toLowerCase()}><cck-tooltip-content>${label} tip</cck-tooltip-content></ng-template>`;

  it('gives each of two triggers of one template its own tooltip: hiding one leaves the other', async () => {
    const { fixture } = await render(
      `<button type="button" [cckTooltipTriggerFor]="shared">A</button>
      <button type="button" [cckTooltipTriggerFor]="shared">B</button>
      <ng-template #shared><cck-tooltip-content>Shared tip</cck-tooltip-content></ng-template>`,
      { imports },
    );
    const [a, b] = fixture.debugElement
      .queryAll(By.directive(CckTooltip))
      .map((element) => element.injector.get(CckTooltip));
    a.show(0);
    b.show(0);
    fixture.detectChanges();
    await waitFor(() => {
      expect(screen.queryAllByRole('tooltip')).toHaveLength(2);
    });
    a.hide(0);
    fixture.detectChanges();
    await waitFor(() => {
      expect(screen.queryAllByRole('tooltip')).toHaveLength(1);
    });
    const left = screen.getByRole('tooltip');
    expect(screen.getByRole('button', { name: 'B' }).getAttribute('aria-describedby')).toContain(left.id);
  });

  it('closes the tooltip of a trigger removed with @if while it shows, and logs no error', async () => {
    const error = vi.spyOn(console, 'error');
    const shown = signal(true);
    const user = userEvent.setup();
    const { fixture } = await render(
      `@if (shown()) {
        <button type="button" [cckTooltipTriggerFor]="removed" #tip="cckTooltip">Removed</button>
        <button type="button" (click)="tip.show(0)">Show</button>
      }
      ${tip('Removed')}`,
      { imports, componentProperties: { shown } },
    );
    await user.click(screen.getByRole('button', { name: 'Show' }));
    await screen.findByRole('tooltip');
    shown.set(false);
    fixture.detectChanges();
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
    expect(document.querySelector('.cck-tooltip__content')).toBeNull();
    expect(error).not.toHaveBeenCalled();
  });
});
