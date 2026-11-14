import { Component, input, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckDir } from '@cocokits/angular-core';
import { menuMeta } from '@cocokits/machines/menu';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckMenuImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { item, trigger } from './queries';

@Component({
  selector: 'app-host',
  imports: [...CckMenuImports, CckDir],
  template: `
    <div cckDir [dir]="dir()">
      <ng-container cckMenu (closed)="log.push('closed:' + $event.reason)">
        <button cckMenuTrigger>Actions</button>
        <ng-template cckMenuPortal>
          <cck-menu-content>
            <cck-menu-item (triggered)="log.push('Edit')">Edit</cck-menu-item>
            <cck-menu-item (triggered)="log.push('Duplicate')">Duplicate</cck-menu-item>
            <hr />
            <cck-menu-item [disabled]="true" (triggered)="log.push('Move')">Move</cck-menu-item>
            <cck-menu-item (triggered)="log.push('Delete')">Delete</cck-menu-item>
            <cck-menu-item (triggered)="log.push('Éclair')">Éclair</cck-menu-item>
            <cck-menu-item (triggered)="log.push('Dup')">Dup two</cck-menu-item>
          </cck-menu-content>
        </ng-template>
      </ng-container>
    </div>
    <button>After</button>
  `,
})
class Host {
  readonly dir = input<'ltr' | 'rtl'>('ltr');
  readonly log: string[] = [];
}

@Component({
  imports: [...CckMenuImports],
  template: `
    <ng-container cckMenu>
      <button cckMenuTrigger>Actions</button>
      <ng-template cckMenuPortal>
        <cck-menu-content>
          @if (show()) {
            <cck-menu-item (triggered)="log.push('Edit')">Edit</cck-menu-item>
          }
          <cck-menu-item [disabled]="true">Move</cck-menu-item>
        </cck-menu-content>
      </ng-template>
    </ng-container>
  `,
})
class Removable {
  readonly show = signal(true);
  readonly log: string[] = [];
}

const focused = (name: string): Promise<void> =>
  waitFor(() => {
    expect(document.activeElement?.textContent.trim()).toBe(name);
  });

/** Lets the type-to-find buffer empty (500 ms). */
const pause = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 520);
  });

/** Opens the menu with the keys given on the focused trigger. */
async function openWith(keys: string): Promise<ReturnType<typeof userEvent.setup>> {
  const user = userEvent.setup();
  trigger().focus();
  await user.keyboard(keys);
  await screen.findByRole('menu');
  await waitFor(() => {
    expect(document.activeElement?.getAttribute('role')).toBe('menuitem');
  });
  return user;
}

