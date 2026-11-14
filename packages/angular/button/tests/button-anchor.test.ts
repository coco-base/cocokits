import { signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { buttonAnatomy } from '@cocokits/machines/button';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CckButtonImports } from '../index';

const imports = [...CckButtonImports];

/** Records every click on the link, as a consumer click listener on the host would. */
function track(link: HTMLElement): { consumer: ReturnType<typeof vi.fn>; events: Event[] } {
  const events: Event[] = [];
  const consumer = vi.fn((event: Event) => events.push(event));
  link.addEventListener('click', consumer);
  return { consumer, events };
}

describe('CckButtonAnchor', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('renders the class and no type, and stays a link', async () => {
    await render(`<a cckButton href="#go">Go</a>`, { imports });
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link.className).toBe(buttonAnatomy.classes.root);
    expect(link.hasAttribute('type')).toBe(false);
    expect(link.hasAttribute('aria-disabled')).toBe(false);
    expect(link.hasAttribute('tabindex')).toBe(false);
    expect(link.hasAttribute('data-disabled')).toBe(false);
  });

  describe('enabled', () => {
    it('Enter follows the link: click is dispatched and not prevented', async () => {
      await render(`<a cckButton href="#go">Go</a>`, { imports });
      const link = screen.getByRole('link');
      const { events } = track(link);
      link.focus();
      await userEvent.setup().keyboard('{Enter}');
      expect(events).toHaveLength(1);
      expect(events[0]?.defaultPrevented).toBe(false);
    });

    it('Space does nothing', async () => {
      await render(`<a cckButton href="#go">Go</a>`, { imports });
      const link = screen.getByRole('link');
      const { consumer } = track(link);
      link.focus();
      await userEvent.setup().keyboard(' ');
      expect(consumer).not.toHaveBeenCalled();
    });

    it('Tab and Shift+Tab move focus into and out of the link', async () => {
      await render(`<input aria-label="before"><a cckButton href="#go">Go</a><input aria-label="after">`, { imports });
      const user = userEvent.setup();
      screen.getByLabelText('before').focus();
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('link'));
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText('after'));
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(screen.getByRole('link'));
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(screen.getByLabelText('before'));
    });
  });

  describe('disabled', () => {
    const template = `<input aria-label="before"><a cckButton href="#go" disabled>Go</a><input aria-label="after">`;

    it('sets the aria and data markers, keeps href', async () => {
      await render(template, { imports });
      const link = screen.getByRole('link');
      expect(link.getAttribute('aria-disabled')).toBe('true');
      expect(link.getAttribute('tabindex')).toBe('-1');
      expect(link.getAttribute('data-disabled')).toBe('');
      expect(link.getAttribute('href')).toBe('#go');
      expect(link.hasAttribute('type')).toBe(false);
    });

    it('is skipped by Tab and Shift+Tab', async () => {
      await render(template, { imports });
      const user = userEvent.setup();
      screen.getByLabelText('before').focus();
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText('after'));
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(screen.getByLabelText('before'));
    });

    it('click does not navigate and reaches no consumer listener on the host', async () => {
      const onClick = vi.fn();
      await render(`<a cckButton href="#go" disabled (click)="onClick()">Go</a>`, {
        imports,
        componentProperties: { onClick },
      });
      const link = screen.getByRole('link');
      const { consumer } = track(link);
      await userEvent.setup().click(link);
      expect(onClick).not.toHaveBeenCalled();
      expect(consumer).not.toHaveBeenCalled();
      expect(window.location.hash).not.toBe('#go');
    });

    it('Enter does not navigate and reaches no consumer listener', async () => {
      const onClick = vi.fn();
      await render(`<a cckButton href="#go" disabled (click)="onClick()">Go</a>`, {
        imports,
        componentProperties: { onClick },
      });
      const link = screen.getByRole('link');
      link.focus();
      await userEvent.setup().keyboard('{Enter}');
      expect(onClick).not.toHaveBeenCalled();
      expect(window.location.hash).not.toBe('#go');
    });

    it('the guard prevents the default of the click', async () => {
      await render(`<a cckButton href="#go" disabled>Go</a>`, { imports });
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      screen.getByRole('link').dispatchEvent(click);
      expect(click.defaultPrevented).toBe(true);
    });

    it('follows the disabled input and stops guarding when enabled', async () => {
      const disabled = signal(true);
      await render(`<a cckButton href="#go" [disabled]="disabled()">Go</a>`, {
        imports,
        componentProperties: { disabled },
      });
      const link = screen.getByRole('link');
      disabled.set(false);
      await screen.findByRole('link');
      expect(link.hasAttribute('aria-disabled')).toBe(false);
      expect(link.hasAttribute('tabindex')).toBe(false);
      const { consumer } = track(link);
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      expect(consumer).toHaveBeenCalledTimes(1);
    });
  });
});
