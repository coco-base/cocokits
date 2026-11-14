import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { dialogAnatomy } from '@cocokits/machines/dialog';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckPopoverImports } from '@cocokits/angular/popover';
import { CckDialogImports, type DialogChangeDetails } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { boxAt, closed, dialog, frame, pressBackdrop } from './queries';

const imports = [...CckDialogImports, ...CckPopoverImports];
const { classes } = dialogAnatomy;

const DELETE = `
  <button id="before">Before</button>
  <ng-container cckDialog [(open)]="open" (opened)="details.push({ ...$event, value: true })" (closed)="details.push({ ...$event, value: false })">
    <button cckDialogTrigger>Delete</button>
    <ng-template cckDialogPortal>
      <dialog cckDialogContent>
        <h2 cckDialogTitle>Delete project</h2>
        <cck-dialog-description>This cannot be undone.</cck-dialog-description>
        <a href="#x">First</a>
        <button cckDialogClose>Cancel</button>
      </dialog>
    </ng-template>
  </ng-container>
  <button id="after">After</button>
  <p id="empty">Empty space</p>`;

@Component({ imports, template: DELETE })
class Host {
  readonly open = signal(false);
  readonly details: (DialogChangeDetails & { value: boolean })[] = [];
}

@Component({
  imports,
  template: `<ng-container
    cckDialog
    (opened)="details.push({ ...$event, value: true })"
    (closed)="details.push({ ...$event, value: false })"
  >
    <button cckDialogTrigger (click)="$event.preventDefault()">Delete</button>
    <ng-template cckDialogPortal>
      <dialog cckDialogContent aria-label="Delete project">
        <button cckDialogClose (click)="$event.preventDefault()">Cancel</button>
      </dialog>
    </ng-template>
  </ng-container>`,
})
class VetoHost {
  readonly details: (DialogChangeDetails & { value: boolean })[] = [];
}

type User = ReturnType<typeof userEvent.setup>;

const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Delete' });

