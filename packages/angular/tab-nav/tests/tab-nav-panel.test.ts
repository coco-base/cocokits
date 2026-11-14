import { signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckDir } from '@cocokits/angular-core';
import { tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CckTabNavImports } from '../index';

const imports = [...CckTabNavImports, CckDir];
const { classes } = tabNavAnatomy;

const clicked = vi.fn((event: Event) => {
  event.preventDefault();
});

beforeEach(() => {
  clicked.mockClear();
});

const tabs = (): HTMLElement[] => screen.getAllByRole('tab');
const stops = (): string[] =>
  tabs()
    .filter((link) => link.tabIndex === 0)
    .map((link) => link.textContent.trim());

function template(links: string): string {
  return `
    <nav cckTabNav aria-label="Project" [tabPanel]="panel">
      ${links}
    </nav>
    <cck-tab-nav-panel #panel="cckTabNavPanel" id="outlet"><p>Outlet</p></cck-tab-nav-panel>`;
}

const LINKS = `
  <a cckTabNavLink href="#a" [active]="active() === 'a'" (click)="clicked($event)">A</a>
  <a cckTabNavLink href="#b" [active]="active() === 'b'" (click)="clicked($event)">B</a>
  <a cckTabNavLink href="#c" [active]="active() === 'c'" disabled (click)="clicked($event)">C</a>
  <a cckTabNavLink href="#d" [active]="active() === 'd'" (click)="clicked($event)">D</a>`;

describe('TabNav with a linked panel', () => {
  it('turns the list into a tablist, the links into tabs and the panel into a labelled tabpanel', async () => {
    const active = signal<string | undefined>('b');
    await render(template(LINKS), { imports, componentProperties: { active, clicked } });
    expect(screen.getByRole('navigation', { name: 'Project' })).toBeTruthy();
    expect(document.querySelector(`.${classes.list}`)?.getAttribute('role')).toBe('tablist');
    expect(tabs().map((link) => link.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false', 'false']);
    for (const link of tabs()) {
      expect(link.getAttribute('aria-controls')).toBe('outlet');
      expect(link.hasAttribute('aria-current')).toBe(false);
    }
    const panel = screen.getByRole('tabpanel');
    expect(panel.id).toBe('outlet');
    expect(panel.className).toBe(classes.panel);
    expect(panel.getAttribute('tabindex')).toBe('0');
    expect(panel.getAttribute('aria-labelledby')).toBe(screen.getByRole('tab', { name: 'B' }).id);
    expect(screen.getByRole('tab', { name: 'B' }).id).not.toBe('');
  });

  it('keeps plain links without a panel', async () => {
    const active = signal<string | undefined>('b');
    await render(`<nav cckTabNav aria-label="Project">${LINKS}</nav>`, {
      imports,
      componentProperties: { active, clicked },
    });
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.getByRole('link', { name: 'B' }).getAttribute('aria-current')).toBe('page');
  });

  it('has one tab stop: the active link, else the first enabled link', async () => {
    const active = signal<string | undefined>(undefined);
    await render(template(LINKS.replace('>A</a>', ' disabled>A</a>')), {
      imports,
      componentProperties: { active, clicked },
    });
    expect(stops()).toEqual(['B']);
    expect(screen.getByRole('tabpanel').hasAttribute('aria-labelledby')).toBe(false);
    active.set('d');
    await waitFor(() => {
      expect(stops()).toEqual(['D']);
    });
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe(
      screen.getByRole('tab', { name: 'D' }).id,
    );
    active.set('b');
    await waitFor(() => {
      expect(stops()).toEqual(['B']);
    });
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe(
      screen.getByRole('tab', { name: 'B' }).id,
    );
    active.set(undefined);
    await waitFor(() => {
      expect(stops()).toEqual(['B']);
    });
    expect(screen.getByRole('tabpanel').hasAttribute('aria-labelledby')).toBe(false);
  });

  it('uses the id of a link as the label of the panel', async () => {
    await render(
      `<nav cckTabNav aria-label="x" [tabPanel]="panel"><a cckTabNavLink href="#a" active id="mine">A</a></nav>
       <cck-tab-nav-panel #panel="cckTabNavPanel"></cck-tab-nav-panel>`,
      { imports },
    );
    expect(screen.getByRole('tab').id).toBe('mine');
    const panel = screen.getByRole('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe('mine');
    expect(screen.getByRole('tab').getAttribute('aria-controls')).toBe(panel.id);
  });

  it('moves focus with the arrows, Home and End without activating, skipping a disabled link and wrapping', async () => {
    const user = userEvent.setup();
    const active = signal<string | undefined>('a');
    await render(template(LINKS), { imports, componentProperties: { active, clicked } });
    const link = (name: string): HTMLElement => screen.getByRole('tab', { name });
    link('A').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(link('B'));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(link('D'));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(link('A'));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(link('D'));
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(link('A'));
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(link('D'));
    expect(clicked).not.toHaveBeenCalled();
    expect(active()).toBe('a');
    expect(link('A').getAttribute('aria-selected')).toBe('true');
    expect(link('A').tabIndex).toBe(0);
  });

  it('flips the horizontal arrows in rtl', async () => {
    const user = userEvent.setup();
    const active = signal<string | undefined>('a');
    await render(`<div cckDir dir="rtl">${template(LINKS)}</div>`, {
      imports,
      componentProperties: { active, clicked },
    });
    screen.getByRole('tab', { name: 'A' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'B' }));
  });

  it('activates a link with Space without scrolling and leaves Enter to the link', async () => {
    const user = userEvent.setup();
    const active = signal<string | undefined>('a');
    await render(template(LINKS), { imports, componentProperties: { active, clicked } });
    const link = screen.getByRole('tab', { name: 'B' });
    link.focus();
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    link.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
    expect(clicked).toHaveBeenCalledTimes(1);
    await user.keyboard('{Enter}');
    expect(clicked).toHaveBeenCalledTimes(2);
  });

  it('does not activate a disabled link with Space', async () => {
    const active = signal<string | undefined>('a');
    await render(template(LINKS), { imports, componentProperties: { active, clicked } });
    const link = screen.getByRole('tab', { name: 'C' });
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.tabIndex).toBe(-1);
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    link.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
    expect(clicked).not.toHaveBeenCalled();
  });

  it('does not handle a key with Shift', async () => {
    const user = userEvent.setup();
    const active = signal<string | undefined>('a');
    await render(template(LINKS), { imports, componentProperties: { active, clicked } });
    screen.getByRole('tab', { name: 'A' }).focus();
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'A' }));
  });

  it('keeps the arrow keys of plain links native', async () => {
    const user = userEvent.setup();
    const active = signal<string | undefined>('a');
    await render(`<nav cckTabNav aria-label="Project">${LINKS}</nav>`, {
      imports,
      componentProperties: { active, clicked },
    });
    screen.getByRole('link', { name: 'A' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'A' }));
  });
});
