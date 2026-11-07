import { Component, Directive, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckDir } from '@cocokits/angular-core';
import { popoverAnatomy } from '@cocokits/machines/popover';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckPopoverImports, type PopoverChangeDetails } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { frame, trigger } from './queries';

const imports = [...CckPopoverImports, CckDir];
const { classes } = popoverAnatomy;

const SHARE = `
  <button id="before">Before</button>
  <ng-container cckPopover [(open)]="open" (opened)="details.push({ ...$event, value: true })" (closed)="details.push({ ...$event, value: false })">
    <button cckPopoverTrigger>Share</button>
    <ng-template cckPopoverPortal>
      <div cckPopoverContent aria-label="Share this page" [side]="side()" [align]="align()">
        <a href="#x">First</a>
        <button cckPopoverClose>Close</button>
      </div>
    </ng-template>
  </ng-container>
  <button id="after">After</button>
  <p id="empty">Empty space</p>`;

@Component({ imports, template: SHARE })
class Host {
  readonly open = signal(false);
  readonly side = signal<'top' | 'bottom' | 'start' | 'end'>('bottom');
  readonly align = signal<'start' | 'center' | 'end'>('center');
  readonly details: (PopoverChangeDetails & { value: boolean })[] = [];
}

const content = (): HTMLElement => screen.getByRole('dialog', { name: 'Share this page' });
function emptySpace(): HTMLElement {
  const element = document.getElementById('empty');
  if (!element) throw new Error('Expected the empty paragraph.');
  return element;
}

async function open(host: Host, fixture: { whenStable: () => Promise<unknown> }): Promise<void> {
  host.open.set(true);
  await fixture.whenStable();
  await screen.findByRole('dialog');
  await frame();
}

// A consumer directive that vetoes a click. It is listed after the popover directives in `imports`, the order in
// which a host click listener of the popover would run first and miss the veto.
@Directive({ selector: '[vetoClick]', host: { '(click)': 'veto($event)' } })
class VetoClick {
  protected veto(event: Event): void {
    event.preventDefault();
  }
}

@Component({
  imports: [...CckPopoverImports, VetoClick],
  template: ` <ng-container
    cckPopover
    (opened)="details.push({ ...$event, value: true })"
    (closed)="details.push({ ...$event, value: false })"
  >
    <button cckPopoverTrigger vetoClick>Share</button>
    <ng-template cckPopoverPortal>
      <div cckPopoverContent aria-label="Share this page">
        <button cckPopoverClose vetoClick>Close</button>
      </div>
    </ng-template>
  </ng-container>`,
})
class VetoHost {
  readonly details: (PopoverChangeDetails & { value: boolean })[] = [];
}

@Component({
  imports: [...CckPopoverImports],
  template: ` <ng-container
    cckPopover
    [(open)]="open"
    (opened)="details.push({ ...$event, value: true })"
    (closed)="details.push({ ...$event, value: false })"
  >
    <button cckPopoverTrigger (click)="$event.preventDefault()">Share</button>
    <ng-template cckPopoverPortal>
      <div cckPopoverContent aria-label="Share this page">
        <button cckPopoverClose (click)="$event.preventDefault()">Close</button>
      </div>
    </ng-template>
  </ng-container>`,
})
class TemplateVetoHost {
  readonly open = signal(false);
  readonly details: (PopoverChangeDetails & { value: boolean })[] = [];
}

describe('Popover veto', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is not opened by a click that a consumer directive on the trigger prevented', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(VetoHost);
    await user.click(trigger());
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(fixture.componentInstance.details).toEqual([]);
  });

  it('is not opened by a click that a template listener on the trigger prevented', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(TemplateVetoHost);
    await user.click(trigger());
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(fixture.componentInstance.details).toEqual([]);
  });

  it('is not closed by a click on Close that a template listener prevented', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(TemplateVetoHost);
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeNull();
    expect(fixture.componentInstance.details).toEqual([]);
  });
});