describe('Dialog', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('style');
  });

  describe('rendered contract', () => {
    it('renders no element for the root and a closed trigger without aria-controls', async () => {
      const { container } = await render(Host);
      expect(trigger().classList.contains(classes.trigger)).toBe(true);
      expect(trigger().getAttribute('type')).toBe('button');
      expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
      expect(trigger().getAttribute('data-state')).toBe('closed');
      expect(trigger().hasAttribute('aria-controls')).toBe(false);
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(container.querySelector('.cck-dialog')).toBeNull();
    });

    it('opens a native modal dialog outside the container, labelled and described, linked to the trigger', async () => {
      const user = userEvent.setup();
      const { container } = await render(Host);
      await user.click(trigger());
      const element = await screen.findByRole<HTMLDialogElement>('dialog', { name: 'Delete project' });
      expect(element.localName).toBe('dialog');
      expect(element.open).toBe(true);
      expect(element.matches(':modal')).toBe(true);
      expect(container.contains(element)).toBe(false);
      expect(element.closest('[popover="manual"]')).not.toBeNull();
      expect(element.classList.contains(classes.content)).toBe(true);
      expect(element.getAttribute('data-state')).toBe('open');
      expect(element.hasAttribute('role')).toBe(false);
      expect(element.hasAttribute('aria-modal')).toBe(false);
      const title = screen.getByRole('heading', { name: 'Delete project' });
      const description = screen.getByText('This cannot be undone.');
      expect(title.classList.contains(classes.title)).toBe(true);
      expect(description.classList.contains(classes.description)).toBe(true);
      expect(element.getAttribute('aria-labelledby')).toBe(title.id);
      expect(element.getAttribute('aria-describedby')).toBe(description.id);
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
      expect(trigger().getAttribute('data-state')).toBe('open');
      expect(trigger().getAttribute('aria-controls')).toBe(element.id);
      expect(screen.getByRole('button', { name: 'Cancel' }).classList.contains(classes.close)).toBe(true);
      expect(screen.getByRole('button', { name: 'Cancel' }).getAttribute('type')).toBe('button');
    });

    it('has no aria-labelledby or aria-describedby without a Title and a Description', async () => {
      const user = userEvent.setup();
      await render(
        `<ng-container cckDialog>
          <button cckDialogTrigger>Open</button>
          <ng-template cckDialogPortal><dialog cckDialogContent aria-label="Plain">Text</dialog></ng-template>
        </ng-container>`,
        { imports },
      );
      await user.click(screen.getByRole('button', { name: 'Open' }));
      const element = await screen.findByRole('dialog', { name: 'Plain' });
      expect(element.hasAttribute('aria-labelledby')).toBe(false);
      expect(element.hasAttribute('aria-describedby')).toBe(false);
    });

    it('adds no focus guard and no manual inert: the native modal needs none', async () => {
      const user = userEvent.setup();
      await render(Host);
      await user.click(trigger());
      const element = await screen.findByRole('dialog');
      expect(element.parentElement?.querySelectorAll('[tabindex]').length).toBe(0);
      expect(document.querySelector('[inert]')).toBeNull();
    });
  });

  describe('opening and closing', () => {
    it('toggles from the keyboard with Enter and Space and reports the reason', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      trigger().focus();
      await user.keyboard('{Enter}');
      await screen.findByRole('dialog');
      await user.keyboard('{Escape}');
      await closed();
      await waitFor(() => {
        expect(document.activeElement).toBe(trigger());
      });
      await user.keyboard(' ');
      await screen.findByRole('dialog');
      expect(fixture.componentInstance.details.map((d) => [d.value, d.reason])).toEqual([
        [true, 'trigger'],
        [false, 'escape'],
        [true, 'trigger'],
      ]);
    });

    it('keeps the model: two-way, and a write from the parent emits no details', async () => {
      const { fixture } = await render(Host);
      fixture.componentInstance.open.set(true);
      await fixture.whenStable();
      await screen.findByRole('dialog');
      expect(fixture.componentInstance.details).toEqual([]);
      fixture.componentInstance.open.set(false);
      await fixture.whenStable();
      await closed();
      expect(fixture.componentInstance.details).toEqual([]);
    });

    it('writes the model back on a user close', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      await user.click(trigger());
      await screen.findByRole('dialog');
      expect(fixture.componentInstance.open()).toBe(true);
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await closed();
      expect(fixture.componentInstance.open()).toBe(false);
    });

    it('keeps the content until the exit animation has finished', async () => {
      const user = userEvent.setup();
      await render(Host);
      await user.click(trigger());
      const element = await screen.findByRole('dialog');
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
      await user.keyboard('{Escape}');
      await frame();
      expect(screen.getByRole('dialog').getAttribute('data-state')).toBe('closed');
      expect(trigger().getAttribute('aria-controls')).toBe(element.id);
      finish();
      await closed();
      expect(trigger().hasAttribute('aria-controls')).toBe(false);
    });
  });

  describe('dismissal reasons', () => {
    it.each([
      ['Escape', async (user: User) => user.keyboard('{Escape}'), 'escape'],
      ['Close', async (user: User) => user.click(screen.getByRole('button', { name: 'Cancel' })), 'close'],
      [
        'a press on the backdrop',
        () => {
          boxAt(dialog());
          pressBackdrop(dialog(), { clientX: 10, clientY: 10 });
        },
        'outside-press',
      ],
      [
        'the platform closing the dialog (form method=dialog)',
        () => {
          dialog().close();
        },
        'close',
      ],
    ] as const)('reports the reason for %s', async (_name, act, reason) => {
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      await user.click(trigger());
      await screen.findByRole('dialog');
      await act(user);
      await closed();
      expect(fixture.componentInstance.details.at(-1)).toMatchObject({ value: false, reason });
    });

    it('does not close on a press inside the dialog box, including its own padding', async () => {
      const user = userEvent.setup();
      await render(Host);
      await user.click(trigger());
      await screen.findByRole('dialog');
      boxAt(dialog());
      pressBackdrop(dialog(), { clientX: 150, clientY: 150 });
      await user.click(screen.getByText('This cannot be undone.'));
      expect(screen.getByRole('dialog').isConnected).toBe(true);
    });

    it('is not opened by a click the consumer prevented', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(VetoHost);
      await user.click(screen.getByRole('button', { name: 'Delete' }));
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(fixture.componentInstance.details).toEqual([]);
    });

    it('is not closed by a prevented click on Close', async () => {
      const user = userEvent.setup();
      await render(
        `<ng-container cckDialog [open]="true" >
          <button cckDialogTrigger>Delete</button>
          <ng-template cckDialogPortal>
            <dialog cckDialogContent aria-label="Delete project">
              <button cckDialogClose (click)="$event.preventDefault()">Cancel</button>
            </dialog>
          </ng-template>
        </ng-container>`,
        { imports },
      );
      await screen.findByRole('dialog');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.getByRole('dialog').isConnected).toBe(true);
    });
  });

  describe('focus', () => {
    it('lets the native focusing steps place focus: the first focusable element', async () => {
      const user = userEvent.setup();
      await render(Host);
      await user.click(trigger());
      await screen.findByRole('dialog');
      expect(document.activeElement).toBe(screen.getByRole('link', { name: 'First' }));
    });

    it.each([
      ['Escape', async (user: User) => user.keyboard('{Escape}')],
      ['Close', async (user: User) => user.click(screen.getByRole('button', { name: 'Cancel' }))],
      [
        'a press on the backdrop',
        () => {
          boxAt(dialog());
          pressBackdrop(dialog(), { clientX: 10, clientY: 10 });
        },
      ],
    ] as const)('returns to the trigger on %s', async (_name, act) => {
      const user = userEvent.setup();
      await render(Host);
      await user.click(trigger());
      await screen.findByRole('dialog');
      await act(user);
      await closed();
      await waitFor(() => {
        expect(document.activeElement).toBe(trigger());
      });
    });
  });

  describe('scroll lock', () => {
    it('locks the page scroll while open and restores it on close and on destroy', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      expect(document.documentElement.style.overflow).toBe('');
      await user.click(trigger());
      await screen.findByRole('dialog');
      expect(document.documentElement.style.overflow).toBe('hidden');
      await user.keyboard('{Escape}');
      await closed();
      expect(document.documentElement.style.overflow).toBe('');
      await user.click(trigger());
      await screen.findByRole('dialog');
      expect(document.documentElement.style.overflow).toBe('hidden');
      fixture.destroy();
      expect(document.documentElement.style.overflow).toBe('');
      expect(document.querySelector('[popover="manual"]')).toBeNull();
    });

    it('keeps one lock for two open dialogs and releases it with the last', async () => {
      const user = userEvent.setup();
      await render(NESTED_DIALOGS, { imports });
      await user.click(screen.getByRole('button', { name: 'Outer' }));
      await screen.findByRole('dialog', { name: 'Outer dialog' });
      await user.click(screen.getByRole('button', { name: 'Inner' }));
      await screen.findByRole('dialog', { name: 'Inner dialog' });
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: 'Inner dialog' })).toBeNull();
      });
      expect(document.documentElement.style.overflow).toBe('hidden');
      await user.keyboard('{Escape}');
      await closed();
      expect(document.documentElement.style.overflow).toBe('');
    });
  });

  describe('nesting', () => {
    it('opens a dialog from a dialog inside the outer one; Escape closes the inner only and focus goes back to its trigger', async () => {
      const user = userEvent.setup();
      await render(NESTED_DIALOGS, { imports });
      await user.click(screen.getByRole('button', { name: 'Outer' }));
      const outer = await screen.findByRole('dialog', { name: 'Outer dialog' });
      await user.click(screen.getByRole('button', { name: 'Inner' }));
      const inner = await screen.findByRole('dialog', { name: 'Inner dialog' });
      expect(outer.contains(inner)).toBe(true);
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: 'Inner dialog' })).toBeNull();
      });
      expect(screen.getByRole('dialog', { name: 'Outer dialog' }).isConnected).toBe(true);
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Inner' }));
      });
      await user.keyboard('{Escape}');
      await closed();
    });

    it('nests a Popover opened inside the Dialog: its host is in the dialog, a press in it is inside, Escape closes it first', async () => {
      const user = userEvent.setup();
      await render(POPOVER_IN_DIALOG, { imports });
      await user.click(screen.getByRole('button', { name: 'Delete' }));
      const element = await screen.findByRole('dialog', { name: 'Delete project' });
      await user.click(screen.getByRole('button', { name: 'More' }));
      const popover = await screen.findByRole('dialog', { name: 'More options' });
      expect(element.contains(popover)).toBe(true);
      await user.click(screen.getByRole('button', { name: 'Inside popover' }));
      expect(screen.getByRole('dialog', { name: 'More options' }).isConnected).toBe(true);
      expect(screen.getByRole('dialog', { name: 'Delete project' }).isConnected).toBe(true);
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: 'More options' })).toBeNull();
      });
      expect(screen.getByRole('dialog', { name: 'Delete project' }).isConnected).toBe(true);
      await user.keyboard('{Escape}');
      await closed();
    });
  });

  describe('diagnostics', () => {
    it('warns once for a content without an accessible name, and not for one named by a Title', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const user = userEvent.setup();
      await render(
        `<ng-container cckDialog>
          <button cckDialogTrigger>Open</button>
          <ng-template cckDialogPortal><dialog cckDialogContent>Unnamed</dialog></ng-template>
        </ng-container>`,
        { imports },
      );
      await user.click(screen.getByRole('button', { name: 'Open' }));
      await screen.findByRole('dialog');
      await waitFor(() => {
        expect(warn).toHaveBeenCalledTimes(1);
      });
      expect(String(warn.mock.calls[0]?.[0])).toContain('DialogContent');
    });

    it('does not warn when a Title names the dialog', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const user = userEvent.setup();
      await render(Host);
      await user.click(trigger());
      await screen.findByRole('dialog');
      await frame();
      expect(warn).not.toHaveBeenCalled();
    });

    it('throws a clear error for a part outside the root', async () => {
      await expect(render(`<button cckDialogTrigger>Orphan</button>`, { imports })).rejects.toThrow(
        /cckDialogTrigger must be placed inside an element with cckDialog/,
      );
    });
  });
});

const NESTED_DIALOGS = `
  <ng-container cckDialog>
    <button cckDialogTrigger>Outer</button>
    <ng-template cckDialogPortal>
      <dialog cckDialogContent aria-label="Outer dialog">
        <ng-container cckDialog>
          <button cckDialogTrigger>Inner</button>
          <ng-template cckDialogPortal>
            <dialog cckDialogContent aria-label="Inner dialog"><button cckDialogClose>Done</button></dialog>
          </ng-template>
        </ng-container>
      </dialog>
    </ng-template>
  </ng-container>`;

const POPOVER_IN_DIALOG = `
  <ng-container cckDialog>
    <button cckDialogTrigger>Delete</button>
    <ng-template cckDialogPortal>
      <dialog cckDialogContent aria-label="Delete project">
        <ng-container cckPopover>
          <button cckPopoverTrigger>More</button>
          <ng-template cckPopoverPortal>
            <cck-popover-content aria-label="More options"><button>Inside popover</button></cck-popover-content>
          </ng-template>
        </ng-container>
      </dialog>
    </ng-template>
  </ng-container>`;
