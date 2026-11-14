import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckPopoverImports } from '@cocokits/angular/popover';
import { CckDialogImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { frame } from './queries';

beforeEach(stubOverlayApis);
afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
});

/** Stands in for the exit animation of an element; the returned function ends it. */
function animate(element: HTMLElement): () => void {
  let finish: () => void = () => undefined;
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  element.getAnimations = () => [
    {
      finished,
      animationName: 'exit',
      playState: 'running',
      effect: { getComputedTiming: () => ({ endTime: 300 }) },
    } as unknown as Animation,
  ];
  return finish;
}

const SINGLE = `
  <ng-container cckDialog>
    <button cckDialogTrigger>Delete</button>
    <ng-template cckDialogPortal>
      <dialog cckDialogContent>
        <h2 cckDialogTitle>Delete project</h2>
        <button cckDialogClose>Cancel</button>
      </dialog>
    </ng-template>
  </ng-container>`;

const NESTED = `
  <ng-container cckDialog [(open)]="outerOpen" (opened)="outerLog.push($event.reason)" (closed)="outerLog.push($event.reason)">
    <button cckDialogTrigger>Outer</button>
    <ng-template cckDialogPortal>
      <dialog cckDialogContent aria-label="outer">
        <ng-container cckDialog>
          <button cckDialogTrigger>Inner</button>
          <ng-template cckDialogPortal>
            <dialog cckDialogContent>
              <h2 cckDialogTitle>Inner dialog</h2>
              <button cckDialogClose>Cancel</button>
            </dialog>
          </ng-template>
        </ng-container>
      </dialog>
    </ng-template>
  </ng-container>`;

@Component({ imports: [...CckDialogImports], template: NESTED })
class Nested {
  readonly outerOpen = signal(false);
  readonly outerLog: string[] = [];
}

describe('A modal that exits', () => {
  it('keeps the page locked until its exit animation has finished', async () => {
    const user = userEvent.setup();
    await render(SINGLE, { imports: [...CckDialogImports] });
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const element = await screen.findByRole('dialog', { name: 'Delete project' });
    const finish = animate(element);
    expect(document.documentElement.style.overflow).toBe('hidden');
    await user.keyboard('{Escape}');
    await frame();
    expect(element.getAttribute('data-state')).toBe('closed');
    expect(document.documentElement.style.overflow).toBe('hidden');
    finish();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('stays a barrier: Escape and a press during the exit reach no layer below', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Nested);
    await user.click(screen.getByRole('button', { name: 'Outer' }));
    await user.click(await screen.findByRole('button', { name: 'Inner' }));
    const inner = await screen.findByRole('dialog', { name: 'Inner dialog' });
    const finish = animate(inner);
    await user.keyboard('{Escape}');
    await frame();
    expect(inner.getAttribute('data-state')).toBe('closed');

    await user.keyboard('{Escape}');
    document.body.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, cancelable: true, composed: true, clientX: 5, clientY: 5 }),
    );
    await fixture.whenStable();
    expect(screen.getByRole('dialog', { name: 'outer' }).isConnected).toBe(true);
    expect(fixture.componentInstance.outerLog).toEqual(['trigger']);

    finish();
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Inner dialog' })).toBeNull();
    });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});

@Component({
  imports: [...CckDialogImports],
  template: `
    @if (present()) {
      <button (click)="open.set(true)">Open it</button>
    }
    <ng-container cckDialog [(open)]="open">
      <button cckDialogTrigger>Delete</button>
      <ng-template cckDialogPortal>
        <dialog cckDialogContent>
          <h2 cckDialogTitle>Delete project</h2>
          <button (click)="present.set(false)">Remove opener</button>
          <button cckDialogClose>Cancel</button>
        </dialog>
      </ng-template>
    </ng-container>
  `,
})
class Controlled {
  readonly open = signal(false);
  readonly present = signal(true);
}