describe('Popover', () => {
  beforeEach(stubOverlayApis);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders no element for the root and a closed trigger without aria-controls', async () => {
    const { container } = await render(Host);
    expect(trigger().classList.contains(classes.trigger)).toBe(true);
    expect(trigger().getAttribute('type')).toBe('button');
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().getAttribute('data-state')).toBe('closed');
    expect(trigger().hasAttribute('aria-controls')).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(container.querySelector('.cck-popover')).toBeNull();
  });

  it('opens on click into the overlay container and links the trigger to the content', async () => {
    const user = userEvent.setup();
    const { container } = await render(Host);
    await user.click(trigger());
    const dialog = await screen.findByRole('dialog', { name: 'Share this page' });
    expect(container.contains(dialog)).toBe(false);
    expect(dialog.closest('[popover="manual"]')).not.toBeNull();
    expect(dialog.classList.contains(classes.content)).toBe(true);
    expect(dialog.getAttribute('data-state')).toBe('open');
    expect(dialog.getAttribute('data-side')).toBe('bottom');
    expect(dialog.getAttribute('data-align')).toBe('center');
    expect(dialog.getAttribute('tabindex')).toBe('-1');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(trigger().getAttribute('data-state')).toBe('open');
    expect(trigger().getAttribute('aria-controls')).toBe(dialog.id);
    expect(screen.getByRole('button', { name: 'Close' }).classList.contains(classes.close)).toBe(true);
  });

  it('toggles from the keyboard with Enter and Space and reports the reason', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    trigger().focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
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

  it('writes the resolved side and align from the content inputs', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.side.set('top');
    fixture.componentInstance.align.set('end');
    await open(fixture.componentInstance, fixture);
    expect(content().getAttribute('data-side')).toBe('top');
    expect(content().getAttribute('data-align')).toBe('end');
    expect(content().style.position).toBe('fixed');
  });

  it('keeps the model: two-way, and a write from the parent emits no details', async () => {
    const { fixture } = await render(Host);
    await open(fixture.componentInstance, fixture);
    expect(fixture.componentInstance.details).toEqual([]);
    fixture.componentInstance.open.set(false);
    await fixture.whenStable();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(fixture.componentInstance.details).toEqual([]);
  });

  describe('focus', () => {
    it('moves into the content on open: the first focusable element', async () => {
      const user = userEvent.setup();
      await render(Host);
      await user.click(trigger());
      await screen.findByRole('dialog');
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole('link', { name: 'First' }));
      });
    });

    it('moves to the content itself when it holds nothing focusable', async () => {
      const user = userEvent.setup();
      await render(
        `<ng-container cckPopover>
          <button cckPopoverTrigger>Open</button>
          <ng-template cckPopoverPortal><div cckPopoverContent aria-label="Plain">Text</div></ng-template>
        </ng-container>`,
        { imports },
      );
      await user.click(screen.getByRole('button', { name: 'Open' }));
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole('dialog', { name: 'Plain' }));
      });
    });

    it.each([
      ['Escape', async (user: ReturnType<typeof userEvent.setup>) => user.keyboard('{Escape}'), 'escape'],
      [
        'Close',
        async (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: 'Close' })),
        'close',
      ],
      [
        'an outside press on empty space',
        async (user: ReturnType<typeof userEvent.setup>) => user.click(emptySpace()),
        'outside-press',
      ],
    ] as const)('returns to the trigger on %s', async (_name, act, reason) => {
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      await user.click(trigger());
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole('link', { name: 'First' }));
      });
      await act(user);
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
      await waitFor(() => {
        expect(document.activeElement).toBe(trigger());
      });
      expect(fixture.componentInstance.details.at(-1)?.reason).toBe(reason);
    });

    it('keeps focus on another focusable element after an outside press on it', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      await user.click(trigger());
      await screen.findByRole('dialog');
      await user.click(screen.getByRole('button', { name: 'After' }));
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
      expect(fixture.componentInstance.details.at(-1)?.reason).toBe('outside-press');
    });

    it('closes with focus-out and leaves focus where it went when Tab passes the last focusable element', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      await user.click(trigger());
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole('link', { name: 'First' }));
      });
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));
      await user.tab();
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
      expect(fixture.componentInstance.details.at(-1)?.reason).toBe('focus-out');
    });

    it('sends Shift+Tab from the first focusable element back to the trigger and closes with focus-out', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      await user.click(trigger());
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole('link', { name: 'First' }));
      });
      await user.tab({ shift: true });
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
      expect(document.activeElement).toBe(trigger());
      expect(fixture.componentInstance.details.at(-1)?.reason).toBe('focus-out');
    });
  });

  describe('dismissal', () => {
    it('does not close on a press inside the content', async () => {
      const user = userEvent.setup();
      await render(Host);
      await user.click(trigger());
      await screen.findByRole('dialog');
      await user.click(content());
      expect(screen.getByRole('dialog').isConnected).toBe(true);
    });

    it('closes on a second click on the trigger with the reason trigger', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      await user.click(trigger());
      await screen.findByRole('dialog');
      await user.click(trigger());
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
      expect(fixture.componentInstance.details.map((d) => d.reason)).toEqual(['trigger', 'trigger']);
    });

    it('unmounts after the exit animation of the content has finished', async () => {
      const user = userEvent.setup();
      await render(Host);
      await user.click(trigger());
      const dialog = await screen.findByRole('dialog');
      let finish: () => void = () => undefined;
      const finished = new Promise<void>((resolve) => {
        finish = resolve;
      });
      dialog.getAnimations = () => [
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
      expect(trigger().getAttribute('aria-controls')).toBe(dialog.id);
      finish();
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
      expect(trigger().hasAttribute('aria-controls')).toBe(false);
    });
  });

  describe('nested popovers', () => {
    const nested = `
      <ng-container cckPopover>
        <button cckPopoverTrigger>Outer</button>
        <ng-template cckPopoverPortal>
          <div cckPopoverContent aria-label="Outer panel">
            <ng-container cckPopover>
              <button cckPopoverTrigger>Inner</button>
              <ng-template cckPopoverPortal>
                <div cckPopoverContent aria-label="Inner panel"><button>Deep</button></div>
              </ng-template>
            </ng-container>
          </div>
        </ng-template>
      </ng-container>`;

    it('treats a press inside the child as inside the parent and closes the child first on Escape', async () => {
      const user = userEvent.setup();
      await render(nested, { imports });
      await user.click(screen.getByRole('button', { name: 'Outer' }));
      await screen.findByRole('dialog', { name: 'Outer panel' });
      await user.click(screen.getByRole('button', { name: 'Inner' }));
      await screen.findByRole('dialog', { name: 'Inner panel' });
      await user.click(screen.getByRole('button', { name: 'Deep' }));
      expect(screen.getByRole('dialog', { name: 'Outer panel' }).isConnected).toBe(true);
      expect(screen.getByRole('dialog', { name: 'Inner panel' }).isConnected).toBe(true);
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: 'Inner panel' })).toBeNull();
      });
      expect(screen.getByRole('dialog', { name: 'Outer panel' }).isConnected).toBe(true);
    });
  });

  describe('RTL', () => {
    it('resolves start to the right side in a right-to-left subtree: data-side stays logical', async () => {
      const user = userEvent.setup();
      await render(
        `<div cckDir dir="rtl">
          <ng-container cckPopover>
            <button cckPopoverTrigger>Open</button>
            <ng-template cckPopoverPortal><div cckPopoverContent aria-label="L" side="start"><button>x</button></div></ng-template>
          </ng-container>
        </div>`,
        { imports },
      );
      await user.click(screen.getByRole('button', { name: 'Open' }));
      const dialog = await screen.findByRole('dialog');
      expect(dialog.closest('[popover="manual"]')?.getAttribute('dir')).toBe('rtl');
      expect(dialog.getAttribute('data-side')).toBe('start');
    });
  });

  describe('diagnostics', () => {
    it('warns once for a content without an accessible name', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const user = userEvent.setup();
      await render(
        `<ng-container cckPopover>
          <button cckPopoverTrigger>Open</button>
          <ng-template cckPopoverPortal><div cckPopoverContent>Unnamed</div></ng-template>
        </ng-container>`,
        { imports },
      );
      await user.click(screen.getByRole('button', { name: 'Open' }));
      await screen.findByRole('dialog');
      await waitFor(() => {
        expect(warn).toHaveBeenCalledTimes(1);
      });
      expect(String(warn.mock.calls[0]?.[0])).toContain('PopoverContent');
    });

    it('throws a clear error for a part outside the root', async () => {
      await expect(render(`<button cckPopoverTrigger>Orphan</button>`, { imports })).rejects.toThrow(
        /cckPopoverTrigger must be placed inside an element with cckPopover/,
      );
    });
  });

  it('removes the overlay and its listeners when the Popover is destroyed while open', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    await user.click(trigger());
    await screen.findByRole('dialog');
    fixture.destroy();
    expect(document.querySelector('[popover="manual"]')).toBeNull();
  });
});
