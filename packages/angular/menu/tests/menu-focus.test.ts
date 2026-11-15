import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckMenuImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { frame, item, trigger } from './queries';

@Component({
  imports: [...CckMenuImports],
  template: `
    <button>Before</button>
    <ng-container cckMenu [(open)]="open">
      <button cckMenuTrigger>Actions</button>
      <ng-template cckMenuPortal>
        <cck-menu-content>
          @for (name of names(); track name) {
            <cck-menu-item [disabled]="name === 'Move'" (triggered)="prevent() && $event.preventDefault()">
              {{ name }}
            </cck-menu-item>
          }
        </cck-menu-content>
      </ng-template>
    </ng-container>
    <button>After</button>
    <p>Empty space</p>
  `,
})
class Host {
  readonly open = signal(false);
  readonly prevent = signal(false);
  readonly names = signal(['Edit', 'Move', 'Delete']);
}

type Page = ReturnType<typeof userEvent.setup>;
interface Context {
  readonly host: Host;
  readonly user: Page;
  readonly fixture: { whenStable: () => Promise<unknown> };
}
interface Row {
  readonly name: string;
  /** Where focus is before the change: an item, the content (a menu without items) or an element outside. */
  readonly before: 'Edit' | 'Move' | 'content' | 'outside';
  readonly change: (context: Context) => Promise<void>;
  /** Where focus is after: an item, the trigger, the content or the element the row names. */
  readonly after: () => HTMLElement;
  readonly open: boolean;
  readonly prevent?: boolean;
}

const button = (name: string): HTMLElement => screen.getByRole('button', { name });
const content = (): HTMLElement => screen.getByRole('menu');

const rows: readonly Row[] = [
  {
    name: 'click on an enabled item',
    before: 'Edit',
    open: false,
    after: trigger,
    change: ({ user }) => user.click(item('Edit')),
  },
  {
    name: 'Enter on an enabled item',
    before: 'Edit',
    open: false,
    after: trigger,
    change: ({ user }) => user.keyboard('{Enter}'),
  },
  {
    name: 'Space on an enabled item',
    before: 'Edit',
    open: false,
    after: trigger,
    change: ({ user }) => user.keyboard(' '),
  },
  {
    name: 'click with preventDefault',
    before: 'Edit',
    open: true,
    prevent: true,
    after: () => item('Edit'),
    change: ({ user }) => user.click(item('Edit')),
  },
  {
    name: 'Enter with preventDefault',
    before: 'Edit',
    open: true,
    prevent: true,
    after: () => item('Edit'),
    change: ({ user }) => user.keyboard('{Enter}'),
  },
  {
    name: 'Space with preventDefault',
    before: 'Edit',
    open: true,
    prevent: true,
    after: () => item('Edit'),
    change: ({ user }) => user.keyboard(' '),
  },
  {
    name: 'click on a disabled item',
    before: 'Move',
    open: true,
    after: () => item('Move'),
    change: ({ user }) => user.click(item('Move')),
  },
  {
    name: 'Enter on a disabled item',
    before: 'Move',
    open: true,
    after: () => item('Move'),
    change: ({ user }) => user.keyboard('{Enter}'),
  },
  {
    name: 'Space on a disabled item',
    before: 'Move',
    open: true,
    after: () => item('Move'),
    change: ({ user }) => user.keyboard(' '),
  },
  {
    name: 'Escape from an item',
    before: 'Edit',
    open: false,
    after: trigger,
    change: ({ user }) => user.keyboard('{Escape}'),
  },
  {
    name: 'Escape from the content',
    before: 'content',
    open: false,
    after: trigger,
    change: ({ user }) => user.keyboard('{Escape}'),
  },
  {
    name: 'Tab from an item',
    before: 'Edit',
    open: false,
    after: () => button('After'),
    change: ({ user }) => user.tab(),
  },
  {
    name: 'Shift+Tab from an item',
    before: 'Edit',
    open: false,
    after: trigger,
    change: ({ user }) => user.tab({ shift: true }),
  },
  {
    name: 'a press on empty space',
    before: 'Edit',
    open: false,
    after: trigger,
    change: ({ user }) => user.click(screen.getByText('Empty space')),
  },
  {
    name: 'a press on a focusable element outside',
    before: 'Edit',
    open: false,
    after: () => button('After'),
    change: ({ user }) => user.click(button('After')),
  },
  {
    name: 'a click on the trigger',
    before: 'Edit',
    open: false,
    after: trigger,
    change: ({ user }) => user.click(trigger()),
  },
  {
    name: 'the parent closing, focus on an item',
    before: 'Edit',
    open: false,
    after: trigger,
    change: ({ host, fixture }) => {
      host.open.set(false);
      return fixture.whenStable().then(() => undefined);
    },
  },
  {
    name: 'the parent closing, focus on the content',
    before: 'content',
    open: false,
    after: trigger,
    change: ({ host, fixture }) => {
      host.open.set(false);
      return fixture.whenStable().then(() => undefined);
    },
  },
  {
    name: 'the author removing the focused item',
    before: 'Edit',
    open: true,
    after: content,
    change: ({ host, fixture }) => {
      host.names.set(['Move', 'Delete']);
      return fixture.whenStable().then(() => undefined);
    },
  },
  {
    name: 'the parent closing, focus outside moved there by script',
    before: 'outside',
    open: false,
    after: () => button('After'),
    change: ({ host, fixture }) => {
      host.open.set(false);
      return fixture.whenStable().then(() => undefined);
    },
  },
];

describe('Menu focus', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(rows)('$name', async (row) => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    if (row.before === 'content') host.names.set([]);
    host.open.set(true);
    await fixture.whenStable();
    await screen.findByRole('menu');
    if (row.before === 'content') {
      await waitFor(() => {
        expect(document.activeElement).toBe(content());
      });
    } else if (row.before === 'outside') {
      await frame();
      button('After').focus();
    } else {
      await waitFor(() => {
        expect(document.activeElement).toBe(item('Edit'));
      });
      item(row.before).focus();
    }
    host.prevent.set(row.prevent === true);
    await row.change({ host, user, fixture });
    await waitFor(() => {
      expect(host.open()).toBe(row.open);
      if (!row.open) expect(screen.queryByRole('menu')).toBeNull();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(row.after());
    });
    await frame();
    expect(document.activeElement).toBe(row.after());
  });
});
