import { Directive } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { describe, expect, it, vi } from 'vitest';
import { CckTabNavImports } from '../index';

const imports = [...CckTabNavImports];
const { classes } = tabNavAnatomy;

/** Stands in for `RouterLink`, which registers its own host `(click)` listener. */
@Directive({ selector: 'a[navigate]', host: { '(click)': 'go()' } })
class Navigate {
  static readonly navigated = vi.fn();
  go(): void {
    Navigate.navigated();
  }
}

const THREE = `
  <nav cckTabNav aria-label="Project">
    <a cckTabNavLink href="#overview" [active]="true">Overview</a>
    <a cckTabNavLink href="#activity">Activity</a>
    <a cckTabNavLink href="#settings" disabled>Settings</a>
  </nav>`;

describe('TabNav', () => {
  it('renders the nav, one list with the links and one decorative indicator, with the anatomy classes', async () => {
    await render(THREE, { imports });
    const nav = screen.getByRole('navigation', { name: 'Project' });
    expect(nav.tagName).toBe('NAV');
    expect(nav.classList.contains(classes.root)).toBe(true);
    const list = nav.querySelector(`.${classes.list}`);
    expect(list?.tagName).toBe('DIV');
    expect(list?.querySelectorAll(`a.${classes.link}`)).toHaveLength(3);
    const indicators = nav.querySelectorAll(`.${classes.indicator}`);
    expect(indicators).toHaveLength(1);
    expect(indicators[0].tagName).toBe('SPAN');
    expect(indicators[0].getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps aria-label on the nav and puts no tab roles on anything', async () => {
    await render(THREE, { imports });
    expect(document.querySelector('nav')?.getAttribute('aria-label')).toBe('Project');
    expect(document.querySelector('[role]')).toBeNull();
  });

  it('marks only the active link with aria-current="page" and data-active', async () => {
    await render(THREE, { imports });
    const [overview, activity] = screen.getAllByRole('link');
    expect(overview.getAttribute('aria-current')).toBe('page');
    expect(overview.hasAttribute('data-active')).toBe(true);
    expect(activity.hasAttribute('aria-current')).toBe(false);
    expect(activity.hasAttribute('data-active')).toBe(false);
  });

  it('follows a change of active', async () => {
    const { rerender } = await render(
      `<nav cckTabNav aria-label="p"><a cckTabNavLink href="#a" [active]="on">A</a></nav>`,
      { imports, componentProperties: { on: false } },
    );
    expect(screen.getByRole('link').hasAttribute('aria-current')).toBe(false);
    await rerender({ componentProperties: { on: true } });
    expect(screen.getByRole('link').getAttribute('aria-current')).toBe('page');
  });

  it('renders a disabled link with aria-disabled, data-disabled, tabindex -1 and its href', async () => {
    await render(THREE, { imports });
    const settings = screen.getByRole('link', { name: 'Settings' });
    expect(settings.getAttribute('aria-disabled')).toBe('true');
    expect(settings.hasAttribute('data-disabled')).toBe(true);
    expect(settings.getAttribute('tabindex')).toBe('-1');
    expect(settings.getAttribute('href')).toBe('#settings');
    expect(settings.hasAttribute('disabled')).toBe(false);
  });

  it('prevents the activation of a disabled link, also for a consumer (click) and a router link', async () => {
    const onClick = vi.fn();
    Navigate.navigated.mockClear();
    await render(
      `<nav cckTabNav aria-label="p"><a cckTabNavLink navigate href="#x" disabled (click)="onClick()">X</a></nav>`,
      { imports: [...imports, Navigate], componentProperties: { onClick } },
    );
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    screen.getByRole('link').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
    expect(Navigate.navigated).not.toHaveBeenCalled();
  });

  it('lets an enabled link reach a consumer (click) and a router link', async () => {
    const onClick = vi.fn();
    Navigate.navigated.mockClear();
    await render(`<nav cckTabNav aria-label="p"><a cckTabNavLink navigate href="#x" (click)="onClick()">X</a></nav>`, {
      imports: [...imports, Navigate],
      componentProperties: { onClick },
    });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    screen.getByRole('link').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(Navigate.navigated).toHaveBeenCalledTimes(1);
  });

  it('moves focus with Tab through the enabled links only, in order', async () => {
    const user = userEvent.setup();
    await render(THREE, { imports });
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Overview' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Activity' }));
    await user.tab();
    expect(document.activeElement).not.toBe(screen.getByRole('link', { name: 'Settings' }));
  });

  it('follows an enabled link with Enter, reaching a consumer (click) and a router link', async () => {
    Navigate.navigated.mockClear();
    const onClick = vi.fn();
    const user = userEvent.setup();
    await render(`<nav cckTabNav aria-label="p"><a cckTabNavLink navigate href="#x" (click)="onClick()">X</a></nav>`, {
      imports: [...imports, Navigate],
      componentProperties: { onClick },
    });
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link'));
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(Navigate.navigated).toHaveBeenCalledTimes(1);
  });

  it('does not rove: arrow keys leave the focus on the link', async () => {
    const user = userEvent.setup();
    await render(THREE, { imports });
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Overview' }));
  });

  it('throws a clear error for a link outside a TabNav', async () => {
    await expect(render(`<a cckTabNavLink href="#x">X</a>`, { imports })).rejects.toThrow(/cckTabNav/);
  });

  it('warns in development when the nav has no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(`<nav cckTabNav><a cckTabNavLink href="#x">X</a></nav>`, { imports });
    expect(warn).toHaveBeenCalledWith(
      'CocoKits: a TabNav has no accessible name. Add an aria-label, or an aria-labelledby that points to an element with text, to the element with cckTabNav.',
    );
    warn.mockRestore();
  });

  it('does not warn when the nav is named', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(THREE, { imports });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