describe('Dialog focus return to the opener', () => {
  it('returns focus to the element that had it when the dialog opened, not to the Trigger', async () => {
    const user = userEvent.setup();
    await render(Controlled);
    await user.click(screen.getByRole('button', { name: 'Open it' }));
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await frame();
    await frame();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open it' }));
  });

  it('falls back to the body of the document when the opener is gone', async () => {
    const user = userEvent.setup();
    await render(Controlled);
    await user.click(screen.getByRole('button', { name: 'Open it' }));
    await user.click(await screen.findByRole('button', { name: 'Remove opener' }));
    expect(screen.queryByRole('button', { name: 'Open it' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await frame();
    await frame();
    expect(document.activeElement).toBe(document.body);
  });
});

@Component({
  imports: [...CckDialogImports],
  template: `
    <ng-container
      cckDialog
      [disableClose]="true"
      [(open)]="open"
      (opened)="reasons.push($event.reason)"
      (closed)="reasons.push($event.reason)"
    >
      <button cckDialogTrigger>Delete</button>
      <ng-template cckDialogPortal>
        <dialog cckDialogContent aria-label="Locked"><button cckDialogClose>Cancel</button></dialog>
      </ng-template>
    </ng-container>
  `,
})
class Locked {
  readonly open = signal(false);
  readonly reasons: string[] = [];
}

describe('A close the browser forced after a refused cancel', () => {
  it('closes with reason escape although disableClose refuses, and does not show the dialog again', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Locked);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const element = await screen.findByRole<HTMLDialogElement>('dialog', { name: 'Locked' });
    element.dispatchEvent(new Event('cancel', { cancelable: false }));
    expect(fixture.componentInstance.open()).toBe(true);
    element.close();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.componentInstance.reasons).toEqual(['trigger', 'escape']);
  });

  it('keeps a form method=dialog close apart: with disableClose it is not reconciled as escape', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Locked);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const element = await screen.findByRole<HTMLDialogElement>('dialog', { name: 'Locked' });
    element.close();
    await frame();
    expect(fixture.componentInstance.reasons).not.toContain('escape');
  });
});

@Component({
  imports: [...CckDialogImports, ...CckPopoverImports],
  template: `
    <button>Outside</button>
    <ng-container cckDialog>
      <button cckDialogTrigger>Delete</button>
      <ng-template cckDialogPortal>
        <dialog cckDialogContent aria-label="d">
          <ng-container cckPopover>
            <button cckPopoverTrigger>More</button>
            <ng-template cckPopoverPortal>
              <cck-popover-content aria-label="more"><button>Inside</button></cck-popover-content>
            </ng-template>
          </ng-container>
          <button>After popover</button>
        </dialog>
      </ng-template>
    </ng-container>
  `,
})
class PopoverInModal {
  readonly ready = true;
}

describe('Tab out of a popover inside a modal dialog', () => {
  it('goes to the next tabbable inside the dialog, never to the inert page', async () => {
    const user = userEvent.setup();
    await render(PopoverInModal);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(await screen.findByRole('button', { name: 'More' }));
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Inside' }));
    });
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After popover' }));
  });
});

describe('Shift+Tab out of a popover inside a modal dialog', () => {
  it('goes back to the trigger inside the dialog', async () => {
    const user = userEvent.setup();
    await render(PopoverInModal);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(await screen.findByRole('button', { name: 'More' }));
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Inside' }));
    });
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'More' }));
  });
});

describe('Dialog that is open from the start', () => {
  it('returns focus to the element that had it before the page rendered', async () => {
    const user = userEvent.setup();
    const opener = document.createElement('button');
    opener.textContent = 'Page opener';
    document.body.append(opener);
    opener.focus();
    await render(
      `<ng-container cckDialog [open]="true">
        <button cckDialogTrigger>Delete</button>
        <ng-template cckDialogPortal><dialog cckDialogContent aria-label="Early"><button cckDialogClose>Cancel</button></dialog></ng-template>
      </ng-container>`,
      { imports: [...CckDialogImports] },
    );
    await screen.findByRole('dialog', { name: 'Early' });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await frame();
    await frame();
    expect(document.activeElement).toBe(opener);
  });
});

describe('Reopen during the exit', () => {
  it('still returns focus to the original opener after the final close', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Controlled);
    await user.click(screen.getByRole('button', { name: 'Open it' }));
    const element = await screen.findByRole('dialog');
    const finish = animate(element);
    await user.keyboard('{Escape}');
    await frame();
    // Reopen from the page while focus is still inside the exiting dialog.
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    await frame();
    await user.keyboard('{Escape}');
    await frame();
    finish();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await frame();
    await frame();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open it' }));
  });
});
