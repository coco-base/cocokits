import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { menuAnatomy, menuMeta } from '@cocokits/machines/menu';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckMenuImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { item, trigger } from './queries';

const { classes } = menuAnatomy;

@Component({
  imports: [...CckMenuImports],
  template: `
    <ng-container cckMenu>
      <button cckMenuTrigger data-testid="trigger" title="Actions" class="own">Actions</button>
      <ng-template cckMenuPortal>
        <cck-menu-content class="mine" data-extra="x">
          <cck-menu-item>Rename</cck-menu-item>
          <hr />
          @for (name of names(); track name) {
            <cck-menu-item [disabled]="name === 'Move'" data-own="y">{{ name }}</cck-menu-item>
          }
        </cck-menu-content>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly names = signal(['Move', 'Delete']);
}

const tabStops = (): string[] =>
  screen
    .getAllByRole('menuitem')
    .filter((element) => element.getAttribute('tabindex') === '0')
    .map((element) => element.textContent.trim());

const expectStop = (name: string): Promise<void> =>
  waitFor(() => {
    expect(tabStops()).toEqual([name]);
  });

const dataNames = (element: Element, own: string[]): string[] =>
  element.getAttributeNames().filter((name) => name.startsWith('data-') && !own.includes(name));

describe('Menu anatomy', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders no element for the root and only the trigger while closed, nothing in the overlay container', async () => {
    const { container } = await render(Host);
    const button = trigger();
    expect(button.tagName).toBe('BUTTON');
    expect(button.className).toContain(classes.trigger);
    expect(button.className).toContain('own');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBeNull();
    expect(button.getAttribute('data-state')).toBe('closed');
    expect(button.getAttribute('title')).toBe('Actions');
    expect(container.querySelectorAll('[cckmenu]')).toHaveLength(0);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.querySelector('[popover]')).toBeNull();
  });

  it('renders the content and the items in the portal, with classes, roles and ARIA', async () => {
    const user = userEvent.setup();
    const { container } = await render(Host);
    await user.click(trigger());
    const menu = await screen.findByRole('menu', { name: 'Actions' });
    expect(menu.tagName).toBe('CCK-MENU-CONTENT');
    expect(menu.className).toContain(classes.content);
    expect(menu.className).toContain('mine');
    expect(menu.getAttribute('tabindex')).toBe('-1');
    expect(menu.getAttribute('data-extra')).toBe('x');
    expect(menu.getAttribute('data-state')).toBe('open');
    expect(menu.getAttribute('data-side')).toBe('bottom');
    expect(menu.getAttribute('data-align')).toBe('start');
    expect(menu.getAttribute('aria-labelledby')).toBe(trigger().id);
    expect(container.contains(menu)).toBe(false);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(trigger().getAttribute('aria-controls')).toBe(menu.id);
    expect(trigger().getAttribute('data-state')).toBe('open');
    const items = screen.getAllByRole('menuitem');
    expect(items.map((element) => element.tagName)).toEqual(['CCK-MENU-ITEM', 'CCK-MENU-ITEM', 'CCK-MENU-ITEM']);
    for (const element of items) expect(element.className).toContain(classes.item);
    expect(item('Move').getAttribute('aria-disabled')).toBe('true');
    expect(item('Move').hasAttribute('data-disabled')).toBe(true);
    expect(item('Rename').getAttribute('aria-disabled')).toBeNull();
    expect(item('Rename').hasAttribute('data-disabled')).toBe(false);
    expect(item('Delete').getAttribute('data-own')).toBe('y');
  });

  it('emits only data attributes the meta lists', async () => {
    const user = userEvent.setup();
    await render(Host);
    await user.click(trigger());
    const menu = await screen.findByRole('menu');
    expect(dataNames(trigger(), ['data-testid']).every((name) => menuMeta.dataAttrs.trigger.includes(name))).toBe(true);
    expect(dataNames(menu, ['data-extra']).every((name) => menuMeta.dataAttrs.content.includes(name))).toBe(true);
    expect(dataNames(item('Move'), ['data-own']).every((name) => menuMeta.dataAttrs.item.includes(name))).toBe(true);
  });

  it('has exactly one tab stop; it follows focus and falls back to the first item when the active one goes', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    await user.click(trigger());
    await screen.findByRole('menu');
    await waitFor(() => {
      expect(document.activeElement).toBe(item('Rename'));
    });
    await expectStop('Rename');
    await user.keyboard('{ArrowDown}');
    await expectStop('Move');
    item('Delete').focus();
    await expectStop('Delete');
    await user.click(item('Move'));
    await expectStop('Move');
    item('Delete').focus();
    await expectStop('Delete');
    fixture.componentInstance.names.set(['Move']);
    await fixture.whenStable();
    await expectStop('Rename');
  });
});
