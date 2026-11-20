import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { CckDividerImports } from '@cocokits/angular/divider';
import { CckMenuImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { trigger } from './queries';

/** The open menu sits outside any landmark, because a component test has no page around it. */
const WITHOUT_REGION = { rules: { region: { enabled: false } } };

const imports = [...CckMenuImports, ...CckDividerImports];

const MENU = `
  <ng-container cckMenu>
    <button cckMenuTrigger [attr.aria-label]="label">Actions</button>
    <ng-template cckMenuPortal>
      <cck-menu-content>
        <cck-menu-item>Rename</cck-menu-item>
        <hr cckDivider />
        <cck-menu-item [disabled]="true">Move</cck-menu-item>
        <cck-menu-item>Delete</cck-menu-item>
      </cck-menu-content>
    </ng-template>
  </ng-container>`;

describe('Menu accessibility', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has no axe violations closed or open, with a Divider and a disabled item, checked on the whole document', async () => {
    const user = userEvent.setup();
    await render(MENU, { imports, componentProperties: { label: null } });
    expect((await axe(document.body)).violations).toEqual([]);
    await user.click(trigger());
    await screen.findByRole('menu', { name: 'Actions' });
    expect(screen.getAllByRole('separator')).toHaveLength(1);
    expect((await axe(document.body, WITHOUT_REGION)).violations).toEqual([]);
  });

  it('names the menu by the trigger text, and an aria-label on the content wins', async () => {
    const user = userEvent.setup();
    await render(
      `<ng-container cckMenu>
        <button cckMenuTrigger>Actions</button>
        <ng-template cckMenuPortal><cck-menu-content aria-label="Row actions"><cck-menu-item>Edit</cck-menu-item></cck-menu-content></ng-template>
      </ng-container>`,
      { imports },
    );
    await user.click(trigger());
    expect(await screen.findByRole('menu', { name: 'Row actions' })).toBeTruthy();
    expect(screen.getByRole('menu').getAttribute('aria-labelledby')).toBeNull();
  });

  it('names the menu by the id of an author id on the trigger', async () => {
    const user = userEvent.setup();
    await render(
      `<ng-container cckMenu>
        <button cckMenuTrigger id="mine">Actions</button>
        <ng-template cckMenuPortal><cck-menu-content><cck-menu-item>Edit</cck-menu-item></cck-menu-content></ng-template>
      </ng-container>`,
      { imports },
    );
    await user.click(trigger());
    const menu = await screen.findByRole('menu', { name: 'Actions' });
    expect(trigger().id).toBe('mine');
    expect(menu.getAttribute('aria-labelledby')).toBe('mine');
  });

  it('keeps a static aria-labelledby on the content and names the menu by it', async () => {
    const user = userEvent.setup();
    await render(
      `<span id="label">Row menu</span>
      <ng-container cckMenu>
        <button cckMenuTrigger>Actions</button>
        <ng-template cckMenuPortal><cck-menu-content aria-labelledby="label"><cck-menu-item>Edit</cck-menu-item></cck-menu-content></ng-template>
      </ng-container>`,
      { imports },
    );
    await user.click(trigger());
    const menu = await screen.findByRole('menu', { name: 'Row menu' });
    expect(menu.getAttribute('aria-labelledby')).toBe('label');
  });

  it('a bound aria-label names the menu and no aria-labelledby is rendered', async () => {
    const user = userEvent.setup();
    await render(
      `<ng-container cckMenu>
        <button cckMenuTrigger>Actions</button>
        <ng-template cckMenuPortal><cck-menu-content [attr.aria-label]="name"><cck-menu-item>Edit</cck-menu-item></cck-menu-content></ng-template>
      </ng-container>`,
      { imports, componentProperties: { name: 'Bound name' } },
    );
    await user.click(trigger());
    const menu = await screen.findByRole('menu', { name: 'Bound name' });
    await waitFor(() => {
      expect(menu.getAttribute('aria-labelledby')).toBeNull();
    });
  });

  it('warns once in development when the trigger has no name', async () => {
    const user = userEvent.setup();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(
      `<ng-container cckMenu>
        <button cckMenuTrigger></button>
        <ng-template cckMenuPortal><cck-menu-content><cck-menu-item>Edit</cck-menu-item></cck-menu-content></ng-template>
      </ng-container>`,
      { imports },
    );
    await user.click(screen.getByRole('button'));
    await screen.findByRole('menu');
    const warnings = warn.mock.calls.filter(([message]) =>
      String(message).includes('MenuContent has no accessible name'),
    );
    expect(warnings).toHaveLength(1);
  });

  it('warns in development when the portal has no trigger', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(
      `<ng-container cckMenu><ng-template cckMenuPortal><cck-menu-content aria-label="x">x</cck-menu-content></ng-template></ng-container>`,
      { imports },
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('CocoKits: a MenuPortal has no MenuTrigger'));
  });
});
