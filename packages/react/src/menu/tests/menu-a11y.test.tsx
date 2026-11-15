// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Menu } from '../index';
import { Example, expectFocus, item, menu, stubTopLayer, trigger } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

// A menu is no landmark: the page-level `region` rule asks for a landmark around every text outside one, which a
// test page with an overlay container does not have.
const noPageLandmarks = { rules: { region: { enabled: false } } };

describe('Menu accessibility (axe)', () => {
  it('has no violations while closed', async () => {
    const { container } = render(<Example />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no violations while open, with items, a separator and a disabled item', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    await expectFocus(item('Edit'));
    expect((await axe(document.body, noPageLandmarks)).violations).toEqual([]);
  });

  it('an author id on the trigger is rendered and names the menu', async () => {
    render(
      <Menu.Root>
        <Menu.Trigger id="mine">Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Edit</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );
    expect(trigger().id).toBe('mine');
    await userEvent.click(trigger());
    expect(menu()?.getAttribute('aria-labelledby')).toBe('mine');
    expect(screen.getByRole('menu', { name: 'Actions' })).toBe(menu());
  });

  it('names the menu by the trigger text and points the trigger at it', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    expect(screen.getByRole('menu', { name: 'Actions' })).toBe(menu());
    expect(trigger().getAttribute('aria-controls')).toBe(menu()?.id);
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
    expect(menu()?.hasAttribute('aria-orientation')).toBe(false);
  });
});

describe('Menu trigger name warning', () => {
  it('warns once in development when the trigger has no name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Menu.Root>
        <Menu.Trigger />
        <Menu.Content />
      </Menu.Root>,
    );
    await waitFor(() => {
      expect(warn).toHaveBeenCalledOnce();
    });
    expect(warn.mock.calls[0]?.[0]).toContain('Menu has no accessible name');
  });

  it('does not warn when the trigger has text or an aria-label', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <>
        <Menu.Root>
          <Menu.Trigger aria-label="More">...</Menu.Trigger>
          <Menu.Content />
        </Menu.Root>
        <Example />
      </>,
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(warn).not.toHaveBeenCalled();
  });
});