describe.each(['ltr', 'rtl'] as const)('Menu keyboard (%s)', (dir) => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const start = (): ReturnType<typeof render<Host>> => render(Host, { inputs: { dir } });

  // One row of the meta keyboard table each, in its order.
  it.each([
    ['Enter, Space', 'Trigger', '{Enter}', 'Edit'],
    ['Enter, Space', 'Trigger', ' ', 'Edit'],
    ['ArrowDown', 'Trigger', '{ArrowDown}', 'Edit'],
    ['ArrowUp', 'Trigger', '{ArrowUp}', 'Dup two'],
  ] as const)('%s on the %s opens it (%j) and focuses %s', async (_row, _context, keys, first) => {
    await start();
    await openWith(keys);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    await focused(first);
  });

  it('the meta lists a row for each key row this file covers', () => {
    expect(menuMeta.keyboard.map((row) => `${row.key} | ${row.context}`)).toEqual([
      'Enter, Space | Trigger',
      'ArrowDown | Trigger',
      'ArrowUp | Trigger',
      'ArrowDown, ArrowUp | Menu',
      'Home, End | Menu',
      'Printable character | Menu',
      'Enter, Space | Menu item',
      'Escape | Menu',
      'Tab | Menu',
      'Shift+Tab | Menu',
    ]);
  });

  it('Enter and Space on the trigger close an open menu', async () => {
    await start();
    const user = await openWith('{Enter}');
    trigger().focus();
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  it('ArrowDown and ArrowUp move between the items, include the disabled one and wrap at both ends', async () => {
    await start();
    const user = await openWith('{ArrowDown}');
    await focused('Edit');
    const down = ['Duplicate', 'Move', 'Delete', 'Éclair', 'Dup two', 'Edit'];
    for (const name of down) {
      await user.keyboard('{ArrowDown}');
      await focused(name);
    }
    await user.keyboard('{ArrowUp}');
    await focused('Dup two');
    await user.keyboard('{ArrowUp}');
    await focused('Éclair');
  });

  it('Home and End focus the first and the last item', async () => {
    await start();
    const user = await openWith('{ArrowDown}');
    await user.keyboard('{End}');
    await focused('Dup two');
    await user.keyboard('{Home}');
    await focused('Edit');
  });

  it('a printable character moves to the next item with that text, case and accents ignored, disabled items included', async () => {
    await start();
    const user = await openWith('{ArrowDown}');
    await user.keyboard('d');
    await focused('Duplicate');
    await user.keyboard('d');
    await focused('Delete');
    await pause();
    await user.keyboard('m');
    await focused('Move');
    await pause();
    await user.keyboard('E');
    await focused('Éclair');
    await pause();
    await user.keyboard('e');
    await focused('Edit');
  });

  it('Space inside a running search extends it and does not run the item; Space alone runs it', async () => {
    const { fixture } = await start();
    const user = await openWith('{ArrowDown}');
    await user.keyboard('dup');
    await user.keyboard(' ');
    await user.keyboard('t');
    await focused('Dup two');
    expect(fixture.componentInstance.log).toEqual([]);
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeTruthy();
    });
  });

  it('Enter and Space run an enabled item and close the menu; nothing runs for a disabled one', async () => {
    const { fixture } = await start();
    const user = await openWith('{ArrowDown}');
    item('Move').focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(fixture.componentInstance.log).toEqual([]);
    expect(screen.queryByRole('menu')).not.toBeNull();
    item('Delete').focus();
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    expect(fixture.componentInstance.log).toEqual(['Delete', 'closed:item']);
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
    await user.keyboard('{Enter}');
    await screen.findByRole('menu');
    await focused('Edit');
    await user.keyboard(' ');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    expect(fixture.componentInstance.log).toEqual(['Delete', 'closed:item', 'Edit', 'closed:item']);
  });

  it('Enter and Space on the content after its focused item was removed run nothing', async () => {
    const { fixture } = await render(Removable);
    const user = userEvent.setup();
    trigger().focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('menu');
    await focused('Edit');
    fixture.componentInstance.show.set(false);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('menu'));
    });
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(fixture.componentInstance.log).toEqual([]);
    expect(screen.queryByRole('menu')).not.toBeNull();
  });

  it('Escape closes the menu and focuses the trigger', async () => {
    const { fixture } = await start();
    const user = await openWith('{ArrowDown}');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(fixture.componentInstance.log).toEqual(['closed:escape']);
  });

  it('Tab closes the menu and focuses the element after the trigger; Shift+Tab focuses the trigger', async () => {
    const { fixture } = await start();
    const user = await openWith('{ArrowDown}');
    await focused('Edit');
    await user.tab();
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
    });
    expect(screen.queryByRole('menu')).toBeNull();
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('menu');
    await focused('Edit');
    await user.tab({ shift: true });
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
    expect(fixture.componentInstance.log).toEqual(['closed:focus-out', 'closed:focus-out']);
  });

  it('leaves alone a key with Ctrl or Meta, and an unknown key', async () => {
    await start();
    const user = await openWith('{ArrowDown}');
    await user.keyboard('{Control>}d{/Control}');
    await user.keyboard('{Meta>}d{/Meta}');
    await user.keyboard('{F2}');
    await focused('Edit');
  });
});
